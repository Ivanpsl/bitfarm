const axios = require('axios')

module.exports = function (app,gameService) {

  app.get('/identificarse', function(req, res, next) {
    res.redirect('/game/login.html')
  });

  app.get('/', function (req, res,next) {
    res.redirect('/game/login.html')
  });


  app.post('/nodes', function (req, res,next) {
    var service = app.get('webService');
    var nodes = service.getNodes();
    
    res.status(201).send(JSON.stringify(nodes));
    res.end();
    service.addNode({identifier: req.body.identifier,host: req.body.host, ip: req.body.ip, port: req.body.port});
  });

  require('./game.routes')(app,gameService);
  require('./room.routes')(app,gameService);
  require('./user.routes')(app,gameService);
  
  // require('../blockchain/p2p/p2p.routes',app,gameService)
}

