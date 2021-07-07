const ISmartContract = require("./iSmartContract")

class StartGameSmartContract extends ISmartContract {
    constructor(){
        super();
        this.action = this.startGameActions;
    }

    // eslint-disable-next-line no-unused-vars
    startGameActions(village, account, config, _actionData){
        var gameConfig = config.get("Game");
        if(gameConfig)
        {
            var auxTerrainIndex = 0;
            for(let playerKey in village.players){
                if(village.townHall.money - gameConfig.init_money > 0){
                    village.townHall.money = village.townHall.money - gameConfig.init_money ;
                    village.players[playerKey].money = village.players[playerKey].money + gameConfig.init_money
                } else {
                    throw new Error("No hay suficiente dinero")
                }
                
                for(let i=0; i<gameConfig.init_player_terrains; i++){
                    while(village.terrains[auxTerrainIndex].owner != village.townHall.account.publicKey){
                        auxTerrainIndex++;
                    }
                    village.terrains[auxTerrainIndex].owner = playerKey;
                    auxTerrainIndex++;
                }

            }
            village.updateMarket();
            return village;
        }else {
            throw new Error("Config no localizada")
        }
    }

}

module.exports = StartGameSmartContract;