module.exports = function (app,webService) {

    app.post('/node/suscribe', function (req, res) {
        var nodes = webService.getNodes();
        
        res.status(201).send(JSON.stringify(nodes));
        res.end();
        webService.addNode({
            identifier: req.body.identifier,
            host: req.body.host, 
            ip: req.body.ip, port: 
            req.body.port});
    });

    app.post('/node/disconect', function (req, res) {

        webService.removeNode({
            identifier: req.body.identifier,
            host: req.body.host, 
            ip: req.body.ip, 
            port: req.body.port
        });
        
        var nodes = webService.getNodes();
        
        res.status(201).send(JSON.stringify(nodes));
        res.end();
    });
};