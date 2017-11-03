const express = require('express')
const ejsLayouts = require('express-ejs-layouts')

const app = express()

const port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))

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
    res.render('supporters')
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