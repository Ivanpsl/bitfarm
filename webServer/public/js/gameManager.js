const { NIL } = require("uuid");

game ={
    player : null,
    players : [],
    products : [],
    terrains : [],
    maxTimePerTurn : 0,

    
    turnInterval : null,
    turnIsRunning : true,
    secondsRemaining : 0,

    weekElement : null,
    timeRemainingElement : null,
    toolsElement : null,
    storageElement: null,
    moneyElement : null,
    blockchainLogContainer: null,
    modalContainerElement :null,

    startingGameOnClient: function(gameData) {
        this.loadGameInfo(gameData);
    },

    loadGameInfo(gameData){

        ///TO-DO Cargar info en listas
        renderGameWindow();
    },

    renderGameWindow: function(){
        var gameLoop = setInterval(drawingLoop, 10000);
        $("#gamecontainer").load("wigets/w-game.html",function() {
            weekElement = document.getElementById("name-title");
            timeRemainingElement = document.getElementById("time-remaining");
            timeBarElement = document.getElementById("progress");
            timeIconElement = document.getElementById("crono-icon");
            toolsElement = document.getElementById("tools-number");
            storageElement = document.getElementById("storage");
            moneyElement = document.getElementById("money");
            
            terrainsElement = document.getElementById("terrains-resume")
            blockchainLogContainer = document.getElementById("chain-log-container");
            modalContainerElement = document.getElementById("")
            console.log(JSON.stringify(gameData));
            setGameStatus()
        });
    },

    turnTick(){
        secondsRemaining =- 1;
        UpdateSecondsRemaining();
    },


    setGameStatus: function(gData){
        gameStatus = gData
        renderGameStatus(gData);
    },




    UpdateSecondsRemaining(){
        var timePercent = ((this.secondsRemaining * 100) / parseInt(this.maxTimePerTurn))
        
        timeRemainingElement.innerHTML = this.secondsRemaining;
        timeBarElement.style = `width:${timePercent}%`;

        if(this.secondsRemaining > 0 && this.turnIsRunning){
            this.turnIsRunning = true;
            timeIconElement.classList.remove("spin-icon");
        }else if(this.secondsRemaining <= 0){
            timeIconElement.classList.add("spin-icon");
            this.turnIsRunning = true;
            this.secondsRemaining = 0;
        }
    },


    renderGameStatus: function(gData){
        var players = gData.players;
        var nameTitle = document.getElementById("name-title");
        var publicKeyComponent = document.getElementById("public-text-area")
        var privateKeyComponent = document.getElementById("private-text-area")

        for (var key in players) {
            console.log(players[key].name+ " " + Cookies.get('userName'))
            if(players[key].name === Cookies.get('userName')){
                nameTitle.innerHTML =`<h5>${players[key].name}<h5>`
                publicKeyComponent.innerHTML= players[key].account.publicKey; 
                privateKeyComponent.innerHTML = players[key].account.privateKey;
            }

        }
    },

    openModal: function(modalId){
        // $("#myBtn").click(function(){
            $("#myModal").modal();
        //  });
    }
}