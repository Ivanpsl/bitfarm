
const config = require("config");
const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const {error404Handler, errorHandler, headers} = require('./middleware')
const WebService = require('./modules/webService')
const app = express();

app.use(logger(config.get('WebServer.logger')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

//Módulo encargado del manejo de sesiones.
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));

app.use(headers);
app.use(errorHandler);

//Módulo para la encriptación de token en la API.
app.set('jwt', require('jsonwebtoken'));

const webService = new WebService(app)

//Servicio
app.set('gameService',webService);


app.use('/game', express.static('./public'));
require('./routes/index')(app,webService);

module.exports = app;