class ISmartContract {
    /**
 * @constructor
 */
    constructor(){
        this.action = null;
    }

    execute(village, sourceAccount, config, actionData){
        // if(this.checkParams!=null){
            
            if(this.action!=null){
                // if(this.checkParams(actionData) === true)
                    return this.action(village, sourceAccount, config, actionData);
                // else throw new Error("No es posible ejecutar BuildSmartContract: faltan datos.");
            }
        }
    // }
}

module.exports = ISmartContract;