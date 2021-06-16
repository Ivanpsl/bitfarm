const {GAME_CONSTANTS} =  require("../../../../common/constants");

class Product {
    constructor(index,name,label, maxHealth,owner){
        this.index = index;
        this.name = name;
        this.label = label;
        this.owner = owner;
        this.status = GAME_CONSTANTS.PRODUCT_STATUS_SEED;
        this.planted = false;
        this.builded = false;
        this.health = maxHealth;
        this.type = GAME_CONSTANTS.TYPE_PRODUCT;
    }
}


module.exports = Product;