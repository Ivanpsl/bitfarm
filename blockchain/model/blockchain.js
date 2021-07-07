const Block = require('./block');
module.exports = class Blockchain {

    constructor(identifier,blocks=null){
        this.identifier = identifier;
        this.chain = blocks || [this.startGenesisBlock()];
        this.transactionsPool = [];

        this.observers = [];

    }

    addObserver(onNewTransaction,onNewBlock){
        this.observers.push({onTransaction:onNewTransaction, onBlock:onNewBlock });
    }
    onTransaction(transaction){
        this.observers.forEach(observer => observer.onTransaction(this.identifier,transaction));
    }

    onBlockMined(block){
        this.observers.forEach(observer => observer.onBlock(this.identifier,block));
    }

    getChain(){ return this.chain; }

    getLastBlock() { return this.chain[this.chain.length-1]; }

    getLength(){ return this.chain.length; }

    toArray(){ return this.chain.map(block=> block.getInfo()); }

    getTransactionPoolSize(){ return this.transactionsPool.length; }

    startGenesisBlock(){  return new Block(0,"GENESIS",0,[]); }


    async mineBlock(){

        const previousBlock = this.getLastBlock();
                //TODO: Prueba de trabajo
        let newBlock = new Block(previousBlock.getIndex()+1, this.transactionsPool, previousBlock.getHash());
        this.transactionsPool = [];
        this.chain.push(newBlock);
        this.onBlockMined(newBlock);
        return newBlock;
    }

    addNewBlock(block){
        this.chain.push(block);
    }


    addTransaction(transaccion){
        if(transaccion.isValid()){
            this.transactionsPool.push(transaccion);
            this.chainLog("Añadiendo nueva transacción")
            this.onTransaction(transaccion);

            if(this.transactionsPool.length===5){
                this.chainLog("Minando nuevo bloque")
                this.mineBlock();
            }
      
            return true;
        }
        return false;
    }

    checkValidity(){
        const { chain } = this;
        let previousBlock = chain[0];

        for(let i = 1; i < chain.length; i++){
            const currentBlock = chain[i];
            if(!this.isValidBlock(currentBlock,previousBlock)){
                return false;
            }
            previousBlock = currentBlock;
        }
        return true;
    }

    isValidBlock(block, previousBlock){
        if(!block.isValid() || previousBlock.getIndex() + 1 !== block.getIndex() 
        || previousBlock.hashValue() !== block.getPreviousBlockHash()
        || !block.hash === block.calculateHash()){
            return false;
        }
		return true;
	}

    parseChain(blocks){
        this.chain = blocks.map(block => {
            const b = new Block(0,0,0,0);
            b.parseBlock(block);
            return b;
        });
    }

    printBlocks() {
        this.chain.forEach(bl => {
            console.log(bl);
        });
    }
    
    getInfo(){
        return {
            id : this.id,
            num_blocks : this.chain.length,
            num_pool: this.transactionsPool.length,
            last_block_info : this.getLastBlock().getInfo()
        }
    }
    
    chainLog(msg){
        console.log(`[CHAIN:${this.identifier}]: ${msg}`)
    }

};