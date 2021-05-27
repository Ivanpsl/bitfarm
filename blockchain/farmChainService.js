const smFactory = require("./smartContracts/smartContractFactory")
const NodeP2PService = require('./p2p/nodeP2PService');
const cryptoUtils = require("./utils/cryptoUtils");
const config = require('config');
const Village = require("./model/game/village");
const Blockchain = require("./model/blockchain");
const Transaction = require("./model/transaction");
const Block = require("./model/block");


class FarmChainService {
    constructor(){
        this.blockchains = {};
        this.villages = {};
        this.smartContracts = smFactory.createSmartContracts();
        this.nodeService = new NodeP2PService(this);
        this.config = config.get("Blockchain");

        this.test();
    }

    test(){
        setTimeout(async ()  =>{
            const account = cryptoUtils.generateKeyPair();
            var testIdentifier = "TestGame"
            var hallAccount = cryptoUtils.generateKeyPair();

            var newVillage = new Village(testIdentifier,hallAccount, {name:"testName",account:account}, config.get("Game"));
            var blockchain = new Blockchain(testIdentifier);
            var newTransaction = new Transaction(account.publicKey, newVillage.getInfo());
            newTransaction.signTransaction(account.publicKey, account.privateKey);
            
            this.villages[testIdentifier] = newVillage;
            this.blockchains[testIdentifier]= blockchain;
            // this.nodeService.propagateTransaction("ASdasd",newTransaction)

            this.blockchains[testIdentifier].addTransaction(newTransaction);
            const newBlock = await this.blockchains[testIdentifier].mineBlock();
            this.nodeService.propagateNewBlock(testIdentifier,newBlock);

        }, 5000);
    }


    getGameState(gameId){
        return this.villages[gameId];
    }   

    createGame(gameId, players){
        this.log("Creando partida para "+gameId)
        var playersData = {}
        var hallAccount = cryptoUtils.generateKeyPair();
        players.forEach((player) => {
            this.log("Añadiendo jugador " + player.name)
            const account = cryptoUtils.generateKeyPair();
            playersData[account.publicKey] = {name : player.name, account : account};
        })
    

        var newVillage = new Village(gameId,hallAccount,playersData,config.get("Game"));
        var blockchain = new Blockchain(gameId);
        
        this.blockchains[gameId] = blockchain;

        var newTransaction = new Transaction(hallAccount.publicKey, newVillage.getInfo());
        newTransaction.signTransaction(hallAccount.publicKey, hallAccount.privateKey);
        this.villages[gameId] = newVillage;
        this.addTransaction(gameId,newTransaction)

        this.log("Partida creada: " + JSON.stringify(this.villages[gameId]))
        return this.villages[gameId];
    }

    async executeSmartContract(gameId, smartContractName, actionData, account)
    {
        try{
            const smartContract = this.smartContracts[smartContractName];
            if (smartContract)
            {
                if(this.villages[gameId] && this.blockchains[gameId])
                {
                    var newVillageState = smartContract.execute(this.villages[gameId],this.blockchains[gameId],actionData,account);
                    this.villages[gameId] = newVillageState;

                    var newTransaction = new Transaction(account.publicKey, newVillageState.getInfo());
                    newTransaction.signTransaction(account.publicKey, account.privateKey);
                    this.addTransaction(gameId,newTransaction)
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
        if(this.blockchains[gameId].getTransactionPoolSize() === this.config.max_transactions )
        {
            const newBlock = await this.blockchains[gameId].mineBlock();
            this.nodeService.propagateNewBlock(newBlock);
        }
    }

    processedRecievedBlock (identifier,block){
        var newBlock = new Block("","","");
        newBlock.parseBlock(block);
        if(this.blockchains[identifier].getLastBlock().getHash() === newBlock.getPreviousBlockHash() && newBlock.isValid()){
            this.blockchains[identifier].addNewBlock(newBlock);
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
    
    log(msg){
        console.log("\x1b[35m%s\x1b[0m", "[FarmChainService] "+msg);
    }
    logError(msg){console.error("\x1b[35m%s\x1b[0m\x1b[31m\x1b[1m[ERROR] %s\x1b[0m","[FarmChainService] ",msg);}
}

module.exports = FarmChainService