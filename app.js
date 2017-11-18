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
			imageURL: "img/organizers/clau.jpg"
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
			url: "https://www.facebook.com/coding.girls.manila/",
			imageURL: "img/supporters/community/coding_girls.png"
		},
		{
			id: 3,
			name: "CipherMNL",
			url: "https://www.facebook.com/ciphermnl",
			imageURL: "img/supporters/community/Cipher.png"
		},
		{
			id: 4,
			name: "PythonPH",
			url: "https://python.ph/",
			imageURL: "img/supporters/community/PythonPH.png"
		},
		{
			id: 5,
			name: "VRPH",
			url: "https://www.facebook.com/vrphilippines/",
			imageURL: "img/supporters/community/VRPH_Logo.png"
		},
		{
			id: 6,
			name: "SwiftPH",
			url: "http://Swift.PH",
			imageURL: "img/supporters/community/SwiftPH_Logo.png"
		},
		{
			id: 7,
			name: "Philippine Android Developer Community (PADC)",
			url: "http://facebook.com/padcsummit/",
			imageURL: "img/supporters/community/PADC.png"
		},
		{
			id: 8,
			name: "Philippine Web Designer (PWDO)",
			url: "http://facebook.com/padcsummit/",
			imageURL: "img/supporters/community/pwdo.png"
		},
		{
			id: 9,
			name: "Developers' Society",
			url: "https://www.facebook.com/devsocietyph",
			imageURL: "img/supporters/community/DevSoc.png"
		},
		{
			id: 10,
			name: "Drupal Philippines",
			url: "https://groups.drupal.org/philippines",
			imageURL: "img/supporters/community/Drupal.png"
		},
		{
			id: 11,
			name: "LaravelPH",
			url: "https://www.facebook.com/laravelph",
			imageURL: "img/supporters/community/LaravelPH.png"
		},
		{
			id: 12,
			name: "WordPress User Group PH",
			url: "https://www.facebook.com/wpugph",
			imageURL: "img/supporters/community/WordPress.jpg"
		},
		{
			id: 13,
			name: "UXPH",
			url: "https://www.facebook.com/UXPhilippines/",
			imageURL: "img/supporters/community/UXPH.png"
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

app.listen(port)
