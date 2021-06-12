
const { Router } = require('express')

module.exports = function (app, webService) {

    app.post("/room/join", function (req, res) {
        try {
            console.log(`[POST] [JOINROOM] Jugador [${req.session.playerId}][${req.session.user}] solicitando unirse a sala [${req.body.rType} | ${req.body.rId}]`)
            if (req.session.playerId && req.body.rId != null) {
                var response = webService.joinRoom(req.session.playerId, req.session.user, req.body.rId);
                if (response.error) {
                    console.error(response.error);
                    res.status(500).send(response.error);
                } else {
                    req.session.room = response.roomInfo.roomId
                    req.session.inRoom = true;
                    res.status(200).send(response);
                }
            } else {
                throw new Error("Sesión no iniciada o sala no existente");
            }
        } catch (e) {
            console.error(e.message);
            res.status(500).send(e.message);
        }
    });

    app.get("/room/exit", function (req, res) {
        try {
            console.log("Saliiendo " + req.session.playerId);
            if (req.session.playerId && req.session.room != null && req.session.room != undefined) {
                webService.exitRoom(req.session.playerId, req.session.room);
                req.session.room = null;
                res.redirect('/lobby');
            }
        } catch (e) {
            console.error(e.message)
            res.status(500).send(e.message);
        }
    });

    app.get('/room/subscribeChatRoom', function (req, res) {
        if (req.session.token != null && req.session.room != null) {
            var room = webService.getRoom(req.session.room);
            if (room) room.addListener(req.session.playerId, res);
        }
    });

    app.post("/room/setReady", function (req, res) {
        try {
            if (req.session.token && req.session.playerId && req.body.roomId == req.session.room && req.body.isReady) {
                webService.setReadyStatus(req.session.playerId,req.body.roomId,req.body.isReady);
                res.status(200).send(true);
            } else {
                res.status(500).send("Faltan datos en la petición");
            }
        }
        catch (e) {
            console.error(e.message)
            res.status(500).send(e.message);
        }
    });

    app.post("/room/sendMessage", function (req, res) {
        console.log(`[POST] [SENDMESSAGE] Jugador [${req.session.token} - ${req.session.playerId}][${req.session.user}] enviando [${req.body.rId} | ${req.body.txt}]`)
        if (req.session.token && req.session.playerId && req.body.rId == req.session.room && req.body.txt) {

            const room = webService.getRoom(req.body.rId);
            if (room){
                room.addMessage(req.session.playerId, req.body.txt);
                res.send(true);
            }
            else res.status(500).send("Sala no identificada");
        } else {
            res.status(500).send("Faltan datos en la petición");
        }
    });

}