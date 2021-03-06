const {GAME_CONSTANTS} = require("../../../common/constants");
const Hall = require("./hall");
const Terrain = require("./negociable/terrain");
const Tool = require("./negociable/tool");
const Product = require("./negociable/product");

/** Clase que contiene el estado actual de la partida */

class Village {

    constructor(identifier, hallAccount, playerList, config)
    {
        this.identifier = identifier;
        this.gameConfig = config;

        this.status = "PLAYING";
        this.turn = -1;

        this.townHall = new Hall(config.max_money, hallAccount);
        this.players = [];
        this.terrains = [];
        this.tools = [];
        this.products = [];
        this.buildings = [];

        this.market = [];
        this.actualEvent = null;

        this.playersWaiting = 0;
        this.playersLost = 0;

        this.initPlayers(playerList);
        this.initTerrains(config.game_max_terrains);
        this.initToolsList(config.toolsList);
        this.initProducts(config.products.productsList);
        this.updateMarket();
    }

    initPlayers(playerList){
        this.players = playerList;
        for (var key in this.players) {
            this.players[key].max_storage = this.gameConfig.init_player_storage;
        }
    }

    initTerrains(maxTerrains){
        const hallPublic = this.townHall.account.publicKey;
        for(let i = 0; i<maxTerrains; i++){
            this.terrains.push(new Terrain(i,hallPublic))
        }
    }

    initToolsList(toolsList){
        const hallPublic = this.townHall.account.publicKey;
        for(var key in toolsList){
            for(let i = 0; i<toolsList[key].amount; i++)
                this.tools.push(new Tool(i,key,toolsList[key].label,toolsList[key].effec, hallPublic));
        }
    }

    initProducts(productList){
        const hallPublic = this.townHall.account.publicKey;
        for(var key in productList){
            for(let i = 0; i<productList[key].amount; i++)
                this.products.push(new Product(i,key,productList[key].label,productList[key].max_health, hallPublic));
        }
    }

    playerEndTurn(playerId){
        this.getPlayerFromId(playerId).isWaiting = true;
        this.playersWaiting++;
    }

    isTurnEnded(){
        return this.playersWaiting === this.getNumberOfPlayers() - this.playersLost;
    }    
    
    endTurn(){
        // TODO: a??adir evento aleatorio al nuevo turno y su efecto -> this.selectRandomEvent();
        this.playersWaiting=0;
        this.turn +=1
        this.updateClimaticEvent();
        this.applyTaxesAndEfectsToAllTerrains();
        this.updateMarket();

        for (var key in this.players) {
            this.players[key].isWaiting = false;
            if(this.players[key].money <= 0){
                this.players[key].lost = true;
                this.playersLost++;
            }
        }

        return this;
    }

    updateMarket(){
        var productSelling = this.getProductsFromOwner(this.townHall.account.publicKey);
        var toolsSelling = this.getToolsFromOwner(this.townHall.account.publicKey);
        var terrainSelling = this.getTerrainsFromOwner(this.townHall.account.publicKey);
        
        this.market = [];
        var offertIndex = 0; 
        
        for(let i=0; i<3; i++){
            var typeIndex = Math.floor(Math.random() * 3)

            var element;
            var elementIndex;
            if(typeIndex == 0){
                elementIndex = Math.floor(Math.random() * productSelling.length);
                // console.log(`[${productSelling.length}] ${index}`  + " ----- " + JSON.stringify(productSelling[index]))
                element = productSelling[elementIndex];

            }else if(typeIndex == 1){
                elementIndex = Math.floor(Math.random() * toolsSelling.length);
                // console.log(`[${toolsSelling.length}] ${index}`  + " ----- " + JSON.stringify(toolsSelling[index]))
                element = toolsSelling[elementIndex];
            }else{
                elementIndex = Math.floor(Math.random() * terrainSelling.length);
                // console.log(`[${terrainSelling.length}] ${index}` + " ----- " + JSON.stringify(terrainSelling[index]))
                element = terrainSelling[elementIndex];
            }
            
            if(element){
                if(this.market.some((e) => e.type == element.type && e.index == element.index ))
                    i--
                else{
                    var price = this.calculateMarketCost(element);
                    this.market.push({ index: offertIndex, price: price, item : element});
                    offertIndex ++;
                }
            }else i--;
            
        }
    }

    calculateMarketCost(element){
        var max = 0;
        var min = 0;
        if(element.type === GAME_CONSTANTS.TYPE_PRODUCT){
            min =  this.gameConfig.products.productsList[element.name].min_market_cost;
            max =  this.gameConfig.products.productsList[element.name].max_market_cost;
        }else if(element.type === GAME_CONSTANTS.TYPE_TOOL){
            min =  this.gameConfig.tools[element.name].min_market_cost;
            max =  this.gameConfig.tools[element.name].max_market_cost;
        }else if(element.type === GAME_CONSTANTS.TYPE_TERRAIN){
            max = this.gameConfig.max_market_terrain_cost;
            min = this.gameConfig.min_market_terrain_cost;
        }
        return Math.floor(Math.random() * max+1) + min;
    }

    updateClimaticEvent(){
        const rnd = Math.random();

        var events = this.gameConfig.climaticEvents;

        var aux = 0;
        for(let key in events){
            var auxSum = aux + parseFloat(events[key].percent);
            if(rnd >= aux && rnd < auxSum) {
                this.actualEvent = events[key];
                return;
            }
            aux = auxSum;
        }
        
        this.actualEvent = null;
        
    }

    getPlayerFromId(playerId){
        for(var key in this.players){
            if(this.players[key].id === playerId) 
                return this.players[key];
        }
    }

    getToolsFromOwner(ownerKey){
        var toolsList = [];
        for(let tool of this.tools){
            if(tool.owner === ownerKey){
                toolsList.push(tool);
            }
        }
        return toolsList;
    }
    
    getTerrainsFromOwner(ownerKey){
        var terrainList = [];
        for(let terrain of this.terrains){
            if(terrain.owner === ownerKey){
                terrainList.push(terrain);
            }
        }
        return terrainList;
    }

    getProductsFromOwner(ownerKey){
        var productList = [];
        for(let product of this.products){
            if(product.owner === ownerKey){
                productList.push(product);
            }
        }
        return productList;
    }
    getNumberOfPlayers(){
        return Object.keys(this.players).length
    }
    getWaterConsume(productName){
        let productConfig = this.gameConfig.products.productsList.get(productName);
        if(this.actualEvent == null)
            return productConfig.water_consume_per_turn;
        else{
            return productConfig.water_consume_per_turn + (this.actualEvent.waterEffect*-1);
        }
    }
    applyTaxesAndEfectsToAllTerrains(){
        this.terrains.forEach(terrain => {

            if(terrain.owner != this.townHall.account.publicKey){
                this.players[terrain.owner].money -= this.gameConfig.terrain_tax;
            }

            if(terrain.status === GAME_CONSTANTS.TERRAIN_STATUS_PLANTED && this.products[terrain.contentIndex]){

                var productConfig = this.gameConfig.products.productsList.get(this.products[terrain.contentIndex].name);
                //desgaste del terreno
                terrain.addSoilUse(productConfig.productType,5);
                //desgaste del producto
                if(terrain.getSoilUse(this.products[terrain.contentIndex].productType) > 50){
                    this.products[terrain.contentIndex].health -= productConfig.exhaustion_health_loss;
                    
                    if(this.products[terrain.contentIndex].health <=0)
                        this.products[terrain.contentIndex].status = GAME_CONSTANTS.PRODUCT_STATUS_ROTTEN;
                }

                this.products[terrain.contentIndex].water -= this.getWaterConsume(this.products[terrain.contentIndex].name);
                
                if(this.products[terrain.contentIndex].water<0)
                    this.products[terrain.contentIndex].water = 0;

                var water = this.products[terrain.contentIndex].water
                if(water >= productConfig.min_water_to_grow){
                    this.products[terrain.contentIndex].growPrecent += productConfig.growth_per_week;
                }else if(water < productConfig.min_water_to_survive){
                    this.products[terrain.contentIndex].health -= productConfig.dehydration_health_loss;

                    if(this.products[terrain.contentIndex].health <=0)
                        this.products[terrain.contentIndex].status = GAME_CONSTANTS.PRODUCT_STATUS_DRY;
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
        this.toolsList = transactionData.toolsList;
        this.products = transactionData.products; 
    }

    getInfo(){
        return JSON.stringify({
            identifier: this.identifier,
            players : this.players,
            status : this.status,
            turn : this.turn,
            climaticEvent : this.actualEvent,
            hall : this.townHall,
            terrains : this.terrains,
            toolsList : this.toolsList,
            products : this.products,
            buildings: this.buildings
        });
    }

}

module.exports = Village;