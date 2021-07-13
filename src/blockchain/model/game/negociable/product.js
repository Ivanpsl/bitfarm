const {GAME_CONSTANTS} =  require("../../../../common/constants");
const AbstractElement = require('./abstractElement');
/** Clase que hereda de AbstractElement y representa un producto  */
class Product extends AbstractElement  {
    constructor(index,name,label, maxHealth,owner){
        super(index,name,label,owner,GAME_CONSTANTS.TYPE_PRODUCT);
        this.status = GAME_CONSTANTS.PRODUCT_STATUS_SEED;
        this.growPrecent = 0;
        this.water = 0;

        this.terrainIndex = null;
        this.health = maxHealth;
    }
}


module.exports = Product;