const SHA256 = require('crypto-js/sha256');
const Transaction = require('./transaction');

class Block {
    constructor(index,transactions,previousHash,nonce=0){
        this.index = index;
        this.previousHash = previousHash;
        this.data = transactions;
        this.timestamp = + new Date();
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
        if(hash !== this.calculateHash()){
            return false;
        }
        data.forEach(transaction => {
            if(!transaction.isValid())
                return false;
        });
        
        return true
    }

    getInfo() {
        const { index, previousProof, previousHash, data, timestamp } = this;

        return { 
            index, previousProof, previousHash, transaction, timestamp,
            data : data.map(dt=> dt.getInfo()),
        };
    }

    parseBlock(block){
        this.index = block.index;
        this.previousHash = block.previousHash;
        this.timestamp = block.timestamp;

        this.data = block.data.map(transaction => {
            const pT = new Transaction();
            pT.parseTransaction(transaction);
            return pT
        });
    }

    printTransactions(){
        this.transactions.array.forEach(element => {
            console.log(element);
        });
    }
}

module.exports = Block;