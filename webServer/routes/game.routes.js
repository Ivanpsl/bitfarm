module.exports = function (app,webService) {

    app.post("/game/start", function (req, res,next) {
        var game = webService.startGame(req.body.rId);
        if (game) res.send(JSON.stringify(game))
    });

    

    app.post("/game/action", ActionHandler);
    app.get('/game/suscribe', ssEventHandler);
}


    
function ssEventHandler(req, res) {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    var gameId = req.roomInfo.roomId;
    var userId = req.session.playerId;
    req.session.game =  gameId;
    req.session.inGame = true;
    response.writeHead(200, headers);
    
    webService.joinGame(gameId, userId, res);


    request.on('close', () => {
        console.log(`${userId} Connection closed`);
        webService.exitGame(gameId,userId);
    });
}

function ActionHandler(req,res){
    const playerId = req.session.playerId;
    const gameId = req.session.game;

    
}