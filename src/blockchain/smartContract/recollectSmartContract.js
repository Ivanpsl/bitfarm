const {GAME_CONSTANTS} = require("../../common/constants");
const ISmartContract = require("./iSmartContract")
/** SmartContract que se ejecuta al recolectar */
class RecollectSmartContract extends ISmartContract{
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
                    if(village.terrains[actionData.terrainIndex].status == GAME_CONSTANTS.TERRAIN_STATUS_PLANTED 
                        && village.terrains[actionData.terrainIndex].contentIndex == actionData.productIndex
                        && village.products[actionData.productIndex].status == GAME_CONSTANTS.PRODUCT_STATUS_PLANTED
                        && village.products[actionData.productIndex].terrainIndex == actionData.terrainIndex ){

                        if(village.products[actionData.productIndex].growPrecent > 90)
                            village.products[actionData.productIndex].status = GAME_CONSTANTS.PRODUCT_STATUS_GROW;
                        else if(village.products[actionData.productIndex].growPrecent > 25)
                            village.products[actionData.productIndex].status = GAME_CONSTANTS.PRODUCT_STATUS_DRY;
                        else{
                            village.products[actionData.productIndex].status = GAME_CONSTANTS.PRODUCT_STATUS_PLANTED;
                        }

                        village.terrains[actionData.terrainIndex].status = GAME_CONSTANTS.TERRAIN_STATUS_EMPTY;

                        village.terrains[actionData.terrainIndex].contentIndex = null;
                        village.products[actionData.productIndex].terrainIndex = null;
                        
                    
                        return village;
                    }else{
                        throw new Error(`El producto que intenta desplantar no esta correctamente plantado.`);
                    }
            }else{
                throw new Error(`El usuario no es propietario del producto o del terreno.`);
            }
        }else{
            throw new Error(`Datos incorrectos`);
        }
    }
}

module.exports = RecollectSmartContract;