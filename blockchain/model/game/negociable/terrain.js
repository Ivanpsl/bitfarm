const {GAME_CONSTANTS} = require("../../../../common/constants");
class Terrain {
    constructor(index,owner)
    {
        this.index = index;
        this.owner = owner;
        this.label = "Terreno " + this.index;
        this.status = GAME_CONSTANTS.TERRAIN_STATUS_EMPTY;
        this.contentIndex = null;
        this.soilExhaustion = {};
        this.type = GAME_CONSTANTS.TYPE_TERRAIN;
    }
    
    addSoilUse(productType,effect){
        soilExhaustion[productType] += effect;
        return soilExhaustion[productType];
    }
}

module.exports = Terrain;