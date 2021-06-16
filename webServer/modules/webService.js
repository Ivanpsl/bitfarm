const RoomService = require('./roomService');
const GameService = require('./gameService');

module.exports = class WebService {
    constructor(app){
        this.app = app;
        this.nodes = [];
        this.roomService = new RoomService(app);
        this.gameService = new GameService(app);

    }
    static getWebInstance(){
        return this;
    }
    suscribeToBlockchain(blockchainService){
        blockchainService.suscribe((gameId,newBlock)=> this.handleNewTransaction(gameId,newBlock),(gameId,newBlock)=>this.handleNewBlock(gameId,newBlock));
    }

    getRoom(roomId){ 
        return this.roomService.getRoom(roomId);
    }   

    getRoomsData(){
        return this.roomService.getRoomsData();
    }

    joinRoom(playerId,userName,roomId){
        var player = {id: playerId, name:userName, isReady: false}
        return this.roomService.joinRoom(player,roomId);
    }
    
    exitRoom(playerId,roomId){
        return this.roomService.exitRoom(playerId,roomId);
    }

    setReadyStatus(playerId,roomId,status){
        var room = this.getRoom(roomId);
        if (room) room.setPlayerStatus(playerId, status);
        else throw new Error("Sala no identificada");
    }

    startGame(roomId){
        var roomPlayers = this.roomService.getRoomPlayers(roomId)
        this.roomService.setRunningStatus(roomId);
        this.gameService.initGame(roomId);

        const blockchainService = this.app.get("blockchainService");
        return blockchainService.createGame(roomId,roomPlayers);
    }

    joinGame(gameId,userId,listener){
        this.gameService.suscribeClient(gameId,userId,listener);
    }

    playerEndTurn(gameId,userId){

        const blockchainService = this.app.get("blockchainService");
        var result = blockchainService.endPlayerTurn(gameId,userId);

        if(result.endPlayerTurn === true){
            this.gameService.sendPlayerEndTurnEvent(gameId, userId);
        }else{
            this.gameService.sendStartTurnEvent(gameId, result.newTurnData); 
        }   
    }

    exitGame(gameId,userId){
        this.gameService.clientExit(gameId,userId);
    }
    
    sendGameAction(gameId,actionName,account,actionData){
        const blockchainService = this.app.get("blockchainService");
        return blockchainService.handleAction(gameId,actionName,account,actionData);
    }

    handleNewBlock(gameId,newBlock){
        this.gameService.sendNewBlockEvent(gameId,newBlock);
    }
    
    handleNewTransaction(gameId,newTransaction){
        this.gameService.sendNewTransactionEvent(gameId,newTransaction);
    }
    addNode(nodeData) {
        this.log("Registrando nodo: "+nodeData.host)
        this.nodes[this.nodes.length] = nodeData;
    }

    getNodes(){
        return this.nodes;
    } 

    log(text){
        console.log("\x1b[1m\x1b[32m%s\x1b[0m","[WebService] "+ text)
    }
    logError(msg){console.error("\x1b[1m\x1b[32m%s\x1b[0m\x1b[31m\x1b[1m[ERROR] %s\x1b[0m","[WebService] ",msg);}

};
