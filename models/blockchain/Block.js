const SHA256 = require('crypto-js/sha256');
const Transaction = require('./Transaction');

class Block {
    constructor(index,transactions, previousProof,previousHash=""){
        this.index = index;
        this.proof = previousProof;
        this.previousHash = previousHash;
        this.transactions = transactions;
        this.timestamp = Date.now();
    }

    hashValue() {
        return SHA256(this.index + this.precedingHash + this.timestamp + this.data + this.nonce).toString();
    }

    getIndex() { return this.index; }
    getPreviousBlockHash() { return this.previousHash; }

    setProof(proof){
        this.proof = proof;
    }
    getProof(){
        return this.proof;
    }

    getInfo() {
        const { index, previousProof, previousHash, transaction, timestamp } = this;

        return { 
            index, previousProof, previousHash, transaction, timestamp,
            transactions : transaction.map(transaction=> transaction.getInfo()),
        };
    }

    parseBlock(block){
        this.index = block.index;
        this.proof = block.previousProof;
        this.previousHash = block.previousHash;
        this.transactions = block.transactions;
        this.timestamp = block.timestamp;

        this.transactions = block.transactions.map(transaction => {
            const pT = new Transaction();
            pT.parseTransaction(transaction);
            return pT
        })
    }

    printTransactions(){
        this.transactions.array.forEach(element => {
            console.log(element);
        });
    }
}

module.exports = Block;