const {ACTIONS} = require('./../common/constants')
const smFactory = require("./smartContracts/smartContractFactory")
const cryptoUtils = require("./utils/cryptoUtils");
const config = require('config');

const NodeP2PService = require('./p2p/nodeP2PService');
const Village = require("./model/game/village");
const Blockchain = require("./model/blockchain");
const Transaction = require("./model/transaction");
const Block = require("./model/block");
const Player = require("./model/game/player");

class FarmChainService {
    constructor(){
        this.blockchains = {};
        this.villages = {};
        this.smartContracts = smFactory.createSmartContracts();
        this.nodeService = new NodeP2PService(this);
        this.config = config.get("Blockchain");
        this.test();

        this.onNewTransactionListeners = [];
        this.onNewBlockListeners = [];
    }

    suscribe(onTransaction,onNewBlock){
        this.log("Añadiendo suscripción")
        if(typeof onTransaction === 'function' && typeof onNewBlock === 'function'){
            this.onNewTransactionListeners.push(onTransaction);
            this.onNewBlockListeners.push(onNewBlock);
        }else{
            this.logError("Intentando suscribirse con un tipo incorrecto");
        }
    }

    onTransaction(identifier,transaccion){
        this.onNewTransactionListeners.forEach(listener => listener(identifier,transaccion))
    }
    onBlockMined(identifier,block){
        this.onNewTransactionListeners.forEach(listener => listener(identifier,block))
    }

    test(){
        setTimeout(async ()  =>{
            try { 
                const account = cryptoUtils.generateKeyPair();
                var testIdentifier = "TestGame"
                var hallAccount = cryptoUtils.generateKeyPair();
                var playerData = [];
                playerData[account.publicKey] = new Player("-111", "testName", account);
                var newVillage = new Village(testIdentifier,hallAccount,playerData, config.get("Game"));
                
                var blockchain = new Blockchain(testIdentifier);
                var newTransaction = new Transaction(account.publicKey, newVillage.getInfo());
                newTransaction.signTransaction(account.publicKey, account.privateKey);
                
                this.villages[testIdentifier] = newVillage;
                this.blockchains[testIdentifier]= blockchain;

              
                this.executeSmartContract(testIdentifier, ACTIONS.ACTION_START_GAME, hallAccount, {});

                // this.blockchains[testIdentifier].addTransaction(newTransaction);
                // const newBlock = await this.blockchains[testIdentifier].mineBlock();
                // this.nodeService.propagateNewBlock(testIdentifier,newBlock);
            } catch(e){
                this.logError(e)
            }
        }, 5000);
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
        this.blockchains[gameId] = blockchain;
        this.villages[gameId] = newVillage;

        //ejecución del contrato de inicio 
        var contractData = {config : config.get("Game")};
        this.executeSmartContract(gameId, ACTIONS.ACTION_START_GAME, hallAccount, contractData);
        
        this.log("Partida creada: " + JSON.stringify(this.villages[gameId]));
        return this.villages[gameId];
    }

    async handleAction(gameId,actionName,account,actionData){
        console.log("Ejecutando contrato "+actionName+ "\n" + JSON.stringify(actionData))
        return await this.executeSmartContract(gameId, actionName, account, actionData)

    }

    async executeSmartContract(gameId, smartContractName, account, actionData)
    {
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
                    this.log(newVillageState)
                    this.addTransaction(gameId,newTransaction)
                    return newVillageState;
                }else
                {
                    throw new Error(`La partida con id ${gameId} no existe`);
                }
            }else
            {
                throw new Error(`El smartContract ${smartContractName} no existe`);
            }
        }catch(e)
        {
            console.log(e.message);
            return e;
        }
    }
    
    endTurn(gameId){
        this.villages[gameId].endTurn();
        const hallAccount = this.villages[gameId].townHall.account

        var newTransaction = new Transaction(hallAccount.publicKey, this.villages[gameId].getInfo());
        newTransaction.signTransaction(hallAccount.publicKey, hallAccount.privateKey);
        this.blockchains[gameId].addTransaction(newTransaction);
    }

    async addTransaction(gameId,newTransaction){

        this.blockchains[gameId].addTransaction(newTransaction);        
        this.onTransaction(gameId,newTransaction)

        if(this.blockchains[gameId].getTransactionPoolSize() === this.config.max_transactions )
        {
            const newBlock = await this.blockchains[gameId].mineBlock();
            this.nodeService.propagateNewBlock(newBlock);
            this.onBlockMined(gameId,newBlock);
        
        }
    }

    processedRecievedBlock (identifier,block){
        var newBlock = new Block("","","");
        newBlock.parseBlock(block);
        if(this.blockchains[identifier].getLastBlock().getHash() === newBlock.getPreviousBlockHash() && newBlock.isValid()){
            this.blockchains[identifier].addNewBlock(newBlock);
            this.onBlockMined(newBlock);
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
            parseBlockchain(otherBchain);
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