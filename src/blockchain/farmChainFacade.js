
/** Fachada / interfaz que ofrece funcionalidad a servicios externos para conectarse con FarmChainService */
class FarmChainFacade {
    constructor(service){
        this.farmChainService = service 
    }
    /**
     * @param  {string | number} gameId
     * @param  {string} actionName
     * @param  {Object} account
     * @param  {Object} actionData
     */
    async handleAction(gameId,actionName,account,actionData){
        return this.farmChainService.executeSmartContract(gameId, actionName, account, actionData)
    }
    /**
     * @param  {function} onTransaction
     * @param  {function} onNewBlock
     */
    suscribeToChainLog(onTransaction,onNewBlock){
        this.farmChainService.suscribeLog(onTransaction,onNewBlock)
    }
    /**
     * @param  {string | number} gameId
     * @param  {Object} playersData
     */
    createGame(gameId, playersData){
        return this.farmChainService.createGame(gameId,playersData);
    }
    /**
     * @param  {string | number} gameId
     * @param  {string | number} userId
     */
    endPlayerTurn(gameId, userId){
        return this.farmChainService.playerEndTurn(gameId, userId)
    }
}



module.exports = FarmChainFacade