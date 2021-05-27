class ISmartContract {
    constructor(name){
        this.name= name;
        this.action = null;
    }
    setAction(action){
        this.action = action;
    }
    execute(village,blockchain, account){
        return this.action(village,blockchain,account);
    }
}

module.exports = ISmartContract;