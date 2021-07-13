
const express = require('express');
const routerUsuarioToken = express.Router();

module.exports = function (app,controller) {

    routerUsuarioToken.use(function (req, res, next) {
        controller.checkToken(req,res,next);
    });


    app.use('/lobby', routerUsuarioToken);
    app.use('/roomList', routerUsuarioToken);
    app.use('/room/subscribeChatRoom', routerUsuarioToken);
    app.use('/joinRoom', routerUsuarioToken);


    app.get('/lobby', function(req,res){
        res.redirect('/game/main.html')
    })

    app.get('/roomList', function(req,res){
        controller.requestRoomList(req,res);
    });

    app.post("/identificarse", function (req, res) {
        try{
            controller.singin(req,res);
        }
        catch(e){
            res.redirect(`/game/login.html?mensaje=${e.message}&tipoMensaje=alert-danger`)
        }
    });
    
}