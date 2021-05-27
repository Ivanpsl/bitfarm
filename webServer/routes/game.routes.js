
const express = require('express');

module.exports = function (app,gameService) {
    app.post("/game/start", function (req, res) {

        var game = app.get('webService').startGame(req.body.rId);
        if(game) res.send(JSON.stringify(game))
    });

}