
const express = require('express');
const routerUsuarioToken = express.Router();

module.exports = function (app,webService) {


    routerUsuarioToken.use(function (req, res, next) {
        var token = req.headers['token'] || req.body.token || req.query.token || req.session.token;
        if (token != null) {
            app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
                if (err || (Date.now() / 1000 - infoToken.tiempo) > 240) {
                    console.log("Token")
                    console.error("Error con el token: "+err);
                    res.status(403);
                    console.error("No hay token valido")
                    res.redirect('/game/login.html?mensaje=Token no valido')
                } else {
                    res.usuario = infoToken.usuario;
                    next();
                }
            });
        } else {
            res.status(403);
            res.redirect("/");
        }
    });


    app.use('/lobby', routerUsuarioToken);
    app.use('/roomList', routerUsuarioToken);
    app.use('/room/subscribeChatRoom', routerUsuarioToken);
    app.use('/joinRoom', routerUsuarioToken);


    app.get('/lobby', function(req,res){
        res.redirect('/game/main.html')
    })

    app.get('/roomList', function(req,res){
        var rooms = webService.getRoomsData();
        res.status(201).send(rooms);
        res.end();
    });

    app.post("/identificarse", function (req, res) {
        try{
            var user = req.body.username;
            if(user != null && user.trim().length > 0){
        
                var playerToken;
                
                playerToken = app.get('jwt').sign({usuario: user , tiempo: Date.now() / 1000},"secreto");

                req.session.user = user;
                req.session.token = playerToken;
                req.session.playerId = playerToken;
                req.session.inRoom = false;
                req.session.inGame = false;
                res.status(200).redirect('/lobby');
            } else throw Error("El nombre de usuario no es un nombre valido")
        }
        catch(e){
            res.redirect(`/game/login.html?mensaje=${e.message}&tipoMensaje=alert-danger`)
        }
    });
    
}