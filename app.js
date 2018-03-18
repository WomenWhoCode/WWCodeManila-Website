const dotenv = require('dotenv').config()
const express = require('express')
const ejs = require('express-ejs-layouts')
const session = require('cookie-session')
const bodyParser = require('body-parser')

const forceSSL = function(req, res, next) {
  var insecure = req.headers['x-forwarded-proto'] != 'https'

  if (app.get('env') != 'development' && insecure) {
    res.redirect(301, "https://" + req.headers['host'] + req.originalUrl)
  } else {
    next()
  }
}

const port = process.env.PORT || 8080
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

app.listen(port)
