const Room = require('../models/Room');
var Blockchain = require('../models/blockchain/Blockchain');
var socketService,sInstance = require('../sockets/socketService');
var app = require('../app')
var gameManagerInstance;

module.exports = class GameManager {
    constructor(){

        this.players = [];
        this.numPlayers = 0;
        this.gameRooms = [];
        this.textChats = {};
        this.textNumers = 0;
 
        for (var i=0; i<20; i++){
            this.gameRooms.push(new Room(this.sService,i,null));
        }
        this.gameRooms[5].roomStatus = "starting";
        this.gameRooms[6].roomStatus = "running";
        gameManagerInstance = this;
    }

    addPlayer(playerId,newName,socket){
        var finalName ="Desconocido " + this.numPlayers
        if(newName!==undefined || newName !==null){
            finalName = newName
        }
        var player = { id: playerId, name:newName };   
        this.players[playerId] =  player
        this.numPlayers++;
        this.joinRoom(playerId,1);
        this.startGame(1)
    }

    removePlayer(id){
        this.players[id] = {};
        this.numPlayers--;
    }
    getAllPlayers(){ return players;} 

    getPlayer(id){
        return this.players[id];
    }
    
    updateName(id,name){
        this.players[id].name = name;
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
            // console.log(socketService);
            gameRoom.addPlayer(player);
            var sockets = sInstance.getInstance();
            sockets.joinRoom(playerId,roomId);
        }
    }
    startGame(roomId){
        var sockets = sInstance.getInstance();
        const blockchain = new Blockchain(roomId,null, sockets.sio);
        sockets.sio.to(roomId).emit("newText","Generando blockchain..." + blockchain.id);
    }
};
