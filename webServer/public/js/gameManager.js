game ={
    player : null,
    players : [],
    products : [],
    terrains : [],

    startingGameOnClient: function(gameData) {
        this.loadGameInfo(gameData);
    },

    loadGameInfo(gameData){

        ///TO-DO Cargar info en listas
        renderGameWindo();
    },

    renderGameWindow: function(){
        $("#gamecontainer").load("wigets/w-game.html",function() {
            console.log(JSON.stringify(gameData))
            setGameStatus()
        });
    },

    setGameStatus: function(gData){
        gameStatus = gData
        renderGameStatus(gData);
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