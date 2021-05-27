const GAME_CONSTANTS = require("../../utils/gameConstants");
const Hall = require('./hall');
class Village {

    constructor(identifier,playersInfo,config)
    {
        this.identifier = identifier;
        this.status = "PLAYING";
        this.turn = 0;
        this.actualEvent = null;

        this.townHall = new Hall();
        this.players = {};
        this.terrains = [];
        this.items = [];
        this.products = [];
    }

    endWeek(){
        //this.selectRandomEvent();
        this.turn +=1
        this.applyEfectsToTerrains();
        this.applyEffectsToProducts();
    }

    applyEfectsToAllTerrains(){
        terrains.forEach(terrain => {
            if(terrain.status === GAME_CONSTANTS.TERRAIN_STATUS_EMPTY){
                terrain.addSoilUse(this.products[terrain.contentIndex]);
                if(terrain.getSoilUse(this.products[terrain.contentIndex].productType) > 50){
                    this.products[terrain.contentIndex].setStatus(GAME_CONSTANTS.PRODUCT_STATUS_ROTTEN);
                }else
                {   
                    addEffectoToProducts(this.products[terrain.contentIndex]);
                }
            }
        });
    }

    addEffectoToProducts(product){
        /////
    }

    loadDataFromTransaction(transactionData){
        this.identifier = transactionData.identifier;
        this.players = transactionData.players;
        this.status  = transactionData.status;
        this.turn = transactionData.turn;
        this.hall = transactionData.hall;
        this.terrains = transactionData.terrains;
        this.items = transactionData.items;
        this.products = transactionData.products; 
    }

    getInfo(){
        return JSON.stringify({
            identifier: this.identifier,
            players : this.players,
            status : this.status,
            turn : this.turn,
            hall : this.hall,
            terrains : this.terrains,
            items : this.items,
            products : this.products,
        });
    }

}

module.exports = Village;