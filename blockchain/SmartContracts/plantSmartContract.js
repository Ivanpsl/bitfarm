const {GAME_CONSTANTS} = require("../../common/constants");
const ISmartContract = require("./iSmartContract")
class PlantSmartContract extends ISmartContract{
/**
 * @constructor
 */
    constructor(){
        super();
        this.action = this.plantProduct;
    }

    plantProduct(village, account, config, actionData){
        if(actionData.productIndex && actionData.terrainIndex)
        {
            if(village.products[actionData.productIndex].owner === account.publicKey &&
                village.terrains[actionData.terrainIndex].owner === account.publicKey)
            { 
                    village.terrains[actionData.terrainIndex].status = GAME_CONSTANTS.TERRAIN_STATUS_PLANTED;
                    village.terrains[actionData.terrainIndex].contentIndex = actionData.productIndex
                    village.products[actionData.productIndex].status = GAME_CONSTANTS.PRODUCT_STATUS_PLANTED;
                    village.products[actionData.productIndex].terrainIndex = actionData.terrainIndex;
                    return village;
            }else{
                throw new Error(`El usuario no es propietario del producto o del terreno.`);
            }
        }else{
            throw new Error(`Datos incorrectos`);
        }
    }
}

module.exports = PlantSmartContract;