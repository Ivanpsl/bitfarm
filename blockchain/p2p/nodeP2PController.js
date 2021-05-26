const axios = require('axios')
const fs = require('fs');

module.exports = {
    /**
     * @param  {} server
     * @param  {} req
     * @param  {} res
     */
    manageSubscriptionRequest : function (server,req,res) {
        if(req.body.host && req.body.ip && req.body.port){
            this.log("Nodo "+req.body.host+" solicitando unirse a la red")
            server.get("nodeService").addNewNode(req.body.host,req.body.ip,req.body.port)
            res.status(202);
            res.send();
        }else {
            res.status(400);
            res.send("El nodo no se ha suscrito correctamente a la red, falta información sobre el nodo");
        }
    },
    

    requestChain : async function (server,chainId){
        axios.get('http://localhost:4000/students',{
            params: { chain:chainId }
        }) .then(res => {
            if(res.status === 202)
                this.log(`Se ha solicitado correctamente la cadena`)
        })
        .catch(error => {
            if(error.response != null)
                this.logError(error.response.data)
            else
                this.logError("Error desconocido al enviar peticion de suscripción a targetHost\n\t\t\t"+error)
        })
    },

    
    propagateTransaction : function(service, transaction, nodes){
        nodes.forEach(node => {
            axios.post(targetHost+"/p2p/subscribeNode", {
                host: service.getHost(),
                ip:  "localhost",
                port:  service._nodePort,
                ca: caFile,
                rejectUnhauthorized : false
            })
            .then(res => {
                if(res.status === 202)
                    this.log(`Suscripción correcta al nodo ${targetHost}`)
            })
            .catch(error => {
                if(error.response != null)
                    this.logError(error.response.data)
                else
                    this.logError("Error desconocido al enviar peticion de suscripción a targetHost\n\t\t\t"+error)
            })
        });
    },
    /**
     * Envia confirmacion de suscripción a un nodo de la red
     * @param  {} service
     * @param  {} targetHost
     */
    sendSuscriptionToNode : function (service,targetHost) {
        var caFile = fs.promises.readFile('./certificates/key.pem');
        this.log("Enviando suscripcion a nodo: "+ targetHost+"/subscribeNode")
        axios.post(targetHost+"/p2p/subscribeNode", {
            host: service.getHost(),
            ip:  "localhost",
            port:  service._nodePort,
            ca: caFile,
            rejectUnhauthorized : false
        })
        .then(res => {
            if(res.status === 202)
                this.log(`Suscripción correcta al nodo ${targetHost}`)
        })
        .catch(error => {
            if(error.response != null)
                this.logError(error.response.data)
            else
                this.logError("Error desconocido al enviar peticion de suscripción a targetHost\n\t\t\t"+error)
        })
    },
    
    /**
     * Suscripción al servidor web y solicitud de la lista de nodos activos
     * @param  {} service
     * @param  {} url
     */
    subscribeAndRequestNodes: function(service,url) {
        var requestUrl = url
        var caFile = fs.promises.readFile('./certificates/key.pem');
        var thisHost = service.getHost();

        this.log("Enviando suscripción al servidor web")

        axios.post(requestUrl, {
            host: thisHost,
            ip:  "localhost",
            port:  service._nodePort,
            ca: caFile,// fs.readFileSync('./certificates/key.pem')
            rejectUnhauthorized : false
        })
        .then(res => {
            // this.log(res.data)
            res.data.forEach(newNode => {
                this.sendSuscriptionToNode(service,newNode.host);
                service.addNewNode(newNode.host,newNode.ip,newNode.port);
            });
        })
        .catch(error => {
            this.logError("Error tratando de unirse a la red")
        })
    },

    log(msg) {console.log("\x1b[34m%s\x1b[0m","[nodeP2PController] "+msg);},
    logError(msg){console.error("\x1b[34m%s\x1b[0m\x1b[31m\x1b[1m[ERROR] %s\x1b[0m","[nodeP2PController] ",msg);}
}
