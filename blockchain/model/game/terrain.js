const { GAME_TERRAIN_STATUS_EMPTY , GAME_TERRAIN_STATUS_PLANTED , GAME_TERRAIN_STATUS_CONSTRUCTION } = require("../../utils/gameConstants")
class Terrain {

    constructor(index)
    {
        this.index = index;
        this.owner = 0;
        this.status = GAME_TERRAIN_STATUS_EMPTY;
        this.contentIndex = null,
    
        this.soilExhaustion = {}
    }
    
    addSoilUse(productType,effect){
        soilExhaustion[productType] =+ effect;
        return soilExhaustion[productType];
    }
}

module.exports = Terrain;