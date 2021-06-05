const GAME_CONSTANTS =  require("../../../common/constants");

class Product {
    constructor(index,name, maxHealth){
        this.index = index;
        this.name = name;
        this.owner = 0;
        this.state = GAME_CONSTANTS.PRODUCT_STATUS_SEED;
        this.health = maxHealth;
    }
}


module.exports = Product;