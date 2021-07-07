class ISmartContract {

    constructor(){
        this.action = null;
    }

    execute(village, sourceAccount, config, actionData){
            
            if(this.action!=null){
                    return this.action(village, sourceAccount, config, actionData);
            }
        }
    // }
}

module.exports = ISmartContract;