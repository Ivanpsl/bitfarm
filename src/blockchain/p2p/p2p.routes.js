
const express = require("express");

module.exports = function (server, nodeP2PController) {
    const router = express.Router();
    
    router.post('/subscribeNode', function (req, res) {
        nodeP2PController.manageSubscriptionRequest(server,req,res)
    });
    
    router.post('/exitNode', function (req, res) {
        nodeP2PController.manageNodeExit(server,req,res)
    });
    
    router.get('/nodeInfo', function (req, res) {
        var nodeInfo =  server.get("nodeService").getNodeInfo();
        res.send(nodeInfo);
    });

    router.get('/chains',function (req,res){
        var noderService = server.get("nodeService");
        res.send(noderService.getChains());
    });
    
    router.post('/block/new',function (req,res){
        nodeP2PController.manageNewBlock(server,req,res);
    });

    router.post('/transactions/new',function (req,res){
        nodeP2PController.manageNewTransaction(server,req,res);
    });
    

    
    return router;
}