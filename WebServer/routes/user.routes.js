
const express = require('express');

module.exports = function (app,gameService) {

    const routerUsuarioToken = express.Router();
    routerUsuarioToken.use(function (req, res, next) {
        var token = req.headers['token'] || req.body.token || req.query.token || req.session.token;
        if (token != null) {
            app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
                if (err || (Date.now() / 1000 - infoToken.tiempo) > 240) {
                    console.error("Error con el token:", err);
                    res.status(403);
                    res.json({
                        acceso: false,
                        error: 'Token invalido o caducado'
                    });
                    console.error("No hay token valido")
                    res.redirect("/");
                } else {
                    res.usuario = infoToken.usuario;
                    next();
                }
            });
        } else {
            res.status(403);
            console.error("No hay token valido")
            res.redirect("/");
        }
    });


    app.use('/lobby', routerUsuarioToken);
    app.use('/roomList', routerUsuarioToken);
    app.use('/room/subscribeChatRoom', routerUsuarioToken);
    app.use('/joinRoom', routerUsuarioToken);


    app.get('/lobby', function(req,res,next){
        res.redirect('/game/lobby.html')
    })

    app.get('/roomList', function(req,res,next){
        var gs = gameService;
        var rooms = gs.getRoomsData();
        res.status(201).send(rooms);
        res.end();
    });

    app.post("/identificarse", function (req, res) {
        console.log("Identificandose")
        var user = req.body.username
        var playerToken;
        var playerAdded = null;
        
        playerToken = app.get('jwt').sign({usuario: user , tiempo: Date.now() / 1000},"secreto");
        playerAdded = gameService.addPlayer(playerToken,user);
        
        req.session.usuario = user;
        req.session.token = playerToken;
        req.session.playerId = playerAdded.id;
        
        console.log(user + " se ha identificado correctamente " + " token = " + req.session.token);
        res.redirect('/lobby');
    });
    
}