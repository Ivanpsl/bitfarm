const Room = require('./entities/room');
const { ROOM_CONSTANTS } = require("../../common/constants");
const { v4: uuidv4 } = require('uuid');
class RoomService {
    constructor(app){
        this.app = app;
        this.gameRooms = [];
        this.textChats = {};
        this.textNumers = 0;
        this.initPublicRooms()
    }
    
    /**
     */
    initPublicRooms(){
        for (var i=0; i<20; i++){
            this.gameRooms.push(new Room(i,ROOM_CONSTANTS.TYPE_PUBLIC));
        }
    }
    /**
     * @param  {} roomId
     */
    getRoom(roomId){
        return this.gameRooms.find(room => {return room.roomId == roomId});
    }
    
    /**
     * @param  {} owner
     */
    createRoom(owner){
        var identifier = uuidv4();
        this.log("Creando sala privada con identificador "+identifier)

        var newRoom = new Room(identifier, ROOM_CONSTANTS.TYPE_PRIVATE, owner);
        this.gameRooms.push(newRoom);

        return newRoom;
    }
    /**
     * @param  {} player
     * @param  {} roomId
     */
    joinRoom(player,roomId){
        if(this.roomExist(roomId)){
            var gameRoom = this.getRoom(roomId);
            if(!gameRoom.isRunning()){
          
                
                gameRoom.addPlayer(player);
                this.log("RoomInfo " + JSON.stringify(gameRoom.getData()));

                return {userId: player.id, userName : player.name ,roomInfo: gameRoom.getData(), error:null};
            }else throw Error(`Sala ${roomId} ya esta jugando una partida`)
        }else{
            throw Error(`Sala ${roomId} no encontrada`)
        }
    }
    /**
     * @param  {} playerId
     * @param  {} roomId
     */
    exitRoom(playerId,roomId){
        if(this.roomExist(roomId)){
            this.getRoom(roomId).removePlayerById(playerId);
        }else{
            throw Error(`Sala ${roomId} no encontrada `);
        }
    }
    /**
     * @param  {} playerId
     * @param  {} roomId
     * @param  {} status
     */
    setPlayeStatus(playerId,roomId,status){
        if(this.roomExist(roomId)){
            this.getRoom(roomId).setPlayerStatus(playerId,status);
        }else{
            throw Error(`Sala ${roomId} no encontrada `);
        }
    }
    /**
     * @param  {} roomId
     * @param  {} gameData
     */
    setRunningStatus(roomId,gameData){
        if(this.roomExist(roomId)){
            this.getRoom(roomId).startGame(gameData);
        }else{
            throw Error(`Sala ${roomId} no encontrada `);
        }
    }
    /**
     * @param  {} roomId
     */
    getRoomPlayers(roomId){
        var roomData = this.getRoom(roomId).getData();
        return roomData.roomPlayers;
    }

    getPublicRooms(){
        return this.gameRooms.filter((room) => room.roomType == ROOM_CONSTANTS.TYPE_PUBLIC);
    }

    /**
     */
    getRoomsData(){
        var data = [];
        this.getPublicRooms().forEach(gameRoom => {
            data.push(gameRoom.getData())
        });
        return data;
    }
    /**
     * @param  {} roomId
     */
    roomExist(roomId){
        return (this.getRoom(roomId) != null && this.getRoom(roomId) != undefined )
    }
    
    log(text){ 
        if(process.env.NODE_ENV != 'test')
            console.log("\x1b[1m\x1b[32m%s\x1b[0m","[RoomService] "+ text);
     }
}

module.exports = RoomService;