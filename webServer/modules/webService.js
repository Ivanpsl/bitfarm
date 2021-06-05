const RoomService = require('./roomService');

module.exports = class WebService {
    constructor(app){
        this.app = app;
        this.players = [];
        this.numPlayers = 0;
        this.textNumers = 0;
        this.nodes = [];
        this.roomService = new RoomService(app);

    }
    addPlayer(playerToken,newName){
        var playerId = this.numPlayers + 1; 
        if (this.players[playerId] == null) {
            var player = { id: playerId, token: playerToken, name:newName, isReady: false }; 
        
            this.players[playerId] =  player
            this.numPlayers++;
            this.log(`Se ha registrado a un nuevo jugador correctamente. [${playerId}] ${newName} `)
            return player;
        }else{
            return null;
        }
    }

    removePlayer(id){
        this.players[id] = null;
        this.numPlayers--;
    }
    getAllPlayers(){ return players;} 

    getPlayer(id){
        return this.players[id];
    }
    
    updateName(id,name){
        this.players[id].name = name;
    }

    getRoom(roomId){
        return this.roomService.getRoom(roomId);
    }   

    getRoomsData(){
        return this.roomService.getRoomsData();
    }

    joinRoom(playerId,roomId){
        if(this.players[playerId]) {
            return this.roomService.joinRoom(this.players[playerId],roomId);
        }else{
            this.log(`Jugador con ID ${playerId} no se ha localizado intentando unirse a ${roomId}`);
            throw Error(`Jugador ${playerId} no localizado.`)
        }   
    }
    exitRoom(playerId,roomId){
        if(this.players[playerId]) {
            return this.roomService.exitRoom(playerId,roomId);
        }else{
            this.log(`Jugador con ID ${playerId} saliendo de ${roomId}`);
            throw Error(`Jugador ${playerId} no localizado.`)
        }   
    }

    startGame(roomId){
        this.roomService.startGame(roomId);
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
