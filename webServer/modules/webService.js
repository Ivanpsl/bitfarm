const RoomService = require('./roomService');
const GameEventsService = require('./gameEventsService');

module.exports = class WebService {
    constructor(app){
        this.app = app;
        this.nodes = [];
        this.roomService = new RoomService(app);
        this.gameService = new GameEventsService(app);
    }
    // addPlayer(playerToken,newName){
    //     var playerId = this.players.length; 
    //     if (this.players[playerId] == null) {
    //         var player = { id: playerId, token: playerToken, name:newName, isReady: false }; 
        
    //         this.players[playerId] =  player
    //         this.log(`Se ha registrado a un nuevo jugador correctamente. [${playerId}] ${newName} `)
    //         return player;
    //     }else{
    //         return null;
    //     }
    // }

    // removePlayer(id){
    //     this.players[id] = null;
    // }
    // getAllPlayers(){ return players;} 

    // getPlayer(id){
    //     return this.players[id];
    // }
    
    // updateName(id,name){
    //     this.players[id].name = name;
    // }

    getRoom(roomId){
        return this.roomService.getRoom(roomId);
    }   

    getRoomsData(){
        return this.roomService.getRoomsData();
    }

    joinRoom(playerId,userName,roomId){
        // if(this.players[playerId]) {
        //     return this.roomService.joinRoom(this.players[playerId],roomId);
        // }else{
        //     this.log(`Jugador con ID ${playerId} no se ha localizado intentando unirse a ${roomId}`);
        //     throw Error(`Jugador ${playerId} no localizado.`)
        // }   

        var player = {id: playerId, name:userName, isReady: false}
        return this.roomService.joinRoom(player,roomId);
    }
    
    exitRoom(playerId,roomId){
        // if(this.players[playerId]) {
            return this.roomService.exitRoom(playerId,roomId);
        // }else{
        //     this.log(`Jugador con ID ${playerId} saliendo de ${roomId}`);
        //     throw Error(`Jugador ${playerId} no localizado.`)
        // }   
    }

    startGame(roomId){
        var roomPlayers = this.roomService.getRoomPlayers(roomId)
        this.roomService.setRunningStatus(roomId);
        this.gameService.initGame(roomId);

        const blockchainService = this.app.get("blockchainService");
        return blockchainService.createGame(roomId,roomPlayers);
    }

    joinGame(gameId,userId,listener){
        this.gameService.suscribeClient(userId,gameId,listener);
    }

    exitGame(gameId,userId){
        this.gameService.clientExit(gameId,userId);
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
