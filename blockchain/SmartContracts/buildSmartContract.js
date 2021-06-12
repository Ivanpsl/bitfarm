const {GAME_CONSTANTS} = require("../../common/constants");
const ISmartContract = require("./iSmartContract")

class BuildSmartContract extends ISmartContract{

    constructor(){
        super()
        this.action = this.build;
    }

    build(village, account, config, actionData){
        
    }

}

module.exports = BuildSmartContract;