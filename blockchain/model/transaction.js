const cryptoUtils = require('../utils/cryptoUtils')
const SHA256 = require('crypto-js/sha256');
class Transaction{
    constructor(sender, data){
        this.sender = sender;
        // this.receiver = receiver; // receptor no es necesario ?
        this.data = data;
        this.timestamp = + new Date();
        this.signature = null;
    }

    calculateHash() {
        return SHA256(this.sender + this.data + this.timestamp).toString();
    }

    async signTransaction(publicKey, privateKey) {
        if (publicKey === this.sender) {
            const hash = this.calculateHash();
            this.signature = cryptoUtils.singData(privateKey,hash);
        }else{
            console.error("Se esta intentando firmar una transaccion por una cuenta que no es la emisora");
        }
    }

    isValid() {
        if (!this.signature || this.signature.length === 0) {
            return false
        }
        return cryptoUtils.verifySignature(this.sender,this.calculateHash(),this.signature)
    }

    getInfo(){
        const { sender,receiver, data,timestamp } = this;
        return { 
            sender : sender,receiver : receiver, transactionData : data, timestamp: timestamp };
    }
    
    
    parseTransaction(transaction){
        this.sender = transaction.sender;
        this.data = transaction.data;
        this.timestamp = transaction.timestamp;
        this.signature = transaction.signature;
    }
}

module.exports = Transaction;