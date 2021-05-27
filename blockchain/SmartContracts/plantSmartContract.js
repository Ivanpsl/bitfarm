const GAME_CONSTANTS = require("../../utils/gameConstants");

class PlantSmartContract extends ISmartContract{
    constructor(name){
        super(name);
        super.setAction(this.plantProduct);
    }

    plantProduct(village, account, actionData){
        if(actionData.productIndex && actionData.terrainIndex)
        {
            if(village.products[actionData.productIndex].owner === account.publicKey &&
                village.terrains[actionData.terrainIndex] === account.publicKey)
            { 
                    village.terrains[actionData.terrainIndex].state = GAME_CONSTANTS.TERRAIN_STATUS_PLANTED;
                    village.products[actionData.productIndex].state = GAME_CONSTANTS.PRODUCT_STATUS_PLANTED;

                    return village;
            }
        }
        return null;
    }

}

module.exports = PlantSmartContract;