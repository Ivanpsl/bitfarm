const Village = require("./model/game/village");
const Blockchain = require("./model/blockchain");
const Transaction = require("./model/transaction");
const NodeP2PService = require('./p2p/nodeP2PService');
const cryptoUtils = require("./utils/cryptoUtils");
const config = require('config');
const Block = require("./model/block");

class FarmChainService {
    constructor(){
        this.blockchains = {};
        this.villages = {};
        this.smartContracts = {}
        this.nodeService = new NodeP2PService(this);
        this.initSmartContracts();


        setTimeout(async ()  =>{
            const account = cryptoUtils.generateKeyPair();
            var newVillage = new Village("ASdasd",{name:"name",account:account},config.get("Game"));
            var blockchain = new Blockchain("ASdasd");
            var newTransaction = new Transaction(account.publicKey, newVillage.getInfo());
            newTransaction.signTransaction(account.publicKey, account.privateKey);
            
            this.villages["ASdasd"] = newVillage;
            this.blockchains["ASdasd"]= blockchain;
            // this.nodeService.propagateTransaction("ASdasd",newTransaction)

            this.blockchains["ASdasd"].addTransaction(newTransaction);
            const newBlock = await this.blockchains["ASdasd"].mineBlock();
            this.nodeService.propagateNewBlock("ASdasd",newBlock);

        }, 5000);
    }
    initSmartContracts(){

    }
    getGameState(gameId){
        return this.villages[gameId];
    }   

    startGame(gameId, players){
        for(let player in players){
            const account = cryptoUtils.generateKeyPair();
            playerAccounts[account.publicKey] = {name : player.name, account : account};
        }
        var newVillage = new Village(vameId,playersInfo,config.get("Game"));

        this.villages[gameId] = newVillage;
        var blockchain = new Blockchain(data);
        this.blockchains[gameId] = blockchain;
    }

    async executeSmartContract(gameId, smartContractName, actionData, account){
        const smartContract = this.smartContracts[smartContractName];
        if (smartContract){
            if(this.villages[gameId] && this.blockchains[gameId]){
            
                var newVillageState = smartContract.execute(this.villages[gameId],this.blockchains[gameId],actionData,account);
                if(newVillageState){
                    this.villages[gameId] = newVillageState;

                    var newTransaction = new Transaction(account.publicKey, newVillageState.getInfo());
                    newTransaction.signTransaction(account.publicKey, account.privateKey);

                    this.blockchains[gameId].addTransaction(newTransaction);
                    //this.nodeService.propagateTransaction(gameId,newTransaction)

                    if(this.blockchains[gameId].getTransactionPoolSize() === config.get("Blockchain.max_transactions") ){
                        const newBlock = await this.blockchains[gameId].mineBlock();
                        this.nodeService.propagateNewBlock(newBlock);
                    }
                }
            }else{
                throw new Error(`La partida con id ${gameId} no existe`);
            }
        }else{
            throw new Error(`El smartContract ${smartContractName} no existe`);
        }
    }
    

    processedRecievedBlock (identifier,block){
        var newBlock = new Block("","","");
        newBlock.parseBlock(block);
        if(this.blockchains[indentifier].getLastBlock().getHash() === newBlock.getPreviousBlockHash() && newBlock.isValid()){
            this.blockchains[identifier].addNewBlock(newBlock);
        }
    }

    addNewTransaction(identifier,transactionData){
        var newTransaction = new Transaction(transactionData.sender,transactionData.data);
        newTransaction.parseTransaction(transactionData);
        if(newTransaction.isValid()){
            if(this.blockchains[identifier] && this.villages[identifier])
                this.blockchains[identifier].addTransaction(newTransaction);
            else{

                newVillage = new Village(identifier,null,config.get("Game"))
                var blockchain = new Blockchain("ASdasd");
                
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
        console.log("[FarmChainService] "+msg);
    }

}

module.exports = FarmChainService