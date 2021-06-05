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
        return this.players.find(player => {
            if(player.id === id) return true
        });
    }   
    setPlayerStatus(playerId,status){
        this.getPlayerById(playerId).isReady=status;
        this.sendEventToAll(playerId,ROOM_CONSTANTS.EVENT_PLAYER_CHANGE_STATUS, { isReady: status });
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
        var player = this.getPlayerById(playerId);
        if(player){
            //this.listeners.push({id:player.id, listener: listener })
            this.listeners[player.id] = {id:player.id, listener: listener };
        }
    }
    removeListener(playerId){
        // var playerListener = this.listeners.find(listener => {
        //     if(listener.id === playerId) return true
        // });

        // if(playerListener){
        //     var idx = this.listeners.indexOf(playerListener);
        //     if (idx != -1) this.listeners.splice(idx, 1);
        // }
        if(this.listeners[playerId]){
            this.listeners[playerId] = null;
        }
    }
    
    addMessage(playerId, msg){
        var player = this.getPlayerById(playerId);
        var messageObj = {source : playerId, author: player.name, message: msg}
        this.messages.push(messageObj)
        this.sendEventToAll(playerId, ROOM_CONSTANTS.EVENT_PLAYERMESSAGE, messageObj)
    }

    sendEventToAll(sourceId,eventType, dta){
        console.log("Enviando evento: " + eventType);
        console.log(this.playerListeners);
        for(let playerListener of this.listeners){
            if(playerListener && playerListener.listener && playerListener.id != sourceId){
                console.log("Enviado a " + playerListener.id);
                console.log("Enviado a " + playerListener.id);
                const event = {source:sourceId, eType:eventType, data:dta}
                console.log(event)
                playerListener.listener.send(event);
                playerListener.listener.end();
            }
        }
    }

    startGame(){
        this.roomStatus = ROOM_CONSTANTS.STATUS_RUNNING;
    }
    
    getData(){
        return {
            roomId : this.roomId,
            roomStatus : this.roomStatus,
            roomPlayers: this.players,
            numPlayers : this.players.length,
            messages : this.messages
        }
    }

}