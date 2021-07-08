const express = require('express');
const config = require('config');
const logger = require('morgan');
const { v4: uuidv4 } = require('uuid');

const p2pController = require('./nodeP2PController')

module.exports =  class NodeP2PService { 
    constructor(farmChainService, host, port, loggConfig){
        this.identifier = uuidv4(); 
        this.nodePort = port;
        this.nodeHost = host;
        this.loggerConfig = loggConfig;
        this.farmChainService = farmChainService;
        this.subscribedNodes = [];
        this.httpServer = null;
        this.serverInstance = null;
    }
    

    init(){
        this.httpServer = new express();
        this.httpServer.use(express.json());
        this.httpServer.use(express.urlencoded({extended: true}));
        this.httpServer.use(logger(this.loggerConfig));
        this.httpServer.set("nodeService",this);
        
        this.httpServer.use("/p2p",require('./p2p.routes')(this.httpServer,p2pController));

        process.on('SIGINT', ()=>  {
            this.serverInstance.close();
            setTimeout(()=> {
                this.log("Ya es seguro cerrar el proceso...")
                process.exit()
                
            },1000);
          
        });

        this.serverInstance  = this.httpServer.listen(this.nodePort, () => {
            this.log("Nodo activo en: "+"http://"+this.nodeHost+":"+this.nodePort);
            this.requestSuscriptionToP2P();

            this.serverInstance.on('close', ()=> {
                this.log("Enviando cierre a los nodos. Espere")
                this.disconectNode();
            });
            
            
        });
    }

    getId(){
        return this.identifier;
    }

    getPort(){
        return this.nodePort;
    }
    
    getHostAndPort(){
        return "http://"+this.nodeHost + ":" +  this.getPort();
    }

    getChains(){
        if(this.farmChainService)
            return this.farmChainService.getBlockchains();
        else {
            this.log("Solicitud de blockchain a nodo sin servicio")
            return null;
        }

    }
    
    propagateTransaction(identifier, transaction){
        this.log("Propagando transaccion")
        p2pController.propagateTransaction(this, identifier,transaction);
    } 
    propagateNewBlock(identifier, block){
        this.log("Propagando bloque")
        p2pController.propagateBlock(this, identifier,block);
    }
    manageNewBlock(identifier,block){
        if(this.farmChainService)
            this.farmChainService.processedRecievedBlock(identifier,block);
        else
            console.log("Se ha recibido peticion de nuevo bloque pero el nodo no tiene farmChainService")
    }

    requestSuscriptionToP2P(){
        var requestUrl = config.get("Blockchain.nodes_request_target") + "/node/suscribe";
        p2pController.subscribeAndRequestNodes(this,requestUrl)
    }

    disconectNode(){
        this.log("Nodo cerrando sesion. Enviando cierre al resto de nodos");

        var requestUrl = config.get("Blockchain.nodes_request_target") + "/node/disconect";
        p2pController.requestExit(this,requestUrl)

    }

    
    addNewNode(newHost,newIp,newPort) {
        this.log("Añadiendo nodo a la red: " + newIp + ":"+newPort);
        this.subscribedNodes.push({host: newHost, ip:newIp, port: newPort});
    }

    removeNode(host){
        this.subscribedNodes = this.subscribedNodes.filter((node) => node.host != host);
    }

    getNodeInfo(){
        var chains = null;
        var numChains = 0;
        if(this.farmChainService){
            chains = this.farmChainService.getBlockchains();
            numChains = chains.length;
        }

        return {
            id : this.identifier,
            host: this.nodeHost,
            port: this.nodePort,
            num_conected_nodes: this.subscribedNodes.length,
            nodes_info: this.subscribedNodes,
            num_blockchains: numChains,
            blockhains_info: chains //JSON.stringify(blockchainsInfo),
        }
    }
    log(msg){
        console.log("\x1b[36m[\x1b[35m%s\x1b[0m\x1b[36m] %s\x1b[0m",this.identifier,"[NodeP2PService] "+msg);
    }
}







