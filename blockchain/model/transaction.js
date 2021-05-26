const cryptoUtils = require('../utils/cryptoUtils')

class Transaction{
    constructor(sender, data){
        this.sender = sender;
        // this.receiver = receiver; // receptor no es necesario ?
        this.data = data;
        this.timestamp = new Date();
        this.signature = null;
    }

    calculateHash() {
        return SHA256(this.sender + this.data + this.timestamp).toString();
    }

    signTransaction(publicKey, privateKey) {
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
        return { sender,receiver, data,timestamp };
    }
    parseTransaction(transaction){
        this.sender = transaction.sender;
        this.receiver = transaction.receiver;
        this.data = transaction.amount;
        this.timestamp = transaction.timestamp;
    }
}

module.exports = Transaction;