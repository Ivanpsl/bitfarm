const {ACTIONS} = require("../../common/constants");

const PlantSmartContract = require("./plantSmartContract")
const BuyElementSmartContract = require("./buyElementSmartContract");
const StartGameSmartContract = require("./StartGameSmartContract");
const BuildSmartContract = require("./buildSmartContract.js");
const DemolishSmartContract = require("./demolishSmartContract");
const WatetingSmartContract = require("./watetingSmartContract");

module.exports = {

    createSmartContracts : function() {
        var smartContracts = {};
        smartContracts[ACTIONS.ACTION_START_GAME] = new StartGameSmartContract();
        smartContracts[ACTIONS.ACTION_TERRAIN_PLANT] =  new PlantSmartContract();
        smartContracts[ACTIONS.ACTION_ELEMENT_BUY] = new BuyElementSmartContract();
        smartContracts[ACTIONS.ACTION_TERRAIN_BUILD] = new BuildSmartContract();
        smartContracts[ACTIONS.ACTION_PLANT_WATERING] = new WatetingSmartContract();
        smartContracts[ACTIONS.ACTION_BUILD_DEMOLISH] = new DemolishSmartContract();
        // smartContracts[ACTIONS.ACTION_PLANT_RECOLLECT] = new RecollectSmartContract();

        // smartContracts[ACTIONS.ACTION_BUILD_UPGRADE] = new UpgradeSmartContract();
        
        return smartContracts;
    }
}