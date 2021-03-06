const {GAME_CONSTANTS} = require('./../common/constants')
const smFactory = require("./smartContract/smartContractFactory")
const cryptoUtils = require("./utils/cryptoUtils");
const config = require('config');

const NodeP2PService = require('./p2p/nodeP2PService');
const FarmChainFacade = require("./farmChainFacade");
const Village = require("./model/game/village");
const Blockchain = require("./model/blockchain");
const Transaction = require("./model/transaction");
const Block = require("./model/block");
const Player = require("./model/game/player");


/** Servicio FarmChainService que coordina los componentes de la blockchain  */
class FarmChainService {
    constructor(chainConfig){
        this.blockchains = {};
        this.villages = {};
        this.smartContracts = smFactory.createSmartContracts();
        this.config = chainConfig;

        
        this.onNewTransactionListeners = [];
        this.onNewBlockListeners = [];

        this.nodeService = new NodeP2PService(this, this.config.node_host, this.config.node_port, this.config.logger);
        this.facade = new FarmChainFacade(this)
    }

    
    /**
     * Método que inicia el servicio del nodo para unirse a la red
     */
    startNode(){
        this.nodeService.init();
    }

    /**
     * Método que devuelve la interfaz con la que se pueden comunicar otros servicios 
     * 
     * @returns {FarmChainFacade}
     */
    getFacade(){
        return this.facade;
    }

    /**
     * Método que permite la suscripcion de delegados a eventos en la blockchain
     * 
     * @param  {function} onTransaction - delegado al que se informa de la creación de una nueva transacción
     * @param  {function} onNewBlock - delegado al que se lee informa de la creación de un nuevo bloque
     */
    suscribeLog(onTransaction,onNewBlock){
        this.log("Añadiendo suscripción")
        if(typeof onTransaction === 'function' && typeof onNewBlock === 'function'){
            this.onNewTransactionListeners.push(onTransaction);
            this.onNewBlockListeners.push(onNewBlock);
        }else{
            this.logError("Intentando suscribirse con un tipo incorrecto");
        }
    }

    /**
     * Método que se ejecuta en la creación de una nueva transaccion y la propaga a los delegados suscritos a dicho evento
     * 
     * @param  {number | string} identifier - identificador de la partida/blockchain
     * @param  {Transaction} transaccion - nuevo objeto transaccion
     */
    onTransaction(identifier,transaccion){
        this.onNewTransactionListeners.forEach(listener => listener(identifier,transaccion));
    }

    /**      
     * Método que se ejecuta en la creación de un nuebo bloque y lo propaga a los delegados suscritos a dicho evento y al resto de la red
     * @param  {number | string} identifier - identificador de la partida/blockchain
     * @param  {Block} block -nuevo objeto bloque
     */
    onBlockMined(identifier,block){
        this.nodeService.propagateNewBlock(identifier,block);
        this.onNewBlockListeners.forEach(listener => listener(identifier,block));
    }

    /**
     * Método que retorna el estado actual de una partida almacenada en la blockchain
     * 
     * @param  {number | string} gameId - identificador de la partida
     * @return {Village} - Estado de la partida
    */
    getGameState(gameId){
        return this.villages[gameId];
    }   
    
    /**
     * 
     * @param  {number | string} gameId - Identificador de la partida
     * @param  {Object} players - Objeto que contiene la lista de jugadores
     */
    createGame(gameId, players){
        this.log("Creando partida para "+gameId)

        //Creación de todas las cuentas participantes
        var playersData = {}
        var hallAccount = cryptoUtils.generateKeyPair();
        players.forEach((player) => {
            this.log("Añadiendo jugador " + player.name);
            const account = cryptoUtils.generateKeyPair();
            playersData[account.publicKey] =  new Player(player.id, player.name, account);
        })
    
        //Creacion del estado de la partida y blockchain
        var newVillage = new Village(gameId,hallAccount,playersData,config.get("Game"));
        var blockchain = new Blockchain(gameId);

        blockchain.addObserver(
            (chainIdentifier,transaction)=> {this.onTransaction(chainIdentifier,transaction)}, 
            (chainIdentifier,block)=> {this.onBlockMined(chainIdentifier,block)}
            );

        this.blockchains[gameId] = blockchain;
        this.villages[gameId] = newVillage;

        this.nodeService.propagateNewBlock(gameId,blockchain.getLastBlock());

        //ejecución del contrato de inicio 
        var contractData = {config : config.get("Game")};
        this.executeSmartContract(gameId, GAME_CONSTANTS.ACTION_START_GAME, hallAccount, contractData);
        
        this.log("Partida creada: " + JSON.stringify(this.villages[gameId]));
        return this.villages[gameId];
    }
    /**
     * Método que ejecuta un SmartContract
     * 
     * @param  {number | string} gameId - Identificador de la partida
     * @param  {string} smartContractName  - Nombre identificador del SmartContract a ejecutar
     * @param  {Object} account - Objeto que contiene clave privada y publica del desencadenante de la acción
     * @param  {Object} actionData - Información adicional que requiere la acción
     */
    async executeSmartContract(gameId, smartContractName, account, actionData)
    {
        this.log("Ejecutando contrato "+smartContractName+ "\n\t\t" + JSON.stringify(actionData))
        try{
            const smartContract = this.smartContracts[smartContractName];
            if (smartContract)
            {
                if(this.villages[gameId] && this.blockchains[gameId])
                {
                    var newVillageState = smartContract.execute(this.villages[gameId], account, config, actionData);
                    this.villages[gameId] = newVillageState;
                    
                    var newTransaction = new Transaction(account.publicKey, newVillageState.getInfo());

                    await newTransaction.signTransaction(account.publicKey, account.privateKey);
                    this.addTransaction(gameId,newTransaction)
                    
                    return newVillageState;
                }else
                {
                    this.logError(`La partida con id ${gameId} no existe\n\t${JSON.stringify(this.villages)}`)
                    throw new Error(`La partida con id ${gameId} no existe`);
                }
            }else
            {
                throw new Error(`El smartContract ${smartContractName} no existe`);
            }
        }catch(e)
        {                    
            this.logError(`${e.message}`)
            return new Error("Ha ocurrido un error ejecutando el SmartContract");
        }
    }
    /**
     * Registra el fin de turno para un jugador
     * 
     * @param  {number | string} gameId - Identificador de la partida
     * @param  {number | string} userId - Identificador del jugador
     */
    playerEndTurn(gameId,userId){
        if(this.villages[gameId]){
            this.villages[gameId].playerEndTurn(userId);
            if(this.villages[gameId].isTurnEnded()){
                var newTurn = this.gameEndTurn(gameId);
                return {allPlayersReady : true, newTurnData : newTurn};
            }else return { allPlayersReady : false, newTurnData : null};   
        }else{
            this.logError(`Partida con ID ${gameId} no localizada al intentar pasar turno`)
        }
    }
    /**
    * Registra el fin de turno para toda la partida
    * 
     * @param  {number | string} gameId - Identificador de la partida
     */
    gameEndTurn(gameId){
        this.villages[gameId].endTurn();

        const hallAccount = this.villages[gameId].townHall.account
        var newTransaction = new Transaction(hallAccount.publicKey, this.villages[gameId].getInfo());

        newTransaction.signTransaction(hallAccount.publicKey, hallAccount.privateKey);
        this.addTransaction(gameId,newTransaction)

        return this.villages[gameId]; 
    }
    /**
     * Añade una transacción a una blockchain
     * @param  {number | string} gameId - Identificador de la partida
     * @param  {Transaction} newTransaction - transacción a añadir
     */
    async addTransaction(gameId,newTransaction){

        this.blockchains[gameId].addTransaction(newTransaction);        

        if(this.blockchains[gameId].getTransactionPoolSize() === this.config.max_transactions )
        {
            var newBlock = await this.blockchains[gameId].mineBlock();
            this.nodeService.propagateNewBlock(newBlock);
            this.onBlockMined(gameId,newBlock);
        
        }
    }
    /**
     * Metodo que procesa un bloque recibido desde otro nodo 
     * 
     * @param  {string | number} identifier - identificador de la cadena
     * @param  {Block} block - bloque recibido 
     */
    processedRecievedBlock (identifier,block){
        var newBlock = new Block("","","");
        newBlock.parseBlock(block);

        if(!this.blockchains[identifier]){
            this.blockchains[identifier] = new Blockchain(identifier, [newBlock]);
        }
        else if(this.blockchains[identifier].getLastBlock().getHash() === newBlock.getPreviousBlockHash() && newBlock.isValid()){
            this.blockchains[identifier].addNewBlock(newBlock);
            this.onBlockMined(identifier,newBlock);
        }
    }

    processedReceivedTransaction(identifier,transactionData){
        var newTransaction = new Transaction(transactionData.sender,transactionData.data);
        newTransaction.parseTransaction(transactionData);
        if(newTransaction.isValid()){
            if(this.blockchains[identifier] && this.villages[identifier])
                this.blockchains[identifier].addTransaction(newTransaction);
            else{

                //TODO inicializar partida si no existe
                
            }
        }else{
            this.log("ERROR nueva transaccion no valida")
        }
    }
    /**
     * Metodo que procesa una blockchain recibida desde otro nodo 
     * @param  {Blockchain} otherBlockchain
     */
    parseBlockchain(otherBlockchain){
        console.log(otherBlockchain.identifier)
        if(!this.blockchains[otherBlockchain.identifier]){
            var blockchain = new Blockchain(otherBlockchain.identifier,otherBlockchain.chain);
            blockchain.transactionsPool = otherBlockchain.transactionsPool;

            blockchain.addObserver(
                (chainIdentifier,transaction)=> {this.onTransaction(chainIdentifier,transaction)}, 
                (chainIdentifier,block)=> {this.onBlockMined(chainIdentifier,block)}
            );
        
            this.blockchains[otherBlockchain.identifier] = blockchain;

        }else if(otherBlockchain.getLength() > this.blockchains[otherBlockchain.identifier].getLength()){
            var newBlockchain = new Blockchain(otherBlockchain.identifier);
            newBlockchain.parseChain(otherBlockchain.chain)
            this.blockchains[otherBlockchain.identifier] = newBlockchain;
        }
    }
    /**
     * Metodo que procesa la lista de blockchains recibida desde otro nodo
     * 
     * @param  {Object} blockchainsData
     */
    parseAllBlockchains(blockchainsData){
        for(let key in blockchainsData) {
            this.parseBlockchain(blockchainsData[key]);
        }
    }

    updateFromTransaction(transaction){
        var data = transaction.getInfo().data;
        this.villages[data.identifier].loadDataFromTransaction(data);
    }

    getBlockchains() {
        return this.blockchains;
    }
    
    log(msg){ 
        if(process.env.NODE_ENV != 'test')
            console.log("\x1b[35m%s\x1b[0m", "[FarmChainService] "+msg);
    }
    logError(msg){console.error("\x1b[35m%s\x1b[0m\x1b[31m\x1b[1m[ERROR] %s\x1b[0m","[FarmChainService] ",msg);}
}

module.exports = FarmChainService