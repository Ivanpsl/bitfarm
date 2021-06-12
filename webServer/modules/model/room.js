const {ROOM_CONSTANTS} = require('../../../common/constants');

module.exports = class Room {
    constructor(roomId,roomType, owner=null)
    {
        this.roomId = roomId;
        this.roomType = roomType;
        if(owner !==null){
            this.ownerId = owner.id;
            this.players.push(owner);
        }
        else this.ownerId = null;
        this.players = [];
        this.listeners = [];
        this.roomStatus = ROOM_CONSTANTS.STATUS_EMPTY;
        this.messages = [];
    }

    getPlayerById(id){
                // -- console.log("Buscando jugador: " + JSON.stringify(player) + " ---- " + JSON.stringify(this.players))
        return this.players.find(player => player.id === id);;
    }   
    setPlayerStatus(playerId,status){
        var player = this.getPlayerById(playerId);
        player.isReady=status
        this.sendEventToAll(-1,ROOM_CONSTANTS.EVENT_PLAYER_CHANGE_STATUS, { player : {id:player.id, name: player.name}, isReady: status });
    }
    addPlayer(player){
        console.log("Añadiendo jugador a sala: " + player.id + "    " + player.name);
        this.players.push(player);
        console.log(this.players)

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

        console.log("Players: " + JSON.stringify(this.players));
        console.log("Eliminado jugador con id: "+ player.id);

        if ( this.players.length === 0){
            this.roomStatus = ROOM_CONSTANTS.STATUS_EMPTY;
        }
        this.sendEventToAll(playerId, ROOM_CONSTANTS.EVENT_PLAYER_EXIT, player)

    }

    addListener(playerId, listener){
        console.log("Añadiendo listener")
        if(this.status !==  ROOM_CONSTANTS.STATUS_RUNNING){
            console.log("añadiendo listener "+ playerId);

            if(this.listeners.find(playerListener=> playerListener.id===playerId))
            {
                this.listeners.find(playerListener=> playerListener.id===playerId).listener = listener;
            }else this.listeners.push({id:playerId, listener: listener });

            console.log("Listeners "+this.listeners.length)
        }
    }
    removeListener(playerId){
        this.listeners.filter(playerListener => playerListener.id !== playerId);
    }
    
    addMessage(playerId, msg){
        var player = this.getPlayerById(playerId);
        var messageObj = {source : playerId, author: player.name, message: msg}
        this.messages.push(messageObj)
        this.sendEventToAll(playerId, ROOM_CONSTANTS.EVENT_PLAYERMESSAGE, messageObj)
    }

    sendEventToAll(sourceId,eventType, dta){
        console.log("> Enviando evento: " + eventType);
        console.log("-> Listeners: " + this.listeners.length);
        for(let playerListener of this.listeners){
            if(playerListener && playerListener.listener && playerListener.id != sourceId){
                console.log("-->> Enviado a " + playerListener.id);
                const event = {source:sourceId, eType:eventType, data:dta}
                playerListener.listener.send(event);
                playerListener.listener.end();
                playerListener.listener = null;
            }
        }
    }

    startGame(){
        this.roomStatus = ROOM_CONSTANTS.STATUS_RUNNING;
        this.sendEventToAll(-1, ROOM_CONSTANTS.EVENT_GAME_START)
        this.listeners = [];
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