const Room = require('./model/room');
const {ROOM_CONSTANTS} = require("../../common/constants");
const { v4: uuidv4 } = require('uuid');
module.exports = class RoomService {
    constructor(app){
        this.app = app;
        this.gameRooms = [];
        this.textChats = {};
        this.textNumers = 0;
        this.initPublicRooms()
    }
    
    initPublicRooms(){
        for (var i=0; i<20; i++){
            this.gameRooms.push(new Room(i,ROOM_CONSTANTS.ROOM_TYPE_PUBLIC));
        }
    }

    getRoom(roomId){
        return this.gameRooms.find(room => {return room.roomId == roomId});
    }
    
    createRoom(owner){
        const identifier = uuidv4();
        const newRoom = new Room(identifier,ROOM_CONSTANTS.ROOM_TYPE_PRIVATE,owner);
        this.gameRooms.push(newRoom);
    }

    joinRoom(player,roomId){
        if(this.roomExist(roomId)){
            var gameRoom = this.getRoom(roomId);
            
            gameRoom.addPlayer(player);
            this.log("RoomInfo " + JSON.stringify(gameRoom.getData()));

            return {userId: player.id, userName : player.name ,roomInfo: gameRoom.getData(), error:null};
        }else{
            throw Error(`Sala ${roomId} no encontrada `)
        }
    }
    exitRoom(playerId,roomId){
        if(this.roomExist(roomId)){
            this.getRoom(roomId).removePlayerById(playerId);
        }else{
            throw Error(`Sala ${roomId} no encontrada `);
        }
    }
    setPlayeStatus(playerId,roomId,status){
        if(this.roomExist(roomId)){
            this.getRoom(roomId).setPlayerStatus(playerId,status);
        }else{
            throw Error(`Sala ${roomId} no encontrada `);
        }
    }

    setRunningStatus(roomId,gameData){
        if(this.roomExist(roomId)){
            this.getRoom(roomId).startGame(gameData);
        }else{
            throw Error(`Sala ${roomId} no encontrada `);
        }
    }

    getRoomPlayers(roomId){
        var roomData = this.getRoom(roomId).getData();
        return roomData.roomPlayers;
    }

    getRoomsData(){
        var data = [];
        this.gameRooms.forEach(gameRoom => {
            data.push(gameRoom.getData())
        });
        return data;
    }

    roomExist(roomId){
        return (this.getRoom(roomId) !== null)
    }
    
    log(text){ console.log("\x1b[1m\x1b[32m%s\x1b[0m","[RoomService] "+ text); }
}