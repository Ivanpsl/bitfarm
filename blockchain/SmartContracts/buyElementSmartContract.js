const {GAME_CONSTANTS} =require("../../common/constants");
const ISmartContract = require("./iSmartContract")

class BuyElementSmartContract extends ISmartContract {
    constructor(){
        super();
        this.action = this.buyElement;
    }

    buyElement(village, account, config, actionData){
        if(actionData.elementType && actionData.elementIndex && actionData.targetPublicKey && actionData.price){
            
            if(village.players[account.publicKey].money > parseInt(actionData.price)){
                if(actionData.elementType === GAME_CONSTANTS.TYPE_PRODUCT){
                    return this.buyProduct(village, account, config, actionData);
                }else if(actionData.elementType === GAME_CONSTANTS.TYPE_TERRAIN){
                    return this.buyTerrain(village, account, config, actionData);
                }else if(actionData.elementType === GAME_CONSTANTS.TYPE_TOOL){
                    return this.buyTool(village, account, config, actionData);
                }
            }else{
                throw new Error(`Comprador no tiene dinero suficiente`);
            }
        }else{
            throw new Error(`No se han completado todos los datos para realizar la transacción`);
        }
    }

    buyProduct(village, account, config, actionData){
        console.log(`${actionData.elementIndex} \n` + JSON.stringify(village.products[actionData.elementIndex]))
        if(village.products[actionData.elementIndex]){
            if(village.products[actionData.elementIndex].status != GAME_CONSTANTS.TERRAIN_STATUS_PLANTED){

                if(!this.isOwner(village.products[actionData.elementIndex], actionData.targetPublicKey)) 
                    throw new Error("El receptor no es propietario del producto");
                


                if(village.players[actionData.targetPublicKey]) 
                    village.players[actionData.targetPublicKey].money += parseInt(actionData.price);
                else if(village.townHall.account.publicKey == actionData.targetPublicKey) 
                    village.townHall.money += parseInt(actionData.price);
                else 
                {
                    console.log(village.products[actionData.elementIndex].owner + "\n"+console.log(JSON.stringify(village.products[actionData.elementIndex])))

                    throw new Error("No se ha localizado receptor")
                }
                village.players[account.publicKey].money -= parseInt(actionData.price)
                village.products[actionData.elementIndex].owner = account.publicKey;

                return village;
            }else{
                throw new Error("No se puede vender un producto plantado")
            }
        }else{
            throw new Error("El producto que se intenta comprar no existe")
        }
    }

    buyTerrain(village, account, config, actionData){
        if(village.terrains[actionData.elementIndex]){
            if(!this.isOwner(village.terrains[actionData.elementIndex], actionData.targetPublicKey))
                throw new Error("El receptor no es propietario del terreno");
            

            if(village.players[actionData.targetPublicKey]) 
                village.players[actionData.targetPublicKey].money += parseInt(actionData.price);
            else if(village.townHall.account.publicKey == actionData.targetPublicKey) 
                village.townHall.money += parseInt(actionData.price)
            else 
                throw new Error("No se ha localizado receptor");
    
            if(village.terrains[actionData.elementIndex].planted == true){
                let index = village.terrains[actionData.elementIndex].contentIndex;
                village.products[index].owner = actionData.targetPublicKey;
            }else if(village.terrains[actionData.elementIndex].builded == true){
                let index = village.terrains[actionData.elementIndex].contentIndex;
                village.builds[index].owner = actionData.targetPublicKey;
            }

            village.players[account.publicKey].money -= parseInt(actionData.price);
            village.terrains[actionData.elementIndex].owner = account.publicKey;

            return village;
        }else{
            throw new Error("El producto que se intenta comprar no existe \n" + JSON.stringify(actionData))
        }
    }

    buyTool(village, account, config, actionData){
        if(village.tools[actionData.elementIndex]){
            if(!this.isOwner(village.tools[actionData.elementIndex], actionData.targetPublicKey)) 
                throw new Error("El receptor no es propietario de la herramienta");


            if(village.players[actionData.targetPublicKey]) {
                village.players[actionData.targetPublicKey].money += parseInt(actionData.price);

                village.players[actionData.targetPublicKey] = village.tools[actionData.elementIndex].removeModifier(village.players[actionData.targetPublicKey]);
            }
            else if(village.townHall.account.publicKey == actionData.targetPublicKey) 
                village.townHall.money += parseInt(actionData.price);
            else{
                throw new Error("No se ha localizado receptor")
            }

            village.players[account.publicKey].money -= parseInt(actionData.price);
            village.tools[actionData.elementIndex].owner = account.publicKey;

            village.players[account.publicKey] = village.tools[actionData.elementIndex].addModifier(village.players[account.publicKey]);

            return village;
        }else{
            throw new Error("El producto que se intenta comprar no existe")
        }
    }

    isOwner(item, publicKey){
        return item.owner === publicKey;
    }

}

module.exports = BuyElementSmartContract;