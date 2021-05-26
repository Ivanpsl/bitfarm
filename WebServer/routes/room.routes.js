
const { Router } = require('express')

module.exports = function (app,gameService) {

    app.post("/joinRoom", function (req, res) {
        console.log(`[POST] [JOINROOM] Jugador [${req.session.playerId}][${req.session.usuario}] solicitando unirse a sala [${req.body.rType} | ${req.body.rId}]`)

        var response = gameService.joinRoom(req.session.playerId,req.body.rId);
        console.log(JSON.stringify(response.roomInfo) + " ERR: " + response.error );

        if(response.error){
            res.status(500).send(response.error);
        }else{
            req.session.room = response.roomInfo.roomId
            res.status(200).send(response.roomInfo);
        }
    });

    app.get('/room/subscribeChatRoom', function (req, res) {
        console.log("Usuario suscribiendose al chat")
        if(req.session.token && req.session.room ) {
            var room = app.get('gameManager').getRoom(req.session.room);
            if(room) room.addListener(req.session.playerId, res)
        }
    });

    app.post("/room/send", function (req, res) {
        console.log(`[POST] [SENDMESSAGE] Jugador [${req.session.playerId}][${req.session.usuario}] enviando [${req.body.rId} | ${req.body.txt}]`)
        res.send(true);
        var room = app.get('gameManager').getRoom(req.body.rId);
        if(room) room.sendUserMessage(req.session.playerId,req.body.txt);
    });

}