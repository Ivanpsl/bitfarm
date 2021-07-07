const {GAME_CONSTANTS} = require("../../common/constants");

const PlantSmartContract = require("./plantSmartContract")
const BuyElementSmartContract = require("./buyElementSmartContract");
const StartGameSmartContract = require("./startGameSmartContract");
const BuildSmartContract = require("./buildSmartContract.js");
const DemolishSmartContract = require("./demolishSmartContract");
const WatetingSmartContract = require("./watetingSmartContract");

module.exports = {

    createSmartContracts : function() {
        var smartContracts = {};

        smartContracts[GAME_CONSTANTS.ACTION_START_GAME] = new StartGameSmartContract();
        smartContracts[GAME_CONSTANTS.ACTION_TERRAIN_PLANT] =  new PlantSmartContract();
        smartContracts[GAME_CONSTANTS.ACTION_ELEMENT_BUY] = new BuyElementSmartContract();
        smartContracts[GAME_CONSTANTS.ACTION_TERRAIN_BUILD] = new BuildSmartContract();
        smartContracts[GAME_CONSTANTS.ACTION_PLANT_WATERING] = new WatetingSmartContract();
        smartContracts[GAME_CONSTANTS.ACTION_BUILD_DEMOLISH] = new DemolishSmartContract();
        
        return smartContracts;
    }

}