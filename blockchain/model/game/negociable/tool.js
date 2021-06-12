const {GAME_CONSTANTS} = require("../../../../common/constants");

class Tool {
    constructor(index,name,label,effect, owner){
        this.index = index;
        this.name = name;
        this.label = label;
        this.effect = effect;
        this.owner = owner;
        this.type = GAME_CONSTANTS.TYPE_TOOL;
    }

    addModifier(player){
        return player.modifiers[this.effect.type][this.effect.target] =  player.modifiers[this.effect.type][this.effect.target] + this.effect.size;
    }
    removeModifier(player){
        return player.modifiers[this.effect.type][this.effect.target] =  player.modifiers[this.effect.type][this.effect.target] - this.effect.size;
    }
}


module.exports = Tool;