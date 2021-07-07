
const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const {errorHandler, headers} = require('./middleware')
const https = require('https');
const WebService = require('./modules/webService')

module.exports =  class WebServer { 
    constructor(config){
        this.app = express();
        this.config = config

        this.service = new WebService(this);
    }

    init(httpCert, chainFacade){
        if(chainFacade){
            this.service.setChainFacade(chainFacade);
            this.configApp();
            this.startServer(httpCert);
        }else{
            this.logError("El servidor necesita una blockchain");
        }
    }

    configApp(){
        if(this.config.logger)
            this.app.use(logger(this.config.logger));
            
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(cookieParser());

        // //Módulo encargado del manejo de sesiones.
        this.app.use(expressSession({
            secret: 'abcdefg',
            resave: true,
            saveUninitialized: true
        }));
        this.app.use(headers);
        this.app.use(errorHandler);
        //Módulo para la encriptación de token en la API.
        this.app.set('jwt', require('jsonwebtoken'));


        this.app.use('/game', express.static('./src/webServer/public'));
        require('./routes/index.routes')(this.app, this.service);
    }
    startServer(httpCert){
        const httpsServer = https.createServer(httpCert, this.app);
        httpsServer.listen(this.config.port, ()=> {
            this.log("Servidor web activo en: "+"https://localhost:" + httpsServer.address().port)
        });
    }

    log(msg){
        console.log("\x1b[33m%s\x1b[0m","[WebServer] " +msg);
    }
    logError(msg){console.error("\x1b[33m%s\x1b[0m%s\x1b[0m\x1b[31m\x1b[1m[ERROR] %s\x1b[0m","[WebServer] ",msg);}

}