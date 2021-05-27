class ISmartContract {
    constructor(){
        this.action = null;
    }

    execute(village,blockchain, account){
        return this.action(village,blockchain,account);
    }
}

module.exports = ISmartContract;