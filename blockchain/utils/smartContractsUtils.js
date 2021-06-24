
const {GAME_CONSTANTS} =require("../../common/constants");

function isItemOwner(village, publicKey, itemType, itemIndex)
{
    if(itemType === GAME_CONSTANTS.TYPE_TERRAIN)
        return (village.terrains[itemIndex] && village.terrains[itemIndex].owner === publicKey);
    else if(itemType === GAME_CONSTANTS.TYPE_PRODUCT)
        return (village.products[itemIndex] && village.products[itemIndex].owner === publicKey);
    else if(itemType === GAME_CONSTANTS.TYPE_BUILDING === publicKey)
        return (village.buildings[itemIndex] && village.buildings[itemIndex].owner === publicKey);
    else if(itemType === GAME_CONSTANTS.TYPE_TOOL === publicKey)
        return (village.tools[itemIndex] && village.tools[itemIndex].owner === publicKey);
}



module.exports  = {
    isItemOwner,
}