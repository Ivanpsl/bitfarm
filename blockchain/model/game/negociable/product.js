const {GAME_CONSTANTS} =  require("../../../../common/constants");

class Product {
    constructor(index,name,label, maxHealth,owner){
        this.index = index;
        this.name = name;
        this.label = label;
        this.owner = owner;
        this.status = GAME_CONSTANTS.PRODUCT_STATUS_SEED;
        this.growPrecent = 0;
        this.watter = 0;

        this.planted = false;
        this.terrainIndex = null;
        this.health = maxHealth;
        this.type = GAME_CONSTANTS.TYPE_PRODUCT;
    }
}


module.exports = Product;