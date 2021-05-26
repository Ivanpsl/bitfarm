const Room = require('./model/room');

module.exports = class GameService {
    constructor(app){
        this.app = app;
        this.players = [];
        this.numPlayers = 0;
        this.gameRooms = [];
        this.textChats = {};
        this.textNumers = 0;
        this.nodes = [];
        // this.addNode({host:"testNode", ip:"testIp", port:"testPort"})
        for (var i=0; i<20; i++){
            this.gameRooms.push(new Room(i,null));
        }
        this.gameRooms[6].roomStatus = "running";
    }
    addPlayer(playerToken,newName){
        var playerId = this.numPlayers + 1; 
        if (this.players[playerId] == null) {
            var finalName ="Desconocido " + this.numPlayers
            if(newName!==undefined || newName !==null){
                finalName = newName
            }
            var player = { id: playerId, token: playerToken, name:newName }; 
        
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
        return this.gameRooms[roomId];
    }   

    getRoomsData(){
        var data = [];
        for(let i=0; i<this.gameRooms.length; i++){
            data[i] = this.gameRooms[i].getData();
        }

        return data;
    }

    joinRoom(playerId,roomId){
        if(this.gameRooms[roomId] !== null){
            var player= this.players[playerId];
            var gameRoom = this.gameRooms[roomId];
            console.log(gameRoom + "    " + JSON.stringify(this.players))
            if(gameRoom && player){
                gameRoom.addPlayer(player);
                this.log("RoomInfo " + JSON.stringify(gameRoom.getData()));
                return {roomInfo: gameRoom.getData(), error:null};

            }else{

                return {roomInfo: null, error:" No se ha podido unir"}
            }
        }else{
            return {roomInfo: null, error:" No se ha podido unir"}
        }
    }
    startGame(roomId){
        
    }

    addNode(nodeData) {
        this.log("Registrando nodo: "+nodeData.host)
        this.nodes[this.nodes.length] = nodeData;
    }

    getNodes(){
        return this.nodes;
    }

    log(text){
        console.log("\x1b[35m%s\x1b[0m","[GameManager] "+ text)
    }
};
