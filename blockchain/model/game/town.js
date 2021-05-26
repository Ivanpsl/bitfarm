class Town {

    constructor(players)
    {
        this.status = "PLAYING";
        this.turn = 0;
        this.townHall = new TownHall();
        this.actualEvent = null;

        this.farms = {};
        this.terrains = [];
        this.items = [];
        this.products = [];
        this.farms = [];
    }


    getTownData(){
        return JSON.stringify(this);
    }

}

module.exports = Town;