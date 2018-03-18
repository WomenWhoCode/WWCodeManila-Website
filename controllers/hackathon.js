const supporters = require('../data/hackathon/supporters.json')
const organizers = require('../data/hackathon/organizers.json')

exports.getMainPage = function(req, res){
  const mentors = [
    {
      id: 1,
      name: "You",
      imageURL: "https://www.shareicon.net/data/512x512/2015/10/04/112038_glasses_512x512.png"
    }
  ]
  res.render('2017/2017-index', { organizers: organizers, mentors: mentors })
};

exports.getSupporters = function(req, res){
  res.render('2017/2017-supporters', { supporters: supporters })
};

exports.getTravel = function(req, res){
  res.render('2017/2017-travel')
};

exports.getCOC = function(req, res){
  res.render('2017/2017-coc')
}

exports.getFAQ = function(req, res){
  res.render('2017/2017-faq')
};