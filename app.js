const express = require('express')
const ejs = require('express-ejs-layouts')
const session = require('cookie-session')

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

const authenticated = function(req, res, next) {
  if (req.session.user) {
    firebase.auth().getUser(req.session.user)
      .then((record) => {
        req.user = record
        next()
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
      firebase.auth().updateUser(user.id, {
        displayName: user.name,
        photoURL: user.image_72
      })
        .then((record) => {
          resolve(record)
        }, (error) => {
          firebase.auth().createUser({
            uid: user.id,
            displayName: user.name,
            photoURL: user.image_72
          })
            .then((record) => {
              resolve(record)
            })
        })
        .catch((error) => {
          reject(error)
        })
    }
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
    .then(function(user) {
      req.session.user = user.uid
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

app.get('/dashboard', function(req, res) {
  res.render('dashboard', { user: req.user })
})

app.listen(port)
