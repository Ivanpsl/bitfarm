const {GAME_CONSTANTS} =  require("../../../../common/constants");
const AbstractElement = require('./abstractElement');

/** Clase que hereda de AbstractElement y representa una construcción  */
class Building extends AbstractElement {
    constructor(index, name,label, effect, terrainIndex, owner) {
        super(index,name,label,owner,GAME_CONSTANTS.TYPE_BUILDING);
        this.effect = effect;
        this.terrainIndex = terrainIndex;
    }

    addModifier(player) {
        if (this.effect.target == "PLAYER") {
            if (this.effect.type === "EFFECT_STORAGE") {
                player.max_storage += this.effect.size;
            }
        }
    }
    removeModifier(player) {
        if (this.effect.target == "PLAYER") {
            if (this.effect.type === "EFFECT_STORAGE") {
                player.max_storage -= this.effect.size;
            }
        }    
    }

}


module.exports = Building;