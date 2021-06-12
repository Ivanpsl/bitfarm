const { GAME_CONSTANTS } = require("../../common/constants");

module.exports = class GameService {
    constructor(app){
        this.app = app;
        this.games = [];
        this.eventLogs = [];
    }

    initGame(gameId){
        this.games.push({id: gameId, playerListeners : []});
        this.eventLogs.push({id : gameId, logs : []});
    }

    getGames(gameId){
        return this.games.find(game => {
            return game.id == gameId;
        })
    }
    getEventsLog(gameId){
        for(let id in this.eventLogs){
            if(this.eventLogs[id] && this.eventLogs[id].id==gameId){
                // console.log(JSON.stringify(this.eventLogs[id].logs))
                return this.eventLogs[id].logs;
            }
        }
    }

    suscribeClient(gameId, playerId, listener){
        this.getGames(gameId)?.playerListeners.push({playerId: playerId, listener: listener});

        this.sendEventToAll(gameId,"SUSCRIBE_PLAYER",{id :playerId});


        console.log("EVFENTO PARA REFRESCO: "+ gameId);
        var logs =  this.getEventsLog(gameId);

        for(let evKey in logs){
                console.log("EVENTO DE REFRESCO "+ evKey );
                this.sendEvent(gameId,playerId,logs[evKey].oldEvent, logs[evKey].oldData);
        }
        
    }

    clientExit(gameId,playerId){
        this.getGames(gameId)?.playerListeners.filter(player => player.playerId !== playerId);
        this.sendEventToAll(gameId,GAME_CONSTANTS.EVENT_PLAYER_EXIT, {playerId : playerId});
    }

    sendNewBlockEvent(gameId,newBlock){
        this.sendEventToAll(gameId,GAME_CONSTANTS.EVENT_NEW_BLOCK_LOG,newBlock);
    }
    sendNewTransactionEvent(gameId,newTransaction){
        this.sendEventToAll(gameId,GAME_CONSTANTS.EVENT_NEW_TRANSACTION_LOG,newTransaction);
    }

    sendEvent(gameId, playerId, event, data){
        console.log("Enviando evento: " +event);
        var gameClient = this.getGames(gameId).playerListeners.find(client => {return client.playerId === playerId;});
        if(gameClient){
            
            var eventObj = {event:event, data: data};
            gameClient.listener.write(`data: ${JSON.stringify(eventObj)}\n\n`);
            console.log("Se ha enviado")
            this.getEventsLog(gameId).push({oldEvent : event, oldData: data});
        }
    }

    sendEventToAll(gameId,event,data){
        console.log("Enviando evento a todos: " +event);
        if(this.getGames(gameId)){
            var eventObj = {event:event, data: data};
            this.getGames(gameId).playerListeners.forEach(client => client.listener.write(`data: ${JSON.stringify(eventObj)}\n\n`));
            this.getEventsLog(gameId).push({oldEvent : event, oldData: data});
            
        }
    }
}