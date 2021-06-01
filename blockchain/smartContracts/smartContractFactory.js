const {BLOCKCHAIN_CONSTANTS} = require("../../common/constants");

const PlantSmartContract = require("./plantSmartContract")
const BuyProductSmartContract = require("./buyProductSmartContract");
const BuyTerrainSmartContract = require("./buyTerrainSmartContract");

module.exports= {
    createSmartContracts : function() {
        var smartContracts = {};
        smartContracts[BLOCKCHAIN_CONSTANTS.SMARTCONTRACT_PLANT] =  new PlantSmartContract();
        smartContracts[BLOCKCHAIN_CONSTANTS.SMARTCONTRACT_BUY_PRODUCT] =  new BuyProductSmartContract();
        smartContracts[BLOCKCHAIN_CONSTANTS.SMARTCONTRACT_BUY_TERRAIN] =  new BuyTerrainSmartContract();
        
        return smartContracts;
    }
}