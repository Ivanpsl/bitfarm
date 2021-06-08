const { GAME_CONSTANS } = require("../../common/constants");

module.exports = class GameEventsService {
    constructor(app){
        this.app = app;
        this.games = [];
    }

    initGame(gameId){
        this.games.push({id: gameId, playerListeners : []})
    }

    getGames(gameId){
        return this.games.find(game => {
            return game.id === gameId;
        })
    }

    suscribeClient(gameId, playerId, listener){
        this.getGames(gameId).playerListeners.push({playerId: playerId, listener: listener});
    }

    clientExit(gameId,playerId){
        this.getGames(gameId).playerListeners.filter(player => player.playerId !== playerId);
        this.sendEventToAll(gameId,GAME_CONSTANS.EVENT_PLAYER_EXIT, {playerId : playerId});
    }

    sendEvent(gameId, playerId, event, data){
        var gameClient = this.getGames(gameId).find(client => {return client.playerId === playerId;});
        gameClient.listener.write(`event: ${JSON.stringify(event)} data: ${JSON.stringify(data)}\n`);
    }

    sendEventToAll(gameId,event,data){
        this.getGames(gameId).forEach(client => client.listener.write(`event: ${event} data: ${JSON.stringify(data)}\n`));
    }
}