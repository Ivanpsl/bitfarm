const Room = require('./model/room');
const {ROOM_CONSTANTS} = require("../../common/constants");
const { v4: uuidv4 } = require('uuid');
module.exports = class RoomService {
    constructor(app){
        this.app = app;
        this.gameRooms = [];
        this.textChats = {};
        this.textNumers = 0;
        initPublicRooms()
    }
    
    initPublicRooms(){
        for (var i=0; i<20; i++){
            this.gameRooms.push(new Room(i,ROOM_CONSTANTS.ROOM_TYPE_PUBLIC));
        }
    }

    createRoom(owner){
        const identifier = uuidv4();
        const newRoom = new Room(identifier,ROOM_CONSTANTS.ROOM_TYPE_PRIVATE,owner);
        this.gameRooms.push(newRoom);
    }

    joinRoom(player,roomId){
        if(this.gameRooms[roomId] !== null){
            var gameRoom = this.gameRooms[roomId];
            gameRoom.addPlayer(player);
            this.log("RoomInfo " + JSON.stringify(gameRoom.getData()));
            return {userName : player.name ,roomInfo: gameRoom.getData(), error:null};
        }else{
            throw Error(`Sala ${roomId} no encontrada `)
            // return {roomInfo: null, error:" No se ha podido unir"};
        }
    }
    exitRoomById(playerId,roomId){
        if(this.gameRooms[roomId] !== null){
            this.gameRooms[roomId].removePlayerById(playerId);
        }else{
            throw Error(`Sala ${roomId} no encontrada `);
        }
    }

    startGame(roomId){
        this.log(roomId)
        var roomData = this.gameRooms[roomId].getData()
        const blockchainService = this.app.get("blockchainService");
        return blockchainService.createGame(roomId,roomData.roomPlayers)
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
    
    log(text){ console.log("\x1b[1m\x1b[32m%s\x1b[0m","[RoomService] "+ text); }
}