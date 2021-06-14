

var gameManager = {

    gameConfig: null,
    townHall : {},
    player: {},
    players: [],
    products: [],
    terrains: [],
    tools : [],
    builds : [],
    
    market : [],
    

    blockchainLogs : [],

    maxSecondsPerTurn: 100,

    turnInterval: null,
    turnIsRunning: true,
    secondsRemaining: 0,

    weekElement: null,
    timeRemainingElement: null,
    toolsElement: null,
    storageElement: null,
    moneyElement: null,
    blockchainLogContainer: null,
    modalContainerElement: null,
    modalElement : null,
    polipop : null,
    listening : false,

    initGame: function (gameData) {
        this.loadConfig(gameData.gameConfig);

        this.townHall = gameData.townHall
        this.townHall.terrains = [];
        this.townHall.tools = [];
        this.townHall.products = [];

        this.market = gameData.market;
        
        this.loadPlayers(gameData.players);

        this.loadProducts(gameData.products)
        this.loadTerrains(gameData.terrains);
        this.loadTools(gameData.tools);

        this.renderGameWindow();

    },

    loadConfig: function (config) {
        console.log(config.time_per_turn);
        this.gameConfig = config;
        this.maxMilisecondsPerTurn = this.gameConfig.time_per_turn;
        this.milisecondsRemaining = this.maxMilisecondsPerTurn;
        console.log("Configuracion: " + this.gameConfig)

    },

    loadPlayers: function (dataPlayers) {
        console.log()
        for (var key in dataPlayers) {
            var player = dataPlayers[key];

            player.terrains = [];
            player.tools = [];
            player.products = [];
            console.log(dataPlayers[key].id + "vs \n"+Cookies.get('userId'))
            if (dataPlayers[key].id === Cookies.get('userId')) {
                console.log("Jugador recnocido")
                this.player = player;
                console.log(JSON.stringify(this.player));
            }
            else {
                this.players[key] = player;
            }
        }
    },

    loadProducts : function(dataProducts) {
        for(let product of dataProducts){
            let owner = product.owner;
            if(owner === this.townHall.publicKey) this.townHall.products.push(product);
            else if(owner === this.player.account.publicKey) this.player.products.push(product);
            else if(owner === this.players[owner]) this.players[owner].products.push(product);
        }
    },
    loadTerrains: function(dataTerrains) {
        for(let terrain of dataTerrains){
            let owner = terrain.owner;
            if(owner === this.townHall.publicKey) this.townHall.terrains.push(terrain);
            else if(owner === this.player.account.publicKey) this.player.terrains.push(terrain);
            else if(owner === this.players[owner]) this.players[owner].terrains.push(terrain);
        }
    },
    loadTools: function(dataTools) {
        for(let tool of dataTools){
            let owner = tool.owner;
            if(owner === this.townHall.publicKey) this.townHall.tools.push(tool);
            else if(owner === this.player.account.publicKey) this.player.tools.push(tool);
            else if(owner === this.players[owner]) this.players[owner].tools.push(tool);
        }
    },
    


    turnTick: function () {
        console.log("Tick");
        gameManager.milisecondsRemaining -= 1000;
        gameManager.updateSecondsRemaining();
    },

    setGameStatus: function (gData) {
        this.renderGameStatus(gData);
    },

    suscribeToGameEvents: function(){
        if (!this.listening) {
            const events = new EventSource('/game/suscribe');
            events.onmessage = function(event) {
                const eventObj = JSON.parse(event.data);
                console.log("Nuevo evento: "+ eventObj.event);
                console.log(eventObj.data)
                gameManager.handleEvents(eventObj);
            };
            this.listening = true;
        }
    },

    handleEvents : function(eventObj){
        if(eventObj.event === GAME_CONSTANS.EVENT_NEW_BLOCK_LOG || eventObj.event === GAME_CONSTANS.EVENT_NEW_TRANSACTION_LOG){
            this.addBlockchainLog(eventObj);
        }else if(eventObj.event === GAME_CONSTANS.EVENT_START_TURN){
            this.statTurn();
        }
    },
    
    startTurn : function(){
        this.turnInterval = setInterval(()=> {this.turnTick()}, 1000);
    },

    openMarket : function(){
        this.modalRenderMarket(this.market);
    },
    openInventory : function() {
        gameManager.polipop.add({
            content: 'No tienes ninguna herramienta.',
            title: 'Error',
            type: 'error',
        });
    },
    openStorage : function() {
        gameManager.polipop.add({
            content: 'No tienes hay producto en el almacen.',
            title: 'Error',
            type: 'error',
        });
    },

    buyOnMarket : function(){
        for(var offert of this.market){
            if (offert.select){

                var actionData = {
                    targetPublicKey: this.townHall.account.publicKey,
                    elementType : offert.item.type,
                    elementIndex : offert.item.index,
                    price : offert.price,
                }
                
                this.sendAction(GAME_CONSTANS.ACTION_ELEMENT_BUY, 40000, actionData, 
                    ()=>{
                        gameManager.polipop.add({
                            content: 'Se ha llevado a cabo la compra.',
                            title: 'Compra realizada',
                            type: 'success',
                        });
                    }
                );
            }
        }

    },

    sendAction : function(actionName, timeConsume, data, callback){
        console.warn(`Ejecutando accion: [${actionName}][consume:${timeConsume}]  actionData: ${JSON.stringify(data)}`);
        $.ajax({
            url: URL_BASE + "/game/action",
            type: "POST",
            data: {
                sourceAcc: gameManager.player.account,
                action: actionName,
                data: data
            },
            dataType: 'json',
            success: function (response, textStatus, jqXHR) {
                console.log("RESPUESTA: ");
                
                var timeResult = parseInt(gameManager.milisecondsRemaining) - parseInt(timeConsume);
                if(timeResult > 0){
                    gameManager.milisecondsRemaining = timeResult;
                }else{
                    gameManager.milisecondsRemaining = 0;
                }

                console.log(JSON.stringify(response));
                
                console.log(JSON.stringify(response.players));
                gameManager.loadPlayers(response.players);
                gameManager.loadProducts(response.products)
                gameManager.loadTerrains(response.terrains);
                gameManager.loadTools(response.tools);

                gameManager.updateAllPlayersResume();
                gameManager.updateLocalPlayerResume()
                callback(response);
                gameManager.closeModal();
            },
            error: function (request, status, error) {
                gameManager.polipop.add({
                    content: request,
                    title: 'Ha ocurrido un error',
                    type: 'error',
                });
                // restartSesion();
                console.error("Se ha perdido la conexión con el servidor: \n", "Se ha perdido la conexión con el servidor\n" + console.log(JSON.stringify(re)));

            }
        });
    },

    addBlockchainLog : function(eventObj){
        var text = "";
        var index = this.blockchainLogs.length;
        this.blockchainLogs[this.blockchainLogs.length]= eventObj;
        if(eventObj.event === GAME_CONSTANS.EVENT_NEW_BLOCK_LOG)
            text = "Bloque";
        else text = "Transacción"
        
        this.renderBlockchainLog(index,text);
    },

    updateAllPlayersResume : function(){
        this.players.forEach((player) => this.updatePlayerResume(player));
    },

    updatePlayerResume: function(playerData){
        console.log(playerData)
        var cash = document.getElementById(`cash-${playerData.id}`);
        var terrain = document.getElementById(`terrain-${playerData.id}`);
        var storage = document.getElementById(`storage-${playerData.id}`);

        cash.textContent  = ` ${playerData.money}$`;
        storage.textContent  =` ${playerData.products.length}/${playerData.max_storage}`
        terrain.textContent  =` ${playerData.terrains.length}`
    },

    updateSecondsRemaining: function () {
        var timePercent = (((this.milisecondsRemaining) * 100) / parseInt(this.maxMilisecondsPerTurn))

        if (this.milisecondsRemaining > 0 && !this.turnIsRunning) {
            this.turnIsRunning = true;
            this.timeIconElement.classList.add("spin-icon");
        } else if (this.milisecondsRemaining <= 0) {
            this.timeIconElement.classList.remove("spin-icon");
            this.turnIsRunning = false;
            this.milisecondsRemaining = 0;
            clearInterval(this.turnInterval);
        }
        
        this.timeRemainingElement.innerHTML = this.milisecondsRemaining / 1000;
        this.timeBarElement.style = `width:${timePercent}%`;
    },


    updateLocalPlayerResume(){
        this.toolsElement.textContent  = `${this.player.tools.length}`;
        this.storageElement.textContent  =`${this.player.products.length}/${this.player.max_storage}`;
        this.moneyElement.textContent  =  `${this.player.money}€`;
        this.updatePlayerResume(this.player);
    },

    renderGameWindow: function () {
        $("#gamecontainer").load("wigets/w-game.html", function () {
            gameManager.weekElement = document.getElementById("name-title");
            gameManager.timeRemainingElement = document.getElementById("time-remaining");
            gameManager.timeBarElement = document.getElementById("progress");
            gameManager.timeIconElement = document.getElementById("crono-icon");
            gameManager.toolsElement = document.getElementById("tools-num");
            gameManager.storageElement = document.getElementById("storage-num");
            gameManager.moneyElement = document.getElementById("money-num");

            gameManager.terrainsElement = document.getElementById("terrains-resume");
            gameManager.blockchainLogContainer = document.getElementById("chain-log-container");
            gameManager.modalContainerElement = document.getElementById("modal-content");
            gameManager.modalElement = document.getElementById("modal-window");
            //console.log(JSON.stringify(gameData));
            // .thissetGameStatus();

            removeAllChildNodes(gameManager.blockchainLogContainer);
            removeAllChildNodes(gameManager.terrainsElement);
            gameManager.polipop = new Polipop('mypolipop', {
                layout: 'popups',
                insert: 'before',
                pool: 5,
                sticky: true,
                closeText: 'Cerrar',
            });
            gameManager.renderPlayers();
            gameManager.renderTerrains();
            gameManager.suscribeToGameEvents();

            gameManager.startTurn();
        });
    },

    renderTerrains(){
        console.log("Renderizando tierras "+ JSON.stringify(this.player.terrains));
        for(let terrain of this.player.terrains){
            console.log("Renderizando tierra "+terrain.index )
            this.renderTerrain(terrain)
        }
    },

    renderTerrain : function(terrainData){
        var containerElement = document.createElement("div");
        containerElement.className = "row terrain-container relieve";
        containerElement.id = `terrain-container-${terrainData.index}`;
        var nameElement = document.createElement("div");
        nameElement.className = "col terrain-name";
        var h5 = document.createElement("h5");
        h5.textContent = `Terreno ${terrainData.index}`
        nameElement.appendChild(h5);

        containerElement.appendChild(nameElement);
        containerElement.appendChild(document.createElement("hr"));

        var infoElement = document.createElement("div");
        infoElement.className = "terrain-info position-relative";

        var spamInfo = document.createElement("spam");
        spamInfo.className="terrain-info-text position-absolute translate-middle";
        spamInfo.id = `terrain-info-${terrainData.index}`;
        spamInfo.textContent = " Este terreno no tiene contenido";

        infoElement.appendChild(spamInfo);
        containerElement.appendChild(infoElement);
        
        var actionsContainerElement = document.createElement("div");
        actionsContainerElement.className = "terrain-actions d-flex flex-row-reverse";
        actionsContainerElement.id = `terrain-actions-${terrainData.index}`;

        console.log("Renderizando acciones: "+this.gameConfig.terrainActions)
        for(let action of this.gameConfig.terrainActions){
            console.log(action.name)
            let actionElement = document.createElement("div");
            actionElement.type ="button";
            actionElement.className = "btn btn-terrain-action";
            actionElement.textContent = action.label;
            let actionData = {type : "TERRAIN", idenx: terrainData.index};
            actionElement.onclick = ()=>  {
                this.executeAction(action.name,action.time_cost,actionData);
            }

            actionsContainerElement.appendChild(actionElement);
        }

        containerElement.appendChild(actionsContainerElement);
        this.terrainsElement.appendChild(containerElement);
    },

    renderPlayers : function(){
        removeAllChildNodes(document.getElementById("player-list"));
        console.log("Rendering players")
        this.renderPlayer(this.player);

        this.players.forEach(player => {
            this.renderPlayer(player);
        });
        gameManager.updateLocalPlayerResume();
    },



    renderPlayer: function (playerData) {
        console.log("Render player: " + playerData)
        var drawer = document.createElement("div");
        drawer.className="player-drawer";
        var img = document.createElement("img");
        img.className = "profile-image";
        img.src = "https://avatars.dicebear.com/api/human/" + playerData.name + ".svg" ;
        img.alt = "Profile pic";
        drawer.appendChild(img);

        var playerTextContainer = document.createElement("div");
        playerTextContainer.className="player-text";
        var playerNameContainer = document.createElement("h6");
        playerNameContainer.innerHTML = playerData.name
        playerTextContainer.appendChild(playerNameContainer);

        var playerResumeContainer = document.createElement("div");
        playerResumeContainer.className="row pb-0 px-1 player-resumen shadow-sm text-muted"
        var cashContainer = document.createElement("div");
        cashContainer.className="cash col";
        var cashSpan = document.createElement("span");
        cashSpan.className="bi bi-cash-stack";
        cashSpan.id = `cash-${playerData.id}`;
        cashContainer.appendChild(cashSpan);
        playerResumeContainer.appendChild(cashContainer);

        var terrainsContainer = document.createElement("div");
        terrainsContainer.className="terrain col";
        var terrainSpan = document.createElement("span");
        terrainSpan.className="bi bi-layers-half";
        terrainSpan.id = `terrain-${playerData.id}`;
        terrainsContainer.appendChild(terrainSpan);
        playerResumeContainer.appendChild(terrainsContainer);

        var storageContainer = document.createElement("div");
        storageContainer.className="store col";
        var storageSpan = document.createElement("span");
        storageSpan.className="bi bi-box-seam";
        storageSpan.id = `storage-${playerData.id}`;
    

        storageContainer.appendChild(storageSpan);
        playerResumeContainer.appendChild(storageContainer);

        playerTextContainer.appendChild(playerResumeContainer);
        
        var separator = document.createElement("hr");
        separator.className = "separator";
        playerTextContainer.appendChild(separator);

        drawer.appendChild(playerTextContainer);

        drawer.onclick = ()=>  {
            this.modalRenderPlayer(playerData);
        }

        document.getElementById('players-resume-list').appendChild(drawer);

    },

    renderBlockchainLog : function(index,text){
        var logElement =  document.createElement("div");
        logElement.className = "log-element log-element-new";
        logElement.id = `log-element-${index}`;
        logElement.textContent = text;
        var spanElement = document.createElement("span");
        spanElement.className = "badge";
        spanElement.id = `spam-log-badge-${index}`;
        spanElement.textContent = " Nueva"
        logElement.appendChild(spanElement);
        logElement.onclick = ()=>  {
            logElement.classList.remove("log-element-new");
            if(spanElement){
                logElement.removeChild(spanElement);
                spanElement = null;
            }

            this.modalRenderBlockChainLog(index);
        }
        
        var firstLog = gameManager.blockchainLogContainer.firstChild;
        if(firstLog){
            gameManager.blockchainLogContainer.insertBefore(logElement,firstLog);
        }else{
            gameManager.blockchainLogContainer.appendChild(logElement);
        }
    },

    modalRenderBlockChainLog : function(index){
        $("#modal-content").load("wigets/modals/m-transaction.html", function () {
            var log = gameManager.blockchainLogs[index].data;
            console.log(log.sender + "\n" + log.timestamp);
            document.getElementById("transaction-publickey").textContent = log.sender;
            document.getElementById("transaction-timestamp").textContent = log.timestamp;
            document.getElementById("transaction-signature").textContent = log.signature;
            document.getElementById("data-text-area").textContent = log.data;
            gameManager.openModal();
        });
    },

    modalRenderPlayer : function(playerData){
        $("#modal-content").load("wigets/modals/m-account.html", function () {
            document.getElementById("modal-title").textContent = "Cuenta de "+playerData.name;
            document.getElementById("public-text-area").textContent = playerData.account.publicKey;
            document.getElementById("private-text-area").textContent = playerData.account.privateKey;

            gameManager.openModal();
        });
    },

    modalRenderMarket : function(){
        $("#modal-content").load("wigets/modals/m-market.html", function () {
            for(let i =0; i< gameManager.market.length; i++){
                console.log(i)
                gameManager.market[i].select = false;
                offert = gameManager.market[i];
                var description = "";
                if(offert.item.type === "TERRAIN"){
                    description = `Parcela numero ${offert.item.index} donde cultivar`;
                }else if(offert.item.type === "TOOL"){
                    description = `Producto que le permitira mejorar su desempeño en la granja`;
                }else {
                    description = `Producto que es posible plantar en una parcela`
                }

                var liContainer = document.createElement("li");
                liContainer.className="list-group-item d-flex justify-content-between align-items-start list-group-item-action";
                liContainer.id = `offert-${i}`;
                var container = document.createElement("div");
                container.className="ms-2 me-auto";
                
                var header = document.createElement("div");
                header.className = "fw-bold";
                header.textContent = offert.item.label ?? "Terreno";
                var spamDescription = document.createElement("spam");
                spamDescription.textContent = description;
                container.appendChild(header);
                container.appendChild(spamDescription);

                var priceSpan = document.createElement("span");
                priceSpan.className="badge bg-success rounded-pill";
                priceSpan.textContent = `${offert.price}€`;
                
                liContainer.appendChild(container);
                liContainer.appendChild(priceSpan);
                liContainer.addEventListener("click",()=> {gameManager.selectMarketItem(i)});

                document.getElementById("element-container").appendChild(liContainer);
            }


            document.getElementById("current-money").textContent = `${gameManager.player.money}`
            
            gameManager.openModal();
        });
    },

    selectMarketItem : function(index){

        console.log(`offert-${index}`);
        if(gameManager.market[index].select){
            document.getElementById( `offert-${index}`).classList.remove("market-selected");
            gameManager.market[index].select = false;
        }else{
            document.getElementById( `offert-${index}`).classList.add("market-selected");
            gameManager.market[index].select = true;
        }

        var totalPrice =0;
        var canBuy = false;
        for(let offert of gameManager.market){
            if(offert.select) {
                totalPrice = totalPrice + offert.price;
                canBuy= true;
            }
        }

        document.getElementById("selection-cost").textContent = `${totalPrice}€`

        if(totalPrice > gameManager.player.money){  
            document.getElementById("btn-buy").disabled = true;
            document.getElementById("market-alert").classList.remove("nodisplay");
        }else{
            document.getElementById("btn-buy").disabled = !canBuy;
            document.getElementById("market-alert").classList.add("nodisplay");
        }
    },

    openModal : function() {
        gameManager.modalElement.style.display = "block";
    },
    closeModal : function() {
        gameManager.modalElement.style.display = "none";
    }
}