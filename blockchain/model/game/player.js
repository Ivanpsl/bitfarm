class Player{
    constructor(id,playerName, account){
        this.id = id;
        this.name = playerName;
        this.account = account;
        this.money = 0;
        this.storage = 0;
        this.max_storage = 10;
        this.waterPerAction = 20;
        this.modifiers = {};
    }

    getWaterPerAction(){
        // TODO : obentener cantidad de agua en funcion de modificadores
        return this.waterPerAction;
    }
}

module.exports = Player;
