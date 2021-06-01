const {GAME_CONSTANTS} =require("../../common/constants");
const ISmartContract = require("./iSmartContract")

class BuyTerrainSmartContract extends ISmartContract {
    constructor(){
        super();
        this.action = this.buyTerrain;
    }

    buyTerrain(village, account, actionData){
        if(actionData.productIndex && actionData.terrainIndex)
        {
            if(village.products[actionData.productIndex].owner === account.publicKey &&
                village.terrains[actionData.terrainIndex].owner === account.publicKey)
            {
                village.terrains[actionData.terrainIndex].state = GAME_CONSTANTS.TERRAIN_STATUS_PLANTED;
                village.products[actionData.productIndex].state = GAME_CONSTANTS.PRODUCT_STATUS_PLANTED;
                return village;
            }else{
                throw new Error(`El usuario no es propietario del producto o del terreno.`);
            }
        }
        throw new Error(`Datos incorrectos`);
    }

}

module.exports = BuyTerrainSmartContract;