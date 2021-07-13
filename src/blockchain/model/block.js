const SHA256 = require('crypto-js/sha256');
const Transaction = require('./transaction');
/** Clase que representra un bloque de la blockchain */
class Block {
    constructor(index,transactions,previousHash,nonce=0){
        this.index = index;
        this.previousHash = previousHash;
        this.data = transactions;
        this.timestamp = + new Date()
        this.nonce = nonce;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + this.data + this.nonce).toString();
    }

    getIndex() { return this.index; }
    
    getHash(){ return this.hash; }

    getPreviousBlockHash() { return this.previousHash; }


    isValid() {
        if(this.hash !== this.calculateHash()){
            return false;
        }
        this.data.forEach(transaction => {
            if(!transaction.isValid())
                return false;
        });
        
        return true
    }

    getInfo() {
        const { index,  previousHash, data, timestamp } = this;

        return { 
            index, previousHash, timestamp,
            data : data.map(dt=> dt.getInfo()),
        };
    }

    parseBlock(block){
        this.index = block.index;
        this.previousHash = block.previousHash;
        this.timestamp = block.timestamp;
        console.log(block.data)
        if(block.data == "GENESIS") {
            this.data = block.data;
        }else{
            this.data = block.data.map(transaction => {
                const pT = new Transaction();
                pT.parseTransaction(transaction);
                return pT
            });
        }
    }

    printTransactions(){
        this.data.array.forEach(element => {
            console.log(element);
        });
    }
}

module.exports = Block;