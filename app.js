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
    res.redirect(301, "https://" + req.headers.host + req.originalUrl)
  } else {
    next()
  }
}

const upsertUser = function(token) {
  var user = token.user
  var promise = new Promise(function(resolve, reject) {
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

  return promise
}

const port = process.env.PORT || 3000
const app = express()

app.set('view engine', 'ejs')
app.set('trust proxy', app.get('env') != 'development')
app.use(express.static(__dirname + '/public'))
app.use(forceSSL);
app.use(session({
  secret: process.env.SESSION_SECRET,
  secure: app.get('env') != 'development'
}))

app.get('/', function(req, res) {
  const organizers = [
    {
      id: 1,
      name: "Michie Ang",
      imageURL: "img/organizers/michie.png"
    },
    {
      id: 2,
      name: "Joy Paas",
      imageURL: "img/organizers/joy.jpg"
    },
    {
      id: 3,
      name: "Steffi Tan",
      imageURL: "img/organizers/steffi.jpg"
    },
    {
      id: 4,
      name: "Joseph Baldemor",
      imageURL: "img/organizers/joseph.jpg"
    },
    {
      id: 5,
      name: "Jeykle Sunas",
      imageURL: "img/organizers/jeykle.png"
    },
    {
      id: 6,
      name: "Micaela Reyes",
      imageURL: "img/organizers/micaela.jpg"
    },
    {
      id: 7,
      name: "Mars Gabutero",
      imageURL: "img/organizers/mars.jpg"
    },
    {
      id: 8,
      name: "Clau Yagyagan",
      imageURL: "img/organizers/clau.png"
    }]

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

  const platinum_advocate = [
    {
      id: 1,
      name: "Atlassian",
      url: "https://atlassian.com",
      imageURL: "img/supporters/company/Atlassian_Logo.svg"
    }]

  const inspire = [
    {
      id: 1,
      name: "Accenture",
      url: "https://accenture.com",
      imageURL: "img/supporters/company/accenture.png"
    }]

  const nourish = [
    {
      id: 1,
      name: "Zendesk",
      url: "https://zendesk.com",
      imageURL: "img/supporters/company/zendesk-125.png"
    },
    {
      id: 2,
      name: "Migo",
      url: "https://www.migo.tv",
      imageURL: "img/supporters/company/Migo_Logo.png"
    }]

  const sustain = [
    {
      id: 1,
      name: "You",
      url: "https://womenwhocode.com",
      imageURL: ""
    }]

  const support = [
    {
      id: 1,
      name: "You",
      url: "https://womenwhocode.com",
      imageURL: ""
    }]

  const kiddie_hackathon = [
    {
      id: 1,
      name: "Power Mac Center",
      url: "http://www.powermaccenter.com",
      imageURL: "img/supporters/company/PMC.jpg"
    }]

  const media_partners = [
    {
      id: 1,
      name: "Manila Bulletin",
      url: "https://mb.com.ph",
      imageURL: "img/supporters/media/mb_logo.jpg"
    },
    {
      id: 2,
      name: "e27",
      url: "https://e27.co",
      imageURL: "img/supporters/media/e27.png"
    }]

  const community_partners = [
    {
      id: 1,
      name: "PyLadies",
      url: "https://www.meetup.com/pyladiesmanila/",
      imageURL: "img/supporters/community/PyLadies.jpg"
    },
    {
      id: 2,
      name: "Coding Girls",
      url: "https://www.facebook.com/coding.girls.manila//",
      imageURL: "img/supporters/community/coding_girls.png"
    },
    {
      id: 3,
      name: "PythonPH",
      url: "https://python.ph/",
      imageURL: "img/supporters/community/PythonPH.png"
    },
    {
      id: 4,
      name: "VRPH",
      url: "https://www.facebook.com/vrphilippines/",
      imageURL: "img/supporters/community/VRPH_Logo.png"
    },
    {
      id: 5,
      name: "SwiftPH",
      url: "http://Swift.PH",
      imageURL: "img/supporters/community/SwiftPH_Logo.png"
    },
    {
      id: 6,
      name: "Philippine Android Developer Community (PADC)",
      url: "http://facebook.com/padcsummit/",
      imageURL: "img/supporters/community/PADC.png"
    },
    {
      id: 7,
      name: "Philippine Web Designer (PWDO)",
      url: "http://facebook.com/padcsummit/",
      imageURL: "img/supporters/community/pwdo.png"
    },
    {
      id: 8,
      name: "Drupal Philippines",
      url: "https://groups.drupal.org/philippines",
      imageURL: "img/supporters/community/Drupal.png"
    },
    {
      id: 9,
      name: "LaravelPH",
      url: "https://www.facebook.com/laravelph",
      imageURL: "img/supporters/community/LaravelPH.png"
    }
  ]

  const special_thanks = [
    {
      id: 1,
      name: "Pez.ai",
      url: "https://pez.ai",
      imageURL: "img/supporters/special_thanks/pez.png"
    }]

  res.render('supporters', { platinum_advocate: platinum_advocate, inspire: inspire, nourish: nourish, sustain: sustain, support: support, kiddie_hackathon: kiddie_hackathon, media_partners: media_partners, community_partners: community_partners, special_thanks: special_thanks })
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
    scope: 'identity.basic,identity.avatar'
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
