const Block = require('./block');
const actions = require('../../constants');
const constants = require('../../constants');

module.exports = class Blockchain {

    constructor(id,blocks, io){
        this.id = id;
        this.blocks = blocks || [this.startGenesisBlock()];
        this.currentTransactions = [];
        this.nodes = [];
        this.io = io;

        this.io.to(id).emit('newText',"Generando blockchain(1)")
    }

    startGenesisBlock(){ return new Block(0,1,0,[]);}

    getLastBlock() { return this.blocks[this.blocks.length-1]; }

    getLength(){ return this.blocks.length; }

    
    addNode(node){ 
        this.nodes.push(node);
        this.io.to(id).emit('newText',"Nodo uniendose a la red")
    }

    mineBlock(block){
        this.blocks.push(block);
        this.chainLog('Bloque minado con exito');
        this.io.to(id).emit(constants.END_MINING,this.toArray());
    }

    async newTransaction(transaction){
 
        this.currentTransactions.push(transaction);
        if(this.currentTransactions.length===2){
            this.chainLog('Minando bloque');
            const previousBlock = this.lastBlock();
            process.env.BREAK = false;
            const block = new Block(previousBlock.getIndex()+1, previousBlock.hashValue(), previousBlock.getProof(),this.currentTransactions);
            const {proof,dontMine} = await generateProo(previousBlock.getProof());
            block.setProof(proof);
            this.currentTransactions = [];
            if(dontMine!==true){
                this.mineBlock(block);
            } 
        }
    }

    checkValidity(){
        const { blocks } = this;
        let previousBlock = blocks[0];

        for(let i = 1; i < blocks.length; i++){
            const currentBlock = blocks[i];
            if(currentBlock.getPreviousBlockHash() !== previousBlock.hashValue()){
                return false;
            }
            if(!isProofValid(previousBlock.getProof(),currentBlock.getProof())){
                return false;
            }
            previousBlock = currentBlock;
        }
        return true;
    }

    parseChain(blocks){
        this.blocks = blocks.map(block => {
            const b = new Block(0,0,0);
            b.parseBlock(block);
            return b;
        });
    }

    toArray(){
        return this.blocks.map(block=> block.getInfo());
    }

    printBlocks() {
        this.blocks.forEach(bl => {
            console.log(bl);
        });
    }
    chainLog(msg){
        console.log(`[CHAIN:${id}]: ${msg}`)
    }

};