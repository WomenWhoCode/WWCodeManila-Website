var router = require('express').Router();

var hackathonController = require('../controllers/hackathon');

router.route('/').get(hackathonController.getMainPage);

router.route('/supporters').get(hackathonController.getSupporters);

router.route('/travel').get(hackathonController.getTravel);

router.route('/faq').get(hackathonController.getFAQ);

module.exports = router;