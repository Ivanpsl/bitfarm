class Hall{
    constructor(startMoney){
        this.account = {publicKey: 0, privateKey: 0};
        this.money = startMoney;
    }
}
module.exports = Hall;