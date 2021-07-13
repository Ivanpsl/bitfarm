module.exports = function (app,controller) {

    app.post('/node/suscribe', function (req, res) {
        var nodes = controller.getWebService().getNodes();
        
        res.status(201).send(JSON.stringify(nodes));
        res.end();
        controller.getWebService().addNode({
            identifier: req.body.identifier,
            host: req.body.host, 
            ip: req.body.ip, port: 
            req.body.port});
    });

    app.post('/node/disconect', function (req, res) {
        console.log("recibiendo desconexion")
        controller.getWebService().removeNode({
            identifier: req.body.identifier,
            host: req.body.host, 
            ip: req.body.ip, 
            port: req.body.port
        });
        
        var nodes = controller.getWebService().getNodes();
        
        res.status(201).send(JSON.stringify(nodes));
        res.end();
    });
};