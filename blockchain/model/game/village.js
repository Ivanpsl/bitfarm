const {GAME_CONSTANTS} = require("../../../common/constants");
const Hall = require('./hall');
class Village {

    constructor(identifier, hallAccount, playersInfo, config)
    {
        this.identifier = identifier;
        this.gameConfig = config;

        this.status = "PLAYING";
        this.turn = 0;
        this.actualEvent = null;

        this.townHall = new Hall(config.max_money, hallAccount);
        this.players = null;
        this.terrains = [];
        this.items = [];
        this.products = [];
        
        this.init(playersInfo)

    }

    init(playersInfo){
        
        this.players = playersInfo
        ///TODO
    }

    endTurn(){
        // TODO: añadir evento aleatorio al nuevo turno y su efecto -> this.selectRandomEvent();
        this.turn +=1
        this.applyEfectsToTerrains();
    }

    applyEfectsToAllTerrains(){
        terrains.forEach(terrain => {
            if(terrain.status === GAME_CONSTANTS.TERRAIN_STATUS_EMPTY){
                terrain.addSoilUse(this.products[terrain.contentIndex]);
                if(terrain.getSoilUse(this.products[terrain.contentIndex].productType) > 50){
                    this.products[terrain.contentIndex].setStatus(GAME_CONSTANTS.PRODUCT_STATUS_ROTTEN);
                }else
                {   
                    this.products[terrain.contentIndex].water -= this.gameConfig.products.get(this.products[terrain.contentIndex].name).watter_consume_per_week;
                }
            }
        });
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
            hall : this.townHall,
            terrains : this.terrains,
            items : this.items,
            products : this.products,
        });
    }

}

module.exports = Village;