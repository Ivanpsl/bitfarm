module.exports = function (app, controller) {

    app.post("/game/start", function (req, res) {
        var game = controller.getWebService().startGame(req.body.rId);
        if (game) res.send(JSON.stringify(game))
    });

    app.get("/game/player/endTurn", function (req, res) {
        var gameId = req.session.room;
        var playerId = req.session.playerId
        console.log(`Player endTurn: ${gameId} ${playerId}`)
        if (gameId !== null && playerId !== null) {
            controller.getWebService().playerEndTurn(gameId, playerId);
        }
        res.status(200).send(true);
        res.end();
    });
    
    app.post("/game/offert/create", function (req,res) {
        try{
            var gameId = req.session.room;
            var sourceAccount = req.body.sourceAcc;
            var offertIndex = req.body.offertIndex;
            var itemType = req.body.itemType;
            var itemIndex= req.body.itemIndex;
            var price = req.body.price;
            controller.getWebService().playerCreateOffert(gameId,sourceAccount,offertIndex,itemType,itemIndex,price);

            res.status(200).send(true);
            res.end();
        } catch(e){
            console.log("[/game/offert/create] " + JSON.stringify(e));
            res.status(500).send(e.message);
            res.end();
        }
    });
    app.post("/game/offert/remove", function (req,res) {
        try{
            var gameId = req.session.room;
            var index =req.body.index;
            console.log(req.session.index)
            controller.getWebService().playerRemoveOffert(gameId,index);

            res.status(200).send(true);
            res.end();
        } catch(e){
            console.log("[/game/offert/remove] " + JSON.stringify(e));
            res.status(500).send(e.message);
            res.end();
        }
    });

    app.post("/game/offert/buy", function (req, res) {
        try {
            var offertIndex = req.body.index;
            var offertOwner = req.body.owner;
            var offertElement = req.body.element;
            var offerPrice = req.body.price;
            var buySource = req.body.source;

            var gameId = req.session.room;
            var playerId = req.session.playerId;

            if (gameId !== null && playerId !== null) {
                var response = controller.getWebService().playerBuyOffert(gameId, offertIndex, offertOwner, offertElement, offerPrice, buySource);
                res.status(201).send(response);
                res.end();
            } else {
                throw new Error("Faltan datos");
            }

        } catch (e) {
            console.error("[ERROR] " + e.message);
            res.status(500).send("Se ha producido un error realizando la compra");
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

        req.session.game = gameId;
        req.session.inGame = true;

        res.writeHead(200, headers);

        controller.getWebService().joinGame(gameId, userId, res);

        req.on('close', () => {
            console.log(`${userId} Connection closed`);
            controller.getWebService().exitGame(gameId, userId);
        });
    }

    async function ActionHandler(req, res) {
        try {
            var gameId = req.session.room;
            var sourceAccount = req.body.sourceAcc;
            var actioName = req.body.action;
            var actionData = req.body.data;
            console.log(gameId + " " + sourceAccount + " " + actioName + " " + JSON.stringify(actionData))
            if (gameId !=null && sourceAccount !=null && actioName != null && actionData != null) {
                var response = await controller.getWebService().sendGameAction(gameId, actioName, sourceAccount, actionData);
                if (response instanceof Error)
                    throw response;
                res.status(201).send(response);
            } else {
                throw new Error("Faltan datos");
            }

        } catch (e) {
            console.log(e.message);
            res.status(500).send(e.message);
        }
    }

    app.post("/game/action", ActionHandler);
    app.get('/game/suscribe', ssEventHandler);
}