gameStatus ={}

function setGameStatus(gData){
    gameStatus = gData
    renderGameStatus(gData);
}
function renderGameStatus(gData){
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
  
    
}