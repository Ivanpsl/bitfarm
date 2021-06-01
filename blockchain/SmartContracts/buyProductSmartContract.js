const {GAME_CONSTANTS} = require("../../common/constants");
const ISmartContract = require("./iSmartContract")

class BuyProductSmartContract extends ISmartContract{

    constructor(){
        super()
        this.action = this.buyProduct;
    }

    buyProduct(village, account, actionData){
        //TODO
    }

}

module.exports = BuyProductSmartContract;