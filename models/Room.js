const socketListener = require('./../sockets/socketListener').getI;
const Blockchain = require('./blockchain/Blockchain');

// var io = require('socket.io')(server);
// var server = http.createServer()
module.exports = class Room {

    constructor(socketService,roomId,owner)
    {
        this.sService = socketService;
        this.roomId = roomId;
        if(owner !==null)
            this.ownerId = owner.id;
        else this.ownerId = null;
        this.players = [];
        this.numPlayers = 0;
        this.roomStatus = "empty"
        this.Blockchain = {};
    }

    addPlayer(player){
        this.players.push(player);
        this.numPlayers++;

        if (this.numPlayers >0){
            this.roomStatus = "waiting";
        }
    }

    addBlockchain(blockchain){
        this.Blockchain = blockchain;
    }

    getData(){
        var data = {
            roomId : this.roomId,
            roomStatus : this.roomStatus
        }
        return data;
    }

}