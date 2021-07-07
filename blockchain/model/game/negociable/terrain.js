const {GAME_CONSTANTS} =  require("../../../../common/constants");
const AbstractElement = require('./abstractElement');
class Terrain extends AbstractElement{
    constructor(index,owner)
    {
        super(index,`terrain`,`Terreno ${index}`,owner,GAME_CONSTANTS.TYPE_TERRAIN);

        this.status = GAME_CONSTANTS.TERRAIN_STATUS_EMPTY;
        this.contentIndex = null;
        this.soilExhaustion = {};
    }
    
    addSoilUse(productType,effect){
        
        this.soilExhaustion[productType] += effect;
        return this.soilExhaustion[productType];
    }
    getSoilUse(productType){
        return this.soilExhaustion[productType] ?? 0;
    }
}

module.exports = Terrain;