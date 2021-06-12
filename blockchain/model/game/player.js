class Player{
    constructor(id,playerName, account){
        this.id = id;
        this.name = playerName;
        this.account = account;
        this.money = 0;
        this.storage = 0;
        this.max_storage = 10;
        this.modifiers = {};
    }
}

module.exports = Player;
