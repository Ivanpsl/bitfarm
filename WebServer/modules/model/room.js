const { ROOM_STATUS_EMPTY, ROOM_STATUS_WAITING, ROOM_STATUS_RUNNING, ETYPE_PLAYERMESSAGE,ROOM_TYPE_PUBLIC,ROOM_TYPE_PRIVATE} = require('../utils/Constants');

module.exports = class Room {

    constructor(roomId,owner,roomType)
    {
        this.roomId = roomId;
        this.roomType = roomType;
        if(owner !==null)
            this.ownerId = owner.id;
        else this.ownerId = null;
        this.players = [];
        this.roomStatus = "empty"
        this.messages = [];
    }

    getPlayerById(id){
                // -- console.log("Buscando jugador: " + JSON.stringify(player) + " ---- " + JSON.stringify(this.players))
        return this.players.find(player => {
            if(player.id === id) return true
        });
    }   

    addPlayer(player){
        console.log("Añadiendo jugador a sala: " + player.id + "    " + player.name)
        this.players.push(player);
        console.log(this.players)

        if ( this.players.length === 1){
            this.roomStatus = "waiting";
        }
    }

    addListener(playerId, listener){
        var player = this.getPlayerById(playerId);
        player.listener = listener;
    }
    
    sendUserMessage(sourceId, msg){
        var player = this.getPlayerById(sourceId);
        
        var message = {playerId :sourceId, author: player.name, message: msg}
        this.messages.push(message)
        this.sendEvent(sourceId,{eType:ETYPE_PLAYERMESSAGE, source : sourceId, name:player.name, data: message})
    }

    sendEvent(sourceId,ev){
        for(let player of this.players){
            if(player.listener){
                player.listener.json({id:sourceId, data:ev});
                // player.listener.json(ev);
                player.listener.end();
            }
        }
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