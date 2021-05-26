const express = require('express');
const config = require('config');
const logger = require('morgan');
const { v4: uuidv4 } = require('uuid');


const p2pController = require('./nodeP2PController')
var self = null;

module.exports =  class NodeP2PService { 
    constructor(farmChainService){
        this.identifier = uuidv4(); 
        this._nodePort = config.get("Blockchain.node_port")
        this._nodeHost = config.get("Blockchain.node_host")
        this.farmChainService = farmChainService;
        this.subscribedNodes = [];
        this.httpServer = null
        this.start();
        self = this;
    }
    

    start(){
        this.httpServer = new express();
        this.httpServer.use(express.json());
        this.httpServer.use(express.urlencoded({extended: true}));
        this.httpServer.use(logger(config.get('Blockchain.logger')));
        this.httpServer.set("nodeService",this);
        
        this.httpServer.use("/p2p",require('./p2p.routes')(this.httpServer,p2pController));
        this.httpServer.listen(this._nodePort, () => {
            this.log("Nodo activo en: "+"http://localhost:"+this._nodePort);
            this.requestSuscriptionToBlockchain();
        });
    }

    getHost(){
        return this._nodeHost + this._nodePort
    }

    getChains(){
        return this.farmChainService.getBlockchains();
    }
    propagateTransaction(transaction){
        this.log("Propagando transaccion \n\t\t\t"+transaction.getInfo())
        p2pController.propagateTransaction(this.subscribedNodes, transaction);
    }
    requestSuscriptionToBlockchain(){
        var requestUrl = config.get("Blockchain.nodes_request_target");
        p2pController.subscribeAndRequestNodes(this,requestUrl)
    }

    
    addNewNode(newHost,newIp,newPort) {
        this.log("Añadiendo nodo a la red: " + newIp + ":"+newPort);
        this.subscribedNodes.push({host: newHost, ip:newIp, port: newPort});
    }


    getNodeInfo(){
        var blockchainsInfo = []
        this.farmChainService.getBlockchains().forEach(element => {
            blockchainsInfo.push(element.getInfo())
        });

        return {
            id : this.identifier,
            host: this._nodeHost,
            port: this._nodePort,
            num_conected_nodes: this.subscribedNodes.length,
            num_blockchains: this.farmChainService.getBlockchains().length,
            blockhains_info: JSON.stringify(blockchainsInfo),
            nodes_info: this.subscribedNodes
        }
    }
    log(msg){
        console.log("\x1b[36m[\x1b[35m%s\x1b[0m\x1b[36m] %s\x1b[0m",this.identifier,"[NodeP2PService] "+msg);
    }
}







