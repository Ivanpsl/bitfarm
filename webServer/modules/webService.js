const RoomService = require('./roomService');
const GameService = require('./gameService');

module.exports = class WebService {
    constructor(app) {
        this.app = app;
        this.nodes = [];
        this.roomService = new RoomService(app);
        this.gameService = new GameService(app);

    }
    static getWebInstance() {
        return this;
    }
    suscribeToBlockchain(blockchainService) {
        blockchainService.suscribe((gameId, newBlock) => this.handleNewTransaction(gameId, newBlock), (gameId, newBlock) => this.handleNewBlock(gameId, newBlock));
    }

    getRoom(roomId) {
        return this.roomService.getRoom(roomId);
    }

    getRoomsData() {
        return this.roomService.getRoomsData();
    }

    joinRoom(playerId, userName, roomId) {
        var player = {
            id: playerId,
            name: userName,
            isReady: false
        }
        return this.roomService.joinRoom(player, roomId);
    }

    exitRoom(playerId, roomId) {
        return this.roomService.exitRoom(playerId, roomId);
    }

    setReadyStatus(playerId, roomId, status) {
        var room = this.getRoom(roomId);
        if (room){

            var allReady = room.setPlayerStatus(playerId, status);
            if(allReady)
                this.startGame(roomId);
        }
        else throw new Error("Sala no identificada");
    }

    startGame(roomId) {
        var roomPlayers = this.roomService.getRoomPlayers(roomId)


        const blockchainService = this.app.get("blockchainService");
        var result = blockchainService.createGame(roomId, roomPlayers);
        if (result instanceof Error)
            throw result;
        else {
            this.roomService.setRunningStatus(roomId, result);
            this.gameService.initGame(roomId);
            return result;
        }
    }

    joinGame(gameId, userId, listener) {
        this.gameService.suscribeClient(gameId, userId, listener);
    }

    playerEndTurn(gameId, userId) {

        const blockchainService = this.app.get("blockchainService");
        var result = blockchainService.endPlayerTurn(gameId, userId);

        if (result.allPlayersReady === true) {
            this.gameService.sendPlayerEndTurnEvent(gameId, userId);
        } else {
            this.gameService.sendStartTurnEvent(gameId, result.newTurnData);
        }
        this.gameService.sendPlayerEndTurnEvent(gameId, userId);

    }

    playerCreateOffert(gameId, sourceAccount, offertIndex, itemType, itemIndex, price) {
        this.gameService.sendOnPlayerCreateOffert(gameId, sourceAccount, offertIndex, itemType, itemIndex, price);
    }

    playerBuyOffert(gameId, offertIndex, offertOwner, offertElement, offerPrice, buySource) {
        var actionData = {
            targetPublicKey: offertOwner,
            elementType: offertElement.type,
            elementIndex: offertElement.index,
            price: offerPrice,
        }

        const blockchainService = this.app.get("blockchainService");
        var result = blockchainService.handleAction(gameId, GAME_CONSTANTS.ACTION_ELEMENT_BUY, buySource, actionData);

        if (result instanceof Error)
            throw result;
        else {
            this.gameService.sendOnBuyPlayerOffert(gameId, buySource, offertIndex)
            return result;
        }
    }

    exitGame(gameId, userId) {
        this.gameService.clientExit(gameId, userId);
    }

    sendGameAction(gameId, actionName, account, actionData) {
        const blockchainService = this.app.get("blockchainService");

        var result = blockchainService.handleAction(gameId, actionName, account, actionData);

        if (result instanceof Error)
            throw result;
        else {
            this.gameService.sendOnPlayerAction(gameId, actionName, account, actionData);
            return result;
        }
    }

    handleNewBlock(gameId, newBlock) {
        this.gameService.sendNewBlockEvent(gameId, newBlock);
    }

    handleNewTransaction(gameId, newTransaction) {
        this.gameService.sendNewTransactionEvent(gameId, newTransaction);
    }
    addNode(nodeData) {
        this.log("Registrando nodo: " + nodeData.host)
        this.nodes[this.nodes.length] = nodeData;
    }

    getNodes() {
        return this.nodes;
    }

    log(text) {
        console.log("\x1b[1m\x1b[32m%s\x1b[0m", "[WebService] " + text)
    }
    logError(msg) {
        console.error("\x1b[1m\x1b[32m%s\x1b[0m\x1b[31m\x1b[1m[ERROR] %s\x1b[0m", "[WebService] ", msg);
    }

};