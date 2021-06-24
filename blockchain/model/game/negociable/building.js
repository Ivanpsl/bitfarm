class Building {
    constructor(index, name,label, effect, terrainIndex, owner) {
        this.index = index;
        this.name = name;
        this.label  = label;
        this.effect = effect;
        this.owner = owner;
        this.terrainIndex = terrainIndex;
        this.type = "BUILDING";
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