
const express = require("express");
// const p2pController = require('./nodeP2PController')

module.exports = function (server, nodeP2PController) {
    const router = express.Router();

    router.post('/subscribeNode', function (req, res) {
        nodeP2PController.manageSubscriptionRequest(server,req,res)
    });

    router.post('/replicateTransaction', function (req, res) {
        if(req.body.ip && req.body.port){
            subscribedNodes.push({ip: req.body.ip, port: req.body.port});
            res.status(200);
            res.send(JSON.parse(subscribedNodes));
        }else {
            res.send(false);
        }
    });

    router.get('/nodeInfo', function (req, res) {
        var nodeInfo =  server.get("nodeService").getNodeInfo();
        res.send(nodeInfo);
    });


    router.get('/chains',function (req,res){
        var noderService = server.get("nodeService");
        res.send(JSON.stringify(noderService.getChains()));
    });


    router.post('/transactions/new',function (req,res){
        if (req.query.sender === ''  || req.query.ammount ==="" || req.query.recipient === "")
        {
            res.send("Missing values");
            return;
        } 
        let index = Blockchain.new_transaction(req.query.sender, req.query.recipient, req.query.ammount)
        res.send("Transaction will be added to block " + index);
    });


    
    return router;
}