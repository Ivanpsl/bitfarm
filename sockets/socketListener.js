const Transaction = require('../models/blockchain/Transaction');
const Blockchain = require('../models/blockchain/Blockchain');
const { ADD_TRANSACTION } = require('../constants');

const socketListeners = (socket, bChain)=> {

    socket.on(SocketActions.ADD_TRANSACTION, (sender,receiver,amount) => {
        const transaction = new Transaction(sender,receiver,amount);
        bChain.newTransaction(transaction);
        console.info("[SL] Añadida una nueva transaccion");
    });
    return socket;
}

module.exports = socketListeners;