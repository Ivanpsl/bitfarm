const {
    GAME_CONSTANTS
} = require("../../common/constants");
const  Building = require("../model/game/negociable/building")
const ISmartContract = require("./iSmartContract")

/** SmartContract que se ejecuta al construir en un terreno  */
class BuildSmartContract extends ISmartContract {

    constructor() {
        super()
        this.action = this.build;
    }

    build(village, account, config, actionData) {
        if (actionData.terrainIndex && account.publicKey && actionData.buildingId) {
            if (config.get("Game").buildings.buildingsList[actionData.buildingId]) {
                var buildConfing = config.get("Game").buildings.buildingsList[actionData.buildingId]
                if (this.isTerrainEmpty(village, actionData.terrainIndex)) {
                    if (this.isOwner(village, account.publicKey, actionData.terrainIndex)) {

                        village.players[account.publicKey].money -= buildConfing.money_cost;

                        var building = this.buildFactory(village,actionData.buildingId,buildConfing,actionData.terrainIndex,account.publicKey)

                        village.buildings[building.index] = building;
                        village.terrains[actionData.terrainIndex].status = GAME_CONSTANTS.TERRAIN_STATUS_BUILDED;
                        village.terrains[actionData.terrainIndex].contentIndex = building.index;
                
                        return village;
                        
                    } else {
                        throw new Error(`No es posible ejecutar BuildSmartContract: el constructor no es el propietario.`);
                    }
                } else {
                    throw new Error(`No es posible ejecutar BuildSmartContract: terreno inexistente u ocupado.`);
                }
            } else {
                throw new Error(`No es posible ejecutar BuildSmartContract: no existe construcción con identificador ${actionData.buildingId}.`);
            }
        }else{
            throw new Error("No es posible ejecutar BuildSmartContract: faltan datos.");
        }
    }

    buildFactory(village, buildingIdent, buildConfig, terrainIndex, owner) {
        let buildIndex = village.buildings.length++;

        var building = new Building(buildIndex, buildingIdent, buildConfig.label, buildConfig.effect, terrainIndex, owner)
        building.addModifier(village.players[owner]);

        return building;
    }

    isOwner(village,account, terrainIndex) {
        return (village.terrains[terrainIndex].owner === account);
    }

    isTerrainEmpty(village, terrainIndex) {
        return (village.terrains[terrainIndex] && village.terrains[terrainIndex].state != GAME_CONSTANTS.TERRAIN_STATUS_EMPTY);
    }


}

module.exports = BuildSmartContract;