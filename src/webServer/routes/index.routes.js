module.exports = function (app,controller) {
  
  app.get('/favicon.ico', (req, res) => res.redirect('/game/favicon.ico'));
  
  // app.get('/identificarse', function(_req, res) {
  //   res.redirect('/game/login.html')
  // });

  app.get('/', function (_req, res,) {
    res.redirect('/game/login.html')
  });

  require('./game.routes')(app,controller);
  require('./room.routes')(app,controller);
  require('./user.routes')(app,controller);
  require('./node.routes')(app,controller);

}

