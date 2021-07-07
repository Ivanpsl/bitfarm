class FarmChainFacade {
    constructor(service){
        this.farmChainService = service 
    }

    async handleAction(gameId,actionName,account,actionData){
        return this.farmChainService.executeSmartContract(gameId, actionName, account, actionData)
    }

    suscribeToChainLog(onTransaction,onNewBlock){
        this.farmChainService.suscribeLog(onTransaction,onNewBlock)
    }

    createGame(gameId, players){
        return this.farmChainService.createGame(gameId,players);
    }

    endPlayerTurn(gameId, userId){
        return this.farmChainService.playerEndTurn(gameId, userId)
    }
}



module.exports = FarmChainFacade