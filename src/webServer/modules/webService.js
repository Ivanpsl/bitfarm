const RoomService = require('./roomService');
const GameService = require('./gameService');
const { GAME_CONSTANTS } = require('../../common/constants');

/** Servicio WebService que coordina eventos generales, servicios y blockchain de la aplicación   */
class WebService {
    constructor(app) {
        this.app = app;
        this.nodes = [];
        this.roomService = new RoomService(app);
        this.gameService = new GameService(app);

        this.farmChainFacade = null
    }

    /**
     * Establece la interfaz a traves de la cual se comunica con la blockchain y se suscribe a sus eventos
     * 
     * @param {any} farmChainFacade - Interfaz de acceso a la blockchain
     * @returns {any}
     */
    setChainFacade(farmChainFacade){
        this.farmChainFacade = farmChainFacade;
        this.suscribeToBlockchain();
    }
    
    /**
     * Suscribe observers a la blockchain para poder detectar la creación de bloques 
     */
    suscribeToBlockchain() {
        this.farmChainFacade.suscribeToChainLog(
            (gameId, newTransaction) => this.handleNewTransaction(gameId, newTransaction),
            (gameId, newBlock) => this.handleNewBlock(gameId, newBlock));
    }

    /**
     * Metodo que devuelve el servicio que gestiona las salas
     * 
     * @returns {any} - RoomService
     */
    getRoomService(){
        return this.roomService;
    }

    /**
     * Metodo que devuelve el servicio que gestiona las salas
     * 
     * @returns {any}
     */
    getGameService(){
        return this.gameService;
    }



    exitRoom(playerId, roomId) {
        return this.roomService.exitRoom(playerId, roomId);
    }


    startGame(roomId) {
        var roomPlayers = this.roomService.getRoomPlayers(roomId)
        
        if(!this.checkFacade())
            throw new Error("No se ha establecido comunicación con el servicio de la blockchain correctamente");

        var result = this.farmChainFacade.createGame(roomId, roomPlayers);
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
        
        if(!this.checkFacade())
            throw new Error("No se ha establecido comunicación con el servicio de la blockchain correctamente");

        var result = this.farmChainFacade.endPlayerTurn(gameId, userId);

        if (result.allPlayersReady === true) {
            this.gameService.sendStartTurnEvent(gameId, result.newTurnData);
        } else {
            this.gameService.sendPlayerEndTurnEvent(gameId, userId);
        }
        return result.newTurnData;
        

    }

    
    playerCreateOffert(gameId, sourceAccount, offertIndex, itemType, itemIndex, price) {
        this.gameService.sendOnPlayerCreateOffert(gameId, sourceAccount, offertIndex, itemType, itemIndex, price);
    }

    playerRemoveOffert(gameId,offertIndex){
        this.gameService.sendOnPlayerRemoveOffert(gameId,offertIndex);
    }


    playerBuyOffert(gameId, offertIndex, offertOwner, offertElement, offerPrice, buySource) {
        var actionData = {
            targetPublicKey: offertOwner,
            elementType: offertElement.type,
            elementIndex: offertElement.index,
            price: offerPrice,
        }
        this.checkFacade();

        var result = this.farmChainFacade.handleAction(gameId, GAME_CONSTANTS.ACTION_ELEMENT_BUY, buySource, actionData);

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
        
        if(!this.checkFacade())
            throw new Error("No se ha establecido comunicación con el servicio de la blockchain correctamente");

        var result = this.farmChainFacade.handleAction(gameId, actionName, account, actionData);

        if (result instanceof Error)
            throw result;
        else {
            this.gameService.sendOnPlayerAction(gameId, actionName, account, actionData);
            return result;
        }
    }

    handleNewBlock(gameId, newBlock) {
        this.log("Detectado nuevo bloque")
        this.gameService.sendNewBlockEvent(gameId, newBlock);
    }

    handleNewTransaction(gameId, newTransaction) {
        this.log("Detectado nueva transacción")
        this.gameService.sendNewTransactionEvent(gameId, newTransaction);
    }
    addNode(nodeData) {
        this.log("Registrando nodo: " + nodeData.host)
        this.nodes.push(nodeData);
    }
    removeNode(nodeData){
        this.log("Eliminando nodo de la lista : " + nodeData.identifier)
        this.nodes = this.nodes.filter((n) => n.identifier !== nodeData.identifier)
    }

    getNodes() {
        return this.nodes;
    }
    
    checkFacade(){
        return (this.farmChainFacade != null)
    }

    log(text) {
        console.log("\x1b[1m\x1b[32m%s\x1b[0m", "[WebService] " + text)
    }
    logError(msg) {
        console.error("\x1b[1m\x1b[32m%s\x1b[0m\x1b[31m\x1b[1m[ERROR] %s\x1b[0m", "[WebService] ", msg);
    }

}

module.exports =  WebService;