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

    startNode(){
        this.nodeService.init();
    }

    getFacade(){
        return this.facade;
    }

    suscribeLog(onTransaction,onNewBlock){
        this.log("Añadiendo suscripción")
        if(typeof onTransaction === 'function' && typeof onNewBlock === 'function'){
            this.onNewTransactionListeners.push(onTransaction);
            this.onNewBlockListeners.push(onNewBlock);
        }else{
            this.logError("Intentando suscribirse con un tipo incorrecto");
        }
    }

    onTransaction(identifier,transaccion){
        this.onNewTransactionListeners.forEach(listener => listener(identifier,transaccion));
    }
    onBlockMined(identifier,block){
        this.onNewBlockListeners.forEach(listener => listener(identifier,block));
    }


    getGameState(gameId){
        return this.villages[gameId];
    }   

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

        //ejecución del contrato de inicio 
        var contractData = {config : config.get("Game")};
        this.executeSmartContract(gameId, GAME_CONSTANTS.ACTION_START_GAME, hallAccount, contractData);
        
        this.log("Partida creada: " + JSON.stringify(this.villages[gameId]));
        return this.villages[gameId];
    }

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

    gameEndTurn(gameId){
        this.villages[gameId].endTurn();

        const hallAccount = this.villages[gameId].townHall.account
        var newTransaction = new Transaction(hallAccount.publicKey, this.villages[gameId].getInfo());

        newTransaction.signTransaction(hallAccount.publicKey, hallAccount.privateKey);
        this.addTransaction(gameId,newTransaction)

        return this.villages[gameId]; 
    }

    async addTransaction(gameId,newTransaction){

        this.blockchains[gameId].addTransaction(newTransaction);        

        if(this.blockchains[gameId].getTransactionPoolSize() === this.config.max_transactions )
        {
            var newBlock = await this.blockchains[gameId].mineBlock();
            this.nodeService.propagateNewBlock(newBlock);
            this.onBlockMined(gameId,newBlock);
        
        }
    }

    processedRecievedBlock (identifier,block){
        var newBlock = new Block("","","");
        newBlock.parseBlock(block);
        if(this.blockchains[identifier].getLastBlock().getHash() === newBlock.getPreviousBlockHash() && newBlock.isValid()){
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

    parseBlockchain(otherBlockchain){
        if(otherBlockchain.getLength() > this.blockchains[otherBlockchain.identifier].getLength()){
            var newBlockchain = new Blockchain(otherBlockchain.identifier);
            newBlockchain.parseChain(otherBlockchain.chain)
            this.blockchains[otherBlockchain.identifier] = newBlockchain;
        }
    }

    parseAllBlockchains(blockchainsData){
        blockchainsData.forEach(otherBchain=> {
            this.parseBlockchain(otherBchain);
        });
    }

    updateFromTransaction(transaction){
        var data = transaction.getInfo().data;
        this.villages[data.identifier].loadDataFromTransaction(data);
    }

    getBlockchains() {
        return this.blockchains;
    }
    
    log(msg){ console.log("\x1b[35m%s\x1b[0m", "[FarmChainService] "+msg);}
    logError(msg){console.error("\x1b[35m%s\x1b[0m\x1b[31m\x1b[1m[ERROR] %s\x1b[0m","[FarmChainService] ",msg);}
}

module.exports = FarmChainService