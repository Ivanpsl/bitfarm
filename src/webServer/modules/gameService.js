const { GAME_CONSTANTS } = require("../../common/constants");
/** Servicio GameService que coordina el envio de eventos entre jugadores en la aplicación  */

class GameService {
    /**
     * @constructor
     * @param  {Object} app - Objeto app de express.js
     */
    constructor(app){
        this.app = app;
        this.games = [];
        this.eventLogs = [];
    }
    
    /**
     * Funcion init Game
     * @param  {string} gameId - Identificador del juego
     */
    initGame(gameId){
        this.games = this.games.filter((game) => game.id != gameId);
        this.eventLogs = this.eventLogs.filter((log) => log.id != gameId);

        this.games.push({id: gameId, playerListeners : []});
        this.eventLogs.push({id : gameId, logs : []});
    }
    /**
     * Obtiene el objeto que contiene los jugadores y sus listeners de una ID pasada como parametro
     * @param  {string} gameId - Identificador del juego
     */
    getGames(gameId){
        return this.games.find(game => {
            return game.id == gameId;
        })
    }
    /**
     * 
     * @param  {string} gameId - Identificador del juego
     * @return  - lista de logs de eventos registrados en la aplicación
     */
    getEventsLog(gameId){
        for(let id in this.eventLogs){
            if(this.eventLogs[id] && this.eventLogs[id].id==gameId){
                // console.log(JSON.stringify(this.eventLogs[id].logs))
                return this.eventLogs[id].logs;
            }
        }
    }
    /**
     * Metodo que vincula una id de un jugador y su listener a una partida 
     * 
     * @param  {string} gameId - Identificador del juego
     * @param  {string} playerId - Identificador del jugador
     * @param  {Object} listener - Objeto a traves del que se envian datos del servidor al cliente
     */
    suscribeClient(gameId, playerId, listener){
        var gameListeners = this.getGames(gameId)
        if(gameListeners){
            var existent = gameListeners.playerListeners.find((list) =>list.playerId == playerId );
            if(!existent){
                gameListeners.playerListeners.push({playerId: playerId, listener: listener});

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
                        this.sendEvent(gameId,playerId,logs[evKey].oldEvent, logs[evKey].oldData);
                }
            }
        }
    }
    /**
     * Metodo por el cual desvincula a un jugador y su listener de una partida
     * 
     * @param  {string} gameId - Identificador del juego
     * @param  {string} playerId - Identificador del jugador
     */
    clientExit(gameId,playerId){
        if(this.getGames(gameId)){
            this.getGames(gameId).playerListeners = this.getGames(gameId).playerListeners.filter(player => player.playerId !== playerId);
            this.sendEventToAll(gameId,GAME_CONSTANTS.EVENT_PLAYER_EXIT, {playerId : playerId});
        }
    }
    /**
     * Envia evento de finalización de turno a los jugadores 
     * 
     * @param  {string} gameId - Identificador del juego
     * @param  {string} playerId - Identificador del jugador
     */
    sendPlayerEndTurnEvent(gameId,playerId){
        this.sendEventToAll(gameId, GAME_CONSTANTS.EVENT_PLAYER_END_TURN, {playerId : playerId});
    }

    /**
     * Envia evento de inicio de turno a los jugadores 
     * 
     * @param  {string} gameId - Identificador del juego
     * @param  {Object} turnData - Estado actual de la partida
     */
    sendStartTurnEvent(gameId, turnData){
        this.sendEventToAll(gameId, GAME_CONSTANTS.EVENT_START_TURN, {turnData: turnData});
    }
    
    /**
     * Envia evento de compra de una oferta de jugador a todos los jugadores
     * 
     * @param  {string} gameId - Identificador del juego
     * @param  {object} sourceAccount - Objeto cuenta del emisor, con clave privada y publica
     * @param  {number} offertIndex - Indice de la oferta
     */
    sendOnBuyPlayerOffert(gameId,sourceAccount,offertIndex){
        this.sendEventToAll(gameId, GAME_CONSTANTS.EVENT_OFFERT_BUY, {source : sourceAccount, offertIndex: offertIndex});
    }
    
    /**
     * Función que envia una nueva oferta creada por un jugador
     * 
     * @param  {string} gameId - Identificador del juego
     * @param  {object} sourceAccount - Objeto cuenta del emisor, con clave privada y publica
     * @param  {number} offertIndex - Indice de la oferta
     * @param  {string} itemType - Tipo del objeto que se oferta
     * @param  {number} itemIndex - Indice del objeto que se oferta
     * @param  {number} price - Precio del item que se oferta
     */
    sendOnPlayerCreateOffert(gameId,sourceAccount, offertIndex, itemType,itemIndex,price){
        this.sendEventToAll(gameId, GAME_CONSTANTS.EVENT_OFFERT_CREATE, {source : sourceAccount, offertIndex: offertIndex, itemType : itemType, itemIndex : itemIndex, price : price});
    }
    /**
     * Función que envia evento que informa de la eliminación de una oferta por parte de un jugador 
     * 
     * @param  {string} gameId - Identificador del juego
     * @param  {number} offertIndex - Indice de la oferta
     */
    sendOnPlayerRemoveOffert(gameId,offertIndex){
        this.sendEventToAll(gameId, GAME_CONSTANTS.EVENT_OFFERT_REMOVE, {offertIndex: offertIndex});
    }
    /**
     * Función que envia información de una acción de un jugador
     * 
     * @param  {string} gameId - Identificador del juego
     * @param  {string} actionName - Nombre de la accion
     * @param  {object} account -  Objeto cuenta del emisor, con clave privada y publica
     * @param  {object} actionData - Datos que acompañan a la accion
     */
    sendOnPlayerAction(gameId,actionName,account,actionData){
        this.sendEventToAll(gameId, GAME_CONSTANTS.EVENT_PLAYER_ACTION, {source : account, action: actionName, actionData : actionData});
    }
    /**
     * Función que envia evento de log de un nuevo bloque en la blockchain
     * 
     * @param  {string} gameId - Identificador del juego
     * @param  {object} newBlock - Objeto que contiene la infomacion del nuevo bloque
     */
    sendNewBlockEvent(gameId,newBlock){
        this.sendEventToAll(gameId,GAME_CONSTANTS.EVENT_NEW_BLOCK_LOG,newBlock);
        this.getEventsLog(gameId).push({oldEvent : GAME_CONSTANTS.EVENT_NEW_BLOCK_LOG, oldData: newBlock});
    }
    
    /**
     * Función que envia evento de log de una nueva transacción en la blockchain
     * 
     * @param  {string} gameId - Identificador del juego
     * @param  {object} newTransaction - Objeto que contiene la infomacion de la nueva transacción
     */
    sendNewTransactionEvent(gameId,newTransaction){
        this.sendEventToAll(gameId,GAME_CONSTANTS.EVENT_NEW_TRANSACTION_LOG,newTransaction);
    }
    /**
     * Función que envia un evento a un jugador en concreto
     * 
     * @param  {string} gameId - Identificador del juego
     * @param  {string} playerId - Identificador del jugador
     * @param  {string} event - Nombre del evento
     * @param  {object} data - Data que contiene información adicional para el evento 
     */
    sendEvent(gameId, playerId, event, data){
        var gameClient = this.getGames(gameId).playerListeners.find(client => {return client.playerId === playerId;});
        if(gameClient){
            
            var eventObj = {event:event, data: data};
            gameClient.listener.write(`data: ${JSON.stringify(eventObj)}\n\n`);
        }
    }
    /**
     * Función que envia un evento a todos los jugadores
     * 
     * @param  {string} gameId - Identificador del juego
     * @param  {string} event - Nombre del evento
     * @param  {object} data - Data que contiene información adicional para el evento 
     * @param  {boolean} log=true
     */
    sendEventToAll(gameId,event,data,log=true){
        if(this.getGames(gameId)){
            var eventObj = {event:event, data: data};
            this.getGames(gameId).playerListeners.forEach(client => {
                if(client.listener)
                    client.listener.write(`data: ${JSON.stringify(eventObj)}\n\n`)
            });
            if(log)
                this.getEventsLog(gameId).push({oldEvent : event, oldData: data});
        }
    }
}

module.exports = GameService;