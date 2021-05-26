const axios = require('axios')


module.exports = function (app,gameService) {

  app.get('/identificarse', function(req, res, next) {
    res.redirect('/game/login.html')
  });

  app.get('/', function (req, res,next) {
    res.redirect('/game/login.html')
  });


  app.post('/nodes', function (req, res,next) {
    var service = app.get('gameService');
    var nodes = service.getNodes();
    service.addNode({host: req.body.host, ip: req.body.ip, port: req.body.port});
    
    res.status(201).send(JSON.stringify(nodes));
    res.end();
  });

  require('./room.routes')(app,gameService);
  require('./user.routes')(app,gameService);

  
  // require('../blockchain/p2p/p2p.routes',app,gameService)
}
