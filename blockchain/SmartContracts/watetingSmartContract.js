const {
    GAME_CONSTANTS
} = require("../../common/constants");
const ISmartContract = require("./iSmartContract")

class WateringSmartContract extends ISmartContract {

    constructor() {
        super()
        this.action = this.watering;
    }

    watering(village, account, config, actionData) {
        if (actionData.terrainIndex && account.publicKey) {
            if (this.isValidTerrein(village,actionData.terrainIndex)) {
                var productIndex = village.terrains[actionData.terrainIndex].contentIndex;
                if(this.isOwner(village,account.publicKey,productIndex,actionData.terrainIndex)){
                    if(village.products[productIndex].status == GAME_CONSTANTS.PRODUCT_STATUS_PLANTED){
                        village.products[productIndex].watter += village.players[account.publicKey].getWaterPerAction();
                        return village;
                    }else{
                        throw new Error("No es posible ejecutar WateringSmartContract: el producto no esta correctamente plantado.");
                    }
                }else {
                    throw new Error("No es posible ejecutar WateringSmartContract: el emisor no es el propietario.");
                }
            } else {
                throw new Error("No es posible ejecutar WateringSmartContract: el terreno no tiene ninguna planta.");
            }
        } else {
            throw new Error("No es posible ejecutar WateringSmartContract: faltan datos necesarios.");
        }
    }
    
    isValidTerrein(village,terrainIndex){
        return village.terrains[terrainIndex].contentIndex != null && village.terrains[terrainIndex].status === GAME_CONSTANTS.TERRAIN_STATUS_PLANTED
    }
    isOwner(village,publicKey, productIndex, terrainIndex){
        return village.terrains[terrainIndex].owner == publicKey && village.products[productIndex].owner == publicKey;
    }
}


module.exports = WateringSmartContract;