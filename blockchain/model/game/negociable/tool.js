const {GAME_CONSTANTS} =  require("../../../../common/constants");
const AbstractElement = require('./abstractElement');

class Tool extends AbstractElement{
    constructor(index,name,label,effect, owner){
        super(index,name,label,owner,GAME_CONSTANTS.TYPE_TOOL);

        this.effect = effect;
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