class Building {
    constructor(index, name,label, effect, owner) {
        this.index = index;
        this.name = name;
        this.label  = label;
        this.effect = effect;
        this.owner = owner;
        this.type = "BUILDING";
    }

    addModifier(player) {
        if (this.effect.target == "PLAYER") {
            if (this.effect.type === "EFFECT_STORAGE") {
                player.storage = player.storage + this.effect.size;
            }
        }
    }
    removeModifier(player) {
        if (this.effect.target == "PLAYER") {
            if (this.effect.type === "EFFECT_STORAGE") {
                player.storage = player.storage - this.effect.size;
            }
        }    
    }

}


module.exports = Building;