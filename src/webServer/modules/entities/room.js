const {ROOM_CONSTANTS} = require('../../../common/constants');

class Room {
    constructor(roomId, roomType, owner=null)
    {
        this.roomId = roomId;
        this.roomType = roomType;
        this.players = [];

        if(owner !==null){
            this.ownerId = owner.id;
        }
        else this.ownerId = null;

        this.listeners = [];
        this.roomStatus = ROOM_CONSTANTS.STATUS_EMPTY;
        this.messages = [];
        this.playersReady = 0;
    }

    getPlayerById(id){
        return this.players.find(player => player.id === id);
    }   

    
    setPlayerStatus(playerId,status){
        var player = this.getPlayerById(playerId);
        player.isReady=status
        if(player.isReady)
            this.playersReady++;
        else
            this.playersReady--;

        if(this.players.length > 1 && this.playersReady == this.players.length)
            return true;
        else {
            this.sendEventToAll(-1,ROOM_CONSTANTS.EVENT_PLAYER_CHANGE_STATUS, { player : {id:player.id, name: player.name}, isReady: status });
            return false;
        }
    }
    addPlayer(player){
        this.players.push(player);

        if ( this.players.length === 1){
            this.roomStatus = ROOM_CONSTANTS.STATUS_WAITING;
        }

        this.sendEventToAll(player.id, ROOM_CONSTANTS.EVENT_PLAYER_JOIN, player)
    }


    removePlayerById(playerId){
        var player = this.getPlayerById(playerId)
        this.removeListener(playerId);
        var idx = this.players.indexOf(player);
        if (idx != -1) this.players.splice(idx, 1);

        if ( this.players.length === 0){
            this.roomStatus = ROOM_CONSTANTS.STATUS_EMPTY;
        }
        this.sendEventToAll(playerId, ROOM_CONSTANTS.EVENT_PLAYER_EXIT, player)

    }

    addListener(playerId, listener){
        if(this.status !==  ROOM_CONSTANTS.STATUS_RUNNING){

            if(this.listeners.find(playerListener=> playerListener.id===playerId))
            {
                this.listeners.find(playerListener=> playerListener.id===playerId).listener = listener;
            }else this.listeners.push({id:playerId, listener: listener });

        }
    }
    removeListener(playerId){
        this.listeners = this.listeners.filter(playerListener => playerListener.id !== playerId);
    }
    
    addMessage(playerId, msg){
        var player = this.getPlayerById(playerId);
        var messageObj = {source : playerId, author: player.name, message: msg}
        this.messages.push(messageObj)
        this.sendEventToAll(playerId, ROOM_CONSTANTS.EVENT_PLAYERMESSAGE, messageObj)
    }

    sendEventToAll(sourceId,eventType, dta){
        if(process.env.NODE_ENV != 'test')
            console.log("> Enviando evento: " + eventType);
            
        for(let playerListener of this.listeners){
            if(playerListener && playerListener.listener && playerListener.id != sourceId){
                const event = {source:sourceId, eType:eventType, data:dta}
                playerListener.listener.send(event);
                playerListener.listener.end();
                playerListener.listener = null;
            }
        }
    }

    startGame(gameData){
        this.roomStatus = ROOM_CONSTANTS.STATUS_RUNNING;
        this.sendEventToAll(-1, ROOM_CONSTANTS.EVENT_GAME_START,gameData)
        this.listeners = [];
    }
    
    isRunning(){
        return this.roomStatus === ROOM_CONSTANTS.STATUS_RUNNING;
    }
    getData(){
        return {
            roomId : this.roomId,
            roomType : this.roomType,
            roomStatus : this.roomStatus,
            roomPlayers: this.players,
            numPlayers : this.players.length,
            messages : this.messages
        }
    }

}
module.exports = Room;