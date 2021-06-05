
const { Router } = require('express')

module.exports = function (app,webService) {

    app.post("/joinRoom", function (req, res) {
        try {
            console.log(`[POST] [JOINROOM] Jugador [${req.session.playerId}][${req.session.usuario}] solicitando unirse a sala [${req.body.rType} | ${req.body.rId}]`)
            if(req.session.playerId && req.body.rId !=null){
                var response = webService.joinRoom(req.session.playerId,req.body.rId);
                if(response.error){
                    console.error(response.error);
                    res.status(500).send(response.error);
                }else{
                    req.session.room = response.roomInfo.roomId
                    res.status(200).send(response);
                }
            }else{
                throw new Error("Sesión no iniciada o sala no existente");
            };
        }catch(e)
        {                
            console.error(e.message);

            res.status(500).send(e.message);
        }
    });

    app.get("/room/exit", function (req, res) {
        try {
            console.log("Saliiendo "+req.session.playerId);
            if(req.session.playerId && req.session.room != null && req.session.room != undefined){
                webService.exitRoom(req.session.playerId,req.session.room);
                req.session.room = null;
                res.redirect('/lobby');
            }
        }catch(e)
        {
            console.error(e.message)
            res.status(500).send(e.message);
        }
    });

    app.get('/room/subscribeChatRoom', function (req, res) {
        if(req.session.token != null && req.session.room != null) {
            const room = webService.getRoom(req.session.room);
            if(room) room.addListener(req.session.playerId, res);
        }
    });

    app.get('/room/exitRoom', function(req,res){
        try {
            if(req.session.token != null && req.session.playerId != null && req.session.room != null ) {
                console.log("Usuario saliendo de la sala");
                webService.exitRoom(req.session.playerId,req.session.room);
                res.status(200).send(true);
            }
        }catch(e)
        {
            res.status(500).send(e.message);
        }
    });

    app.post("/room/sendMessage", function (req, res) {
        console.log(`[POST] [SENDMESSAGE] Jugador [${req.session.token} - ${req.session.playerId}][${req.session.usuario}] enviando [${req.body.rId} | ${req.body.txt}]`)
        if(req.session.token && req.session.playerId && req.body.rId == req.session.room && req.body.txt) {
            res.send(true);
            var room = webService.getRoom(req.body.rId);
            if(room) room.addMessage(req.session.playerId,req.body.txt);
        }else{
            res.status(500).send("No identificado");
        }
    });

}