const axios = require('axios')
const fs = require('fs');

module.exports = {

  
    manageSubscriptionRequest : function (server,req,res) {
        if(req.body.host && req.body.ip && req.body.port)
        {
            this.log("Nodo "+req.body.host+" solicitando unirse a la red")
            const service = server.get("nodeService");
            service.addNewNode(req.body.host,req.body.ip,req.body.port)
            res.status(202);

            res.send(service.getChains());
        }else 
        {
            res.status(400);
            res.send("El nodo no se ha suscrito correctamente a la red, falta información sobre el nodo");
        }
    },

    manageNodeExit : function (server,req,res) {
        if(req.body.host && req.body.ip && req.body.port)
        {
            this.log("Nodo "+req.body.host+" saliendo de la red")
            const service = server.get("nodeService");
            service.removeNode(req.body.host)
            res.status(202);

            res.send(true);
        }else 
        {
            res.status(400);
            res.send("El nodo no se ha suscrito correctamente a la red, falta información sobre el nodo");
        }
    },

    manageNewTransaction : function (server,req,res) {
        if (req.body.host && req.body.gameIdentifier && req.body.transactionData)
        {   
            server.get("nodeService").addNewTransaction(req.body.gameIdentifier,req.body.transactionData);
            res.status(202);
            res.send("Transaccion aceptada");
        }else 
        {
            res.status(400);
            res.send("No ha sido posible añadir la transaccion, falta información.");
        }
    },
    manageNewBlock :  function (server,req,res) {
        if (req.body.host && req.body.gameIdentifier && req.body.blockData)
        {   
            server.get("nodeService").manageNewBlock(req.body.gameIdentifier,req.body.blockData);
            res.status(202);
            res.send("Transaccion aceptada");
        }else 
        {
            res.status(400);
            res.send("No ha sido posible añadir la transaccion, falta información.");
        }
    },
    propagateBlock: function(service, gameId, block){
        var caFile = fs.promises.readFile('./certificates/key.pem');
        service.subscribedNodes.forEach(node => {
            // @ts-ignore
            axios.post(node.host+"/p2p/block/new", {
                host: service.getHostAndPort(),
                gameIdentifier : gameId,
                blockData : block,

                ca: caFile,
                rejectUnhauthorized : false
            })
            .then(res => {
                if(res.status === 202)
                    this.log(`Enviado el nuevo bloque al nodo ${node.host} correctamente`)
            })
            .catch(error => {
                if(error.response != null)
                    this.logError(error.response.data)
                else
                    this.logError("Error desconocido al enviar nuevo bloque\n\t\t\t"+error)
            })
        });
    },
    propagateTransaction : function(service, gameId, transaction){
        var caFile = fs.promises.readFile('./certificates/key.pem');

        service.subscribedNodes.forEach(node => {
            // @ts-ignore
            axios.post(node.host+"/p2p/transactions/new", {
                host: service.getHostAndPort(),
                gameIdentifier : gameId,
                transactionData : transaction,
                ca: caFile,
                rejectUnhauthorized : false
            })
            .then(res => {
                if(res.status === 202)
                    this.log(`Enviada la transaccion al nodo ${node.host} correctamente`)
            })
            .catch(error => {
                if(error.response != null)
                    this.logError(error.response.data)
                else
                    this.logError("Error desconocido al enviar una transacción\n\t\t\t"+error)
            })
        });
    },

    
    sendSuscriptionToNode : function (service,targetHost) {
        this.log("Enviando suscripcion a nodo: "+ targetHost+"/subscribeNode")
        // @ts-ignore
        axios.post(targetHost+"/p2p/subscribeNode", {
            host: service.getHostAndPort(),
            ip:  service.nodeHost,
            port:  service.getPort(),
            // ca: caFile,
            rejectUnhauthorized : false
        })
        .then(res => {
            if(res.status === 202){
                this.log(`Suscripción correcta al nodo ${targetHost}`)
                console.log(res.data)
                service.parseBlockchains(res.data);
            }
        })
        .catch(error => {
            if(error.response != null)
                this.logError(error.response.data)
            else
                this.logError("Error desconocido al enviar peticion de suscripción a targetHost\n\t\t\t"+error)
        })
    },
    

    subscribeAndRequestNodes: function(service,url) {
        var requestUrl = url
        var thisIdentifier = service.getId();
        var thisHost = service.getHostAndPort();
        var thisPort = service.getPort();
        this.log("Enviando suscripción al servidor web")

        // @ts-ignore
        axios.post(requestUrl, {
            identifier : thisIdentifier,
            host: thisHost,
            ip:  service.nodeHost,
            port:  thisPort,
            //ca: caFile,// fs.readFileSync('./certificates/key.pem')
            rejectUnhauthorized : false
        })
        .then(res => {
            res.data.forEach(newNode => {
                service.addNewNode(newNode.host,newNode.ip,newNode.port);
                this.sendSuscriptionToNode(service,newNode.host);
            });
        })
        .catch(error => {
            this.logError("Error tratando de unirse a la red:\n\t\t\t\t"+error)
        })
    },

    requestExit: function(service,url) {
        var requestUrl = url
        var thisIdentifier = service.getId();
        var thisHost = service.getHostAndPort();
        var thisPort = service.getPort();
        this.log("Enviando petición de salida al servidor web")

        // @ts-ignore
        axios.post(requestUrl, {
            identifier : thisIdentifier,
            host: thisHost,
            ip: service.nodeHost,
            port:  thisPort,
            rejectUnhauthorized : false
        })
        .then(res => {
            res.data.forEach(newNode => {
                this.sendCloseEventToNode(service,newNode.host);
            });
        })
        .catch(error => {
            this.logError("Error al salir de la red:\n\t\t\t\t"+error)
        })
    },
    
    

    sendCloseEventToNode : function (service,targetHost) {
        this.log("Enviando peticion de cierre a nodo: "+ targetHost+"/exit")
        // @ts-ignore
        axios.post(targetHost+"/p2p/exitNode", {
            identifier : service.getId(),
            host: service.getHostAndPort(),
            ip:  "http://"+service.nodeHost,
            port:  service.getPort(),
            // ca: caFile,
            rejectUnhauthorized : false
        })
        .then(res => {
            if(res.status === 202)
                this.log(`Desconexion correcta al nodo ${targetHost}`)
        })
        .catch(error => {
            if(error.response != null)
                this.logError(error.response.data)
            else
                this.logError("Error desconocido al enviar peticion de desconexión\n\t\t\t"+error)
        })
    },
    


    log(msg) {console.log("\x1b[34m%s\x1b[0m","[nodeP2PController] "+msg);},
    logError(msg){console.error("\x1b[34m%s\x1b[0m\x1b[31m\x1b[1m[ERROR] %s\x1b[0m","[nodeP2PController] ",msg);}
}
