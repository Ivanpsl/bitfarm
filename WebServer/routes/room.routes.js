
const { Router } = require('express')

module.exports = function (app,webService) {

    app.post("/joinRoom", function (req, res) {
        try {
            console.log(`[POST] [JOINROOM] Jugador [${req.session.playerId}][${req.session.usuario}] solicitando unirse a sala [${req.body.rType} | ${req.body.rId}]`)

            var response = webService.joinRoom(req.session.playerId,req.body.rId);
            if(response.error){
                res.status(500).send(response.error);
            }else{
                req.session.room = response.roomInfo.roomId
                res.status(200).send(response);
            }
        }catch(e)
        {
            res.status(500).send(e.message);
        }
    });

    app.get('/room/subscribeChatRoom', function (req, res) {
        console.log("Usuario suscribiendose al chat")
        if(req.session.token && req.session.room ) {
            var room = webService.getRoom(req.session.room);
            if(room) room.addListener(req.session.playerId, res)
        }
    });

    app.get('/room/exitRoom', function(req,res){
        try {
            if(req.session.token && req.session.playerId && req.session.room ) {
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
        console.log(`[POST] [SENDMESSAGE] Jugador [${req.session.playerId}][${req.session.usuario}] enviando [${req.body.rId} | ${req.body.txt}]`)
        res.send(true);
        var room = webService.getRoom(req.body.rId);
        if(room) room.sendUserMessage(req.session.playerId,req.body.txt);
    });

}