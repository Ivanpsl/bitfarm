

class ISmartContract {
    constructor(name,action){
        this.name= name;
        this.action = action;
    }

    execute(village,blockchain, account){
        this.action(village,blockchain,account);
    }
}

module.exports = ISmartContract;