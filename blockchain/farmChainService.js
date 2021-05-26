
const Village = require("./model/game/town");
const Blockchain = require("./model/blockchain");
const Transaction = require("./model/transaction");
const NodeP2PService = require('./p2p/nodeP2PService');
const config = require('config');

class FarmChainService {
    constructor(){
        this.blockchains = {};
        this.villages = {};
        this.smartContracts = {}
        this.nodeService = new NodeP2PService(this);
    }
    getGameState(gameId){
        return this.villages[gameId];
    }   

    createGame(gameId, newVillage = null){
        var newVillage = new Village(null);
        this.villages[gameId] = newVillage;
        var blockchain = new Blockchain(data);
        this.blockchains[gameId] = blockchain;
    }

    async executeSmartContract(gameId, smartContractName, actionData, account){
        const smartContract = this.smartContracts[smartContractName];
        
        if (smartContract){
            if(this.villages[gameId] && this.blockchains[gameId]){
            
                var newVillageState = smartContract.execute(this.villages[gameId],actionData,account);
                this.villages[gameId] = newVillageState;

                var newTransaction = new Transaction(account.publicKey, newVillageState.getData());
                newTransaction.signTransaction(account.publicKey, account.privateKey);

                this.blockchains[gameId].addTransaction(newTransaction);
                this.nodeService.propagateTransaction(newTransaction)

                if(this.blockchains[gameId].getTransactionPoolSize() === config.get("Blockchain.max_transactions") ){
                    const newBlock = await this.blockchains[gameId].mineBlock();
                    this.nodeService.propagateNewBlock(newBlock);
                }
            }else{
                throw new Error(`La partida con id ${gameId} no existe`);
            }
        }else{
            throw new Error(`El smartContract ${smartContractName} no existe`);
        }
    }
    

    parseBlockchain(otherBlockchain){
        var newBlockchain = new Blockchain(otherBchain.id,otherBchain.blocks);
    }
    parseBlockchains(blockchainsData){
        blockchainsData.forEach( otherBchain=> {
            var newBlockchain = new Blockchain(otherBchain.id,otherBchain.blocks);
            this.blockchains.push(newBlockchain);
        });
    }

    getBlockchains(){
        return this.blockchains;
    }
    
    log(msg){
        console.log("[FarmChainService] "+msg);
    }

}

module.exports = FarmChainService