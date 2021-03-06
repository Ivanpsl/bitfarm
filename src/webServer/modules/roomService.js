const Room = require('./entities/room');
const { ROOM_CONSTANTS } = require("../../common/constants");
const { v4: uuidv4 } = require('uuid');
/** Servicio RoomService que coordina eventos y gestión de salas  */
class RoomService {
    constructor(app){
        this.app = app;
        this.gameRooms = [];
        this.textChats = {};
        this.textNumers = 0;
        this.initPublicRooms()
    }

    /**
     * Inicializa las salas publicas
     */
    initPublicRooms(){
        for (var i=0; i<20; i++){
            this.gameRooms.push(new Room(i,ROOM_CONSTANTS.TYPE_PUBLIC));
        }
    }
    /**
     * @param  {string} roomId - identificador de la sala
     */
    getRoom(roomId){
        return this.gameRooms.find(room => {return room.roomId == roomId});
    }
    
    /**
     * @param  {string} owner - identificador del jugador
     */
    createPrivateRoom(owner){
        var identifier = uuidv4();
        this.log("Creando sala privada con identificador "+identifier)

        var newRoom = new Room(identifier, ROOM_CONSTANTS.TYPE_PRIVATE, owner);
        this.gameRooms.push(newRoom);

        return newRoom;
    }
    /**
     * Metodo que vincula un usuario a una sala
     * 
     * @param  {object} player - información del jugador
     * @param  {string} roomId - identificador de la sala
     * @returns {object} - información de la partida a la que se ha unido
     */
    joinRoom(player,roomId){
        if(this.roomExist(roomId)){
            var gameRoom = this.getRoom(roomId);
            if(!gameRoom.isRunning()){
                gameRoom.addPlayer(player);

                return {userId: player.id, userName : player.name ,roomInfo: gameRoom.getData(), error:null};
            }else throw Error(`Sala ${roomId} ya esta jugando una partida`)
        }else{
            throw Error(`Sala ${roomId} no encontrada`)
        }
    }

    /**
     * Metodo que desvincula un usuario de una sala
     * 
     * @param  {string} playerId - identificador del jugador
     * @param  {string} roomId - idenficador de la sala
     */
    exitRoom(playerId,roomId){
        if(this.roomExist(roomId)){
            this.getRoom(roomId).removePlayerById(playerId);
        }else{
            throw Error(`Sala ${roomId} no encontrada `);
        }
    }
    /**
     * Metodo que actualiza el estado de un jugador en una sala
     * 
     * @param  {string} playerId - Identificador del jugador
     * @param  {string} roomId - Idenficador de la sala
     * @param  {boolean} status - Verdadero si el jugador esta listo, falso si no lo esta
     */
    setPlayeStatus(playerId,roomId,status){
        if(this.roomExist(roomId)){
            this.getRoom(roomId).setPlayerStatus(playerId,status);
        }else{
            throw Error(`Sala ${roomId} no encontrada `);
        }
    }
    /**
     * Metodo que establece el estado de la sala a jugando
     * 
     * @param  {string} roomId - Idenficador de la sala
     * @param  {object} gameData - objeto que contiene información del estado inicial de la partida
     */
    setRunningStatus(roomId,gameData){
        if(this.roomExist(roomId)){
            this.getRoom(roomId).startGame(gameData);
        }else{
            throw Error(`Sala ${roomId} no encontrada `);
        }
    }
    /**
     * Metodo que obtiene los jugadores de una sala
     * 
     * @param  {string} roomId - Idenficador de la sala
     *  @returns jugadores de la sala
     */
    getRoomPlayers(roomId){
        var roomData = this.getRoom(roomId).getData();
        return roomData.roomPlayers;
    }
    /**
     * Metodo que obtiene todas las salas publicas existentes
     * 
     * @returns lista de partidas
     */
    getPublicRooms(){
        return this.gameRooms.filter((room) => room.roomType == ROOM_CONSTANTS.TYPE_PUBLIC);
    }

    /**
     * Metodo que retorna informacion estructurada de todas las salas 
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