module.exports = function (app,webService) {

    app.post("/game/start", function (req, res,next) {
        var game = webService.startGame(req.body.rId);
        if (game) res.send(JSON.stringify(game))
    });

    app.get("/game/player/endTurn", function (req, res,next) {
        var gameId = req.session.game;
        var playerId = req.session.playerId
        if(gameId && playerId)
        {
            webService.playerEndTurn(gameId, playerId);
        }
    });
    
    function ssEventHandler(req, res) {
        const headers = {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        };
        var gameId = req.session.room;
        var userId = req.session.playerId;

        req.session.game =  gameId;
        req.session.inGame = true;
        
        res.writeHead(200, headers);
        
        webService.joinGame(gameId, userId, res);

        req.on('close', () => {
            console.log(`${userId} Connection closed`);
            webService.exitGame(gameId,userId);
        });
    }

    async function ActionHandler(req,res){
        try {
            var gameId = req.session.room;
            var sourceAccount = req.body.sourceAcc;
            var actioName = req.body.action;
            var actionData = req.body.data;
            console.log(gameId + " "+sourceAccount + " "+ actioName + " " + JSON.stringify(actionData))
            if(gameId && sourceAccount && actioName && actionData){ 
                var response = await webService.sendGameAction(gameId,actioName,sourceAccount,actionData);
                if(response instanceof Error) 
                    throw response;
                res.status(201).send(response);
            }else{
                throw new Error("Faltan datos");
            }
            
        }catch(e){
            console.log(e.message);
            res.status(500).send(e.message);
        }
    }

    app.post("/game/action", ActionHandler);
    app.get('/game/suscribe', ssEventHandler);
}


    