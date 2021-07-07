const { GAME_CONSTANTS } = require("../../common/constants");

module.exports = class GameService {
    constructor(app){
        this.app = app;
        this.games = [];
        this.eventLogs = [];
    }

    initGame(gameId){
        this.games = this.games.filter((game) => game.id != gameId);
        this.eventLogs = this.eventLogs.filter((log) => log.id != gameId);

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
        var gameListeners = this.getGames(gameId)
        if(gameListeners){
            var existent = gameListeners.playerListeners.find((list) =>list.playerId == playerId );
            if(!existent){
                gameListeners.playerListeners.push({playerId: playerId, listener: listener});

                // this.sendEventToAll(gameId,"SUSCRIBE_PLAYER",{id :playerId},false);

                listener.on("close", ()=> {
                    console.log(`*** Close. userId: ${playerId}`);
                    this.clientExit(gameId,playerId);
                });
                
                listener.on("end",()=> {
                    this.clientExit(gameId,playerId);
                });

                console.log("EVENTO PARA REFRESCO: "+ gameId);
                var logs =  this.getEventsLog(gameId);

                for(let evKey in logs){
                        console.log("EVENTO DE REFRESCO "+ evKey );
                        this.sendEvent(gameId,playerId,logs[evKey].oldEvent, logs[evKey].oldData,false);
                }
            }
        }
    }

    clientExit(gameId,playerId){
        if(this.getGames(gameId)){
            this.getGames(gameId).playerListeners = this.getGames(gameId).playerListeners.filter(player => player.playerId !== playerId);
            this.sendEventToAll(gameId,GAME_CONSTANTS.EVENT_PLAYER_EXIT, {playerId : playerId});
        }
    }

    sendPlayerEndTurnEvent(gameId,playerId){
        this.sendEventToAll(gameId, GAME_CONSTANTS.EVENT_PLAYER_END_TURN, {playerId : playerId});
    }
    sendStartTurnEvent(gameId, turnData){
        this.sendEventToAll(gameId, GAME_CONSTANTS.EVENT_START_TURN, {turnData: turnData});
    }
    sendOnBuyPlayerOffert(gameId,sourceAccount,offertIndex){
        this.sendEventToAll(gameId, GAME_CONSTANTS.EVENT_OFFERT_BUY, {source : sourceAccount, offertIndex: offertIndex});
    }
    
    sendOnPlayerCreateOffert(gameId,sourceAccount, offertIndex, itemType,itemIndex,price){
        this.sendEventToAll(gameId, GAME_CONSTANTS.EVENT_OFFERT_CREATE, {source : sourceAccount, offertIndex: offertIndex, itemType : itemType, itemIndex : itemIndex, price : price});
    }

    sendOnPlayerRemoveOffert(gameId,offertIndex){
        this.sendEventToAll(gameId, GAME_CONSTANTS.EVENT_OFFERT_REMOVE, {offertIndex: offertIndex});
    }

    sendOnPlayerAction(gameId,actionName,account,actionData){
        this.sendEventToAll(gameId, GAME_CONSTANTS.EVENT_PLAYER_ACTION, {source : account, action: actionName, actionData : actionData});
    }

    sendNewBlockEvent(gameId,newBlock){
        this.sendEventToAll(gameId,GAME_CONSTANTS.EVENT_NEW_BLOCK_LOG,newBlock);
        this.getEventsLog(gameId).push({oldEvent : GAME_CONSTANTS.EVENT_NEW_BLOCK_LOG, oldData: newBlock});
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
        }
    }

    sendEventToAll(gameId,event,data,log=true){
        console.log("Enviando evento a todos: "+gameId+" "  +event);
        if(this.getGames(gameId)){
            var eventObj = {event:event, data: data};
            this.getGames(gameId).playerListeners.forEach(client => {
                console.log("Evento para: "+client.playerId);
                if(client.listener)
                    client.listener.write(`data: ${JSON.stringify(eventObj)}\n\n`)
            });
            if(log)
                this.getEventsLog(gameId).push({oldEvent : event, oldData: data});
        }
    }
}