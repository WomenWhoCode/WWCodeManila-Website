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

const events = require('./data/her2point0/events.json')

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

var hackathonRoutes = require('./routers/hackathon')

app.get('/', function(req, res){
  res.render('2018/2018-tech-summit')
})

app.get('/call-for-speakers', function(req, res){
  res.render('2018/2018-tech-summit-cfs')
})


app.get('/2018/Her-2-point-0', function(req, res) {
  res.render('2018/2018-her-index', { events: events })
})

app.use('/2017/hackathon', hackathonRoutes)

app.listen(port, function(error) {
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port)
  }
})
