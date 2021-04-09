const { static } = require('express');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/login', function(req, res, next) {
  res.redirect('/server/login.html')
});

router.get('/game', function(req,res,next){
  res.redirect('/server/lobby.html')
})

module.exports = router;
