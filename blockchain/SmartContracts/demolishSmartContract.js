const {
    GAME_CONSTANTS} = require("../../common/constants");
const ISmartContract = require("./iSmartContract")

class DemolishSmartContract extends ISmartContract {
    constructor() {
        super()
        this.action = this.demolish;
    }

    demolish(village, account, config, actionData) {
        if (actionData.terrainIndex && account.publicKey) {
            if (village.terrains[actionData.terrainIndex].contentIndex!=null && village.terrains[actionData.terrainIndex].status === GAME_CONSTANTS.TERRAIN_STATUS_BUILDED) {
                var buildingIndex = village.terrains[actionData.terrainIndex].contentIndex
                if (this.isTerrainOwner(village, account.publicKey, actionData.terrainIndex) &&
                    this.isBuildingOwner(village, account.publicKey, buildingIndex)) {

                    village.buildings[buildingIndex].removeModifier(village.players[account.publicKey]);

                    delete  village.buildings[buildingIndex]
                    village.terrains[actionData.terrainIndex].state = GAME_CONSTANTS.TERRAIN_STATUS_EMPTY;
                    village.terrains[actionData.terrainIndex].contentIndex = null;

                    return village;
                } else {
                    throw new Error(`No es posible ejecutar DemolishSmartContract: el usuario no es el propietario del terreno`);
                }
            } else {
                throw new Error("No es posible ejecutar DemolishSmartContract: el terreno no tiene ninguna edificacion.");
            }
            
        }else{
            throw new Error("No es posible ejecutar DemolishSmartContract: faltan datos necesarios.");
        }
    }

    isTerrainOwner(village, account, terrainIndex) {
        return (village.terrains[terrainIndex].owner === account);
    }

    isBuildingOwner(village, account, buildingIndex) {
        return (village.buildings[buildingIndex].owner === account);
    }

    isTerrainEmpty(village, terrainIndex) {
        return (village.terrains[terrainIndex] && village.terrains[terrainIndex].state != GAME_CONSTANTS.TERRAIN_STATUS_EMPTY);
    }
}

module.exports = DemolishSmartContract;