const dotenv = require('dotenv').config()
const express = require('express')
const ejs = require('express-ejs-layouts')
const session = require('cookie-session')
const bodyParser = require('body-parser')

const oauth2 = require('simple-oauth2').create({
  client: {
    id: process.env.SLACK_CLIENT_ID,
    secret: process.env.SLACK_CLIENT_SECRET
  },
  auth: {
    tokenHost: 'https://slack.com',
    authorizePath: '/oauth/authorize',
    tokenPath: '/api/oauth.access'
  }
})

const firebase = require('firebase-admin')
firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
})

const getUserTeam = function(user) {
  if (!user.type || user.type.match(/^participant$/i)) {
    // TODO: Lookup team
    return null
  } else if (user.type.match(/^organizer$/i)) {
    return "Organizers"
  } else if (user.type.match(/^volunteer$/i)) {
    return "Volunteers"
  } else if (user.type.match(/^mentor$/i)) {
    return "Mentors"
  } else if (user.type.match(/^supporter$/i)) {
    return "Supporters"
  } else if (user.type.match(/^media$/i)) {
    return "Media"
  }
}

const authenticated = function(req, res, next) {
  if (req.session.user) {
    firebase.auth().getUser(req.session.user)
      .then((record) => {
        req.user = record
        firebase.database().ref("users").child(record.uid).once("value")
          .then((record) => {
            req.user.firebase = record.val()
            req.user.team = getUserTeam(req.user.firebase)
            next()
          })
      })
      .catch((error) => {
        next(error)
      })
  } else {
    res.redirect('/login')
  }
}

const forceSSL = function(req, res, next) {
  var insecure = req.headers['x-forwarded-proto'] != 'https'

  if (app.get('env') != 'development' && insecure) {
    res.redirect(301, "https://" + req.headers['host'] + req.originalUrl)
  } else {
    next()
  }
}

const upsertUser = function(token) {
  var user = token.user

  return new Promise(function(resolve, reject) {
    if (token.error || user == null || user.id == null) {
      reject(token.error)
    } else {
      firebase.auth().getUserByEmail(user.email)
        .then((record) => {
          firebase.auth().updateUser(record.uid, {
            displayName: user.name,
            photoURL: user.image_192
          })
            .then((record) => {
              resolve({ token: token, uid: record.uid })
            })
        }, (error) => {
          firebase.auth().createUser({
            email: user.email,
            emailVerified: true,
            displayName: user.name,
            photoURL: user.image_72
          })
            .then((record) => {
              resolve({ token: token, uid: record.uid })
            })
            .catch((error) => {
              reject(error)
            })
        })
        .catch((error) => {
          reject(error)
        })
    }
  })
}

const updateCustomFields = function(data) {
  var token = data.token
  var user = token.user

  return new Promise(function(resolve, reject) {
    var users = firebase.database().ref("users")

    users.child(data.uid).update({
      name: user.name,
      slack_id: user.id,
      email: user.email
    })
      .then(() => {
        resolve(data.uid)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

const port = process.env.PORT || 3000
const app = express()

const organizers = require('./data/organizers.json')
const supporters = require('./data/supporters.json')

app.set('view engine', 'ejs')
app.set('trust proxy', app.get('env') != 'development')
app.use(express.static(__dirname + '/public'))
app.use(forceSSL);
app.use(session({
  secret: process.env.SESSION_SECRET,
  secure: app.get('env') != 'development'
}))
app.use(bodyParser.urlencoded({
  extended: true
}))

app.get('/', function(req, res) {
  const mentors = [
    {
      id: 1,
      name: "You",
      imageURL: "https://www.shareicon.net/data/512x512/2015/10/04/112038_glasses_512x512.png"
    }]

  res.render('index', { organizers: organizers, mentors: mentors })
})

app.get('/participants', function(req, res) {
  res.render('participants')
})

app.get('/supporters', function(req, res) {
  res.render('supporters', { supporters: supporters })
})

app.get('/travel', function(req, res) {
  res.render('travel')
})

app.get('/coc', function(req, res) {
  res.render('coc')
})

app.get('/faq', function(req, res) {
  res.render('faq')
})

app.get(['/hackathon', '/join'], function(req, res) {
  res.render('join')
})

app.get('/login', function(req, res) {
  res.redirect(oauth2.authorizationCode.authorizeURL({
    redirect_uri: process.env.SLACK_REDIRECT_URI,
    scope: 'identity.basic,identity.email,identity.avatar',
    team: 'T78QY25EJ'
  }))
})

app.get('/auth', function(req, res, next) {
  const code = req.query.code
  const options = {
    code: code,
    redirect_uri: process.env.SLACK_REDIRECT_URI
  }

  oauth2.authorizationCode.getToken(options)
    .then(upsertUser)
    .then(updateCustomFields)
    .then(function(uid) {
      req.session.user = uid
      res.redirect('/dashboard')
    })
    .catch((error) => {
      next(error)
    })
})

app.get('/logout', function(req, res) {
  req.session = null
  res.redirect('/')
})

app.all('/dashboard', authenticated)
app.all('/dashboard/*', authenticated)
app.all('/devices', authenticated)
app.all('/devices/*', authenticated)

app.get('/dashboard', function(req, res) {
  const deviceIds = req.user.firebase.devices || []

  const devicePromises = deviceIds.map((deviceId) => {
    return new Promise((resolve) => {
      firebase.database().ref('devices').child(deviceId)
        .once('value', (record) => {
          var data = record.val()
          data.uid = deviceId
          resolve(data)
        })
    })
  })

  Promise.all(devicePromises)
    .then((devices) => {
      res.render('dashboard', { user: req.user, devices: devices })
    })
})

app.post('/devices', function(req, res) {
  const devices = firebase.database().ref('devices')
  const users = firebase.database().ref('users')
  const userUid = req.user.uid
  const userDevices = req.user.firebase.devices || []

  if (!req.user.firebase.nfc_tag) {
    const newDevice = devices.push({
      description: req.body.description,
      type: req.body.type,
      owner: userUid
    })

    userDevices.push(newDevice.key)

    users.child(userUid).update({
      devices: userDevices
    })
  }

  res.redirect('/dashboard')
})

app.delete('/devices/:deviceId', function(req, res) {
  const users = firebase.database().ref('users')
  const devices = firebase.database().ref('devices')

  const deviceIds = req.user.firebase.devices || []
  const deviceId = req.params.deviceId
  const deviceIndex = deviceIds.indexOf(deviceId)

  if (deviceIndex === -1 || req.user.firebase.nfc_tag) {
    // Return 303 status as workaround for DELETE redirection
    // Client will receive this as 200 though
    res.redirect(303, '/dashboard')
    return
  }

  deviceIds.splice(deviceIndex, 1)

  users.child(req.user.uid).update({
    devices: deviceIds
  })
    .then(() => {
      devices.child(deviceId).remove()
    })
    .then(() => {
      // Return 303 status as workaround for DELETE redirection
      // Client will receive this as 200 though
      res.redirect(303, '/dashboard')
    })
})

app.listen(port)
