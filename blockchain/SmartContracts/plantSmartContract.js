const {GAME_CONSTANTS} = require("../../common/constants");
const ISmartContract = require("./iSmartContract")
class PlantSmartContract extends ISmartContract{

    constructor(){
        super();
        this.action = this.plantProduct;
    }

    plantProduct(village, account, config, actionData){
        if(actionData.productIndex && actionData.terrainIndex)
        {
            if(village.products[actionData.productIndex].owner === account.publicKey &&
                village.terrains[actionData.terrainIndex] === account.publicKey)
            { 
                    village.terrains[actionData.terrainIndex].state = GAME_CONSTANTS.TERRAIN_STATUS_PLANTED;
                    village.products[actionData.productIndex].state = GAME_CONSTANTS.PRODUCT_STATUS_PLANTED;

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