module.exports = function (app,webService) {
  
  app.get('/favicon.ico', (req, res) => res.redirect('/game/favicon.ico'));
  
  app.get('/identificarse', function(_req, res) {
    res.redirect('/game/login.html')
  });

  app.get('/', function (_req, res,) {
    res.redirect('/game/login.html')
  });

  require('./game.routes')(app,webService);
  require('./room.routes')(app,webService);
  require('./user.routes')(app,webService);
  require('./node.routes')(app,webService);

}

