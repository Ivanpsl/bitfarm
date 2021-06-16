

var gameManager = {

    gameConfig: null,
    townHall : {},
    player: {},
    players: [],
    builds : [],

    market : [],
    playersOfferts : [],

    blockchainLogs : [],

    turn : 0,
    maxMilisecondsPerTurn: 100000,
    turnInterval: null,
    turnIsRunning: true,
    milisecondsRemaining: 0,
    

    playersWaiting : 0,
    weekElement: null,
    timeRemainingElement: null,
    toolsElement: null,
    storageElement: null,
    moneyElement: null,
    blockchainLogContainer: null,
    modalContainerElement: null,
    modalElement : null,
    polipop : null,

    modalNegociationElements : {},

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
            var player = new UIPlayer(dataPlayers[key]);

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
            else if(owner === this.player.account.publicKey) this.player.addProduct(product);
            else if(owner === this.players[owner]) this.players[owner].addProduct(product);
        }
    },

    loadTerrains: function(dataTerrains) {
        for(let terrain of dataTerrains){
            let owner = terrain.owner;
            if(owner === this.townHall.publicKey) this.townHall.terrains.push(terrain);
            else if(owner === this.player.account.publicKey) this.player.addTerrain(terrain);
            else if(owner === this.players[owner]) this.players[owner].addTerrain(terrain);
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
        if(gameManager.milisecondsRemaining <= 0){
            gameManager.endTurn();
        }
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
            this.onNewBlockchainLog(eventObj);
        }else if(eventObj.event === GAME_CONSTANS.EVENT_START_TURN){
            this.onStartTurn();
        }else if(eventObj.event === GAME_CONSTANS.EVENT_PLAYER_END_TURN){
            this.onPlayerEndTurn(eventObj);
        }else if(eventObj.event === GAME_CONSTANS.EVENT_MARKET_BUY){
            
        }else if(eventObj.event === GAME_CONSTANS.EVENT_OFFERT_BUY){
            
        }else if(eventObj.event === GAME_CONSTANS.EVENT_OFFERT_CREATE){
            this.onCreateOffert(eventObj);
        }else  if(eventObj.event === GAME_CONSTANS.EVENT_OFFERT_REMOVE){
            this.onRemoveOffert(eventObj);
        }
    },

    onStartTurn : function(){
        this.turn ++;
        this.milisecondsRemaining = this.maxSecondsPerTurn;
        this.turnIsRunning = true;
        this.turnInterval = setInterval(()=> {this.turnTick()}, 1000);
        gameManager.updateSecondsRemaining();
        this.weekElement.textContent = this.turn;
    },

    onPlayerEndTurn(eventObj){
        this.removeOffertsByOwner(eventObj.data.publicKey);
        this.playersWaiting++;
    },

    endTurn : function(){
        this.openNegociationMenu();
        this.turnIsRunning = false;
        this.milisecondsRemaining = 0;
        clearInterval(this.turnInterval);
    },

    onRemoveOffert :  function(eventObj) {
        var offertIndex = eventObje.data.offertIndex;
        var uiOffert = this.playersOfferts.find((offert) => offert.index==offertIndex);
        
        uiOffert.remove();
    },

    onCreateOffert : function(eventObj) {
        var offertIndex = eventObj.data.offert.index;
        var offertOwner = eventObj.source;
        var offertPrice = eventObj.data.offert.price;
        var offertItemType = eventObj.data.offert.itemType;
        var offertItemIndex = eventObj.data.offert.itemIndex;
        var offertObj = null;

        if(this.players[offertOwner]){
            var offertElement = this.players[offertOwner].getElementByTypeAndIndex(offertItemType,offertItemIndex);
            offertObj = new UIPlayerOffert(offertIndex,offertPrice,offertElement,offertOwner,false);
            this.playersOfferts.push(offertObj);
        }
    },

    openMarket : function(){
        this.modalRenderMarket(this.market);
    },

    openNegotiationMenu : function(){
        gameManager.modalElement.style.display = "block";
    },

    closeNegotiationMenu : function(){
        gameManager.modalElement.style.display = "none";
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
                gameManager.players.forEach((player) => (player.resetLists()));
                gameManager.player.resetLists();

                gameManager.townHall = response.townHall;

                gameManager.loadProducts(response.products)
                gameManager.loadTerrains(response.terrains);
                gameManager.loadTools(response.tools);

                gameManager.updateAllPlayersResume();
                gameManager.updateLocalPlayerResume();
                gameManager.renderTerrains();

                callback(response);
                gameManager.closeModal();
            },
            error: function (response, status, error) {
                gameManager.showNotification('Ha ocurrido un error','error',response.responseText);
            }
        });
    },

    sendNewOffert : function(item, price){
        $.ajax({
            url: URL_BASE + "/game/off",
            type: "POST",
            data: {
                sourceAcc: gameManager.player.account,
                itemType: item.type,
                itemIndex: item.index,
                price: price
            },
            dataType: 'json',
            success: function (response, textStatus, jqXHR) {
                gameManager.showNotification('Oferta creada','success','La oferta para ' + item.name + ' ha sido creada');

            },
            error: function (response, status, error) {
                gameManager.showNotification('Ha ocurrido un error','error',response.responseText);
            }
        });
    },

    onNewBlockchainLog : function(eventObj){
        var text = "";
        var index = this.blockchainLogs.length;
        this.blockchainLogs[this.blockchainLogs.length]= eventObj;
        if(eventObj.event === GAME_CONSTANS.EVENT_NEW_BLOCK_LOG)
            text = "Bloque";
        else text = "Transacción"

        this.renderBlockchainLog(index,text);
    },

    updateAllPlayersResume : function(){
        this.players.forEach((player) => player.updatePlayerResume());
    },

    updateSecondsRemaining: function () {
        var timePercent = (((this.milisecondsRemaining) * 100) / parseInt(this.maxMilisecondsPerTurn))

        if (this.milisecondsRemaining > 0 && !this.turnIsRunning) {
            this.turnIsRunning = true;
            this.timeIconElement.classList.add("spin-icon");
        } else if (this.milisecondsRemaining <= 0) {
            this.timeIconElement.classList.remove("spin-icon");
        }

        this.timeRemainingElement.innerHTML = this.milisecondsRemaining / 1000;
        this.timeBarElement.style = `width:${timePercent}%`;
    },

    updateLocalPlayerResume : function(){
        this.player.updateLocalResume();
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


            gameManager.modalNegociationElements.parent = document.getElementById("negociation-modal-window");
            gameManager.modalNegociationElements.itemList = document.getElementById("item-offert-list");

            gameManager.modalNegociationElements.playerItems = document.getElementById("item-element-list");
            gameManager.modalNegociationElements.offertList = document.getElementById("offert-list");
            gameManager.modalNegociationElements.endTurnBtn = document.getElementById("end-turn");
            
            removeAllChildNodes(gameManager.blockchainLogContainer);

            gameManager.polipop = new Polipop('mypolipop', {
                layout: 'popups',
                insert: 'before',
                pool: 5,
                sticky: true,
                closeText: 'Cerrar',
            });

            $('#btn-open-storage').click(function(){ gameManager.player.openStorageModal(); });
            $('#btn-open-inventory').click(function(){ gameManager.player.openInventoryModal(); });
            $('#btn-open-money').click(function(){ gameManager.openMarket(); });

            gameManager.renderPlayers();
            gameManager.renderTerrains();
            gameManager.suscribeToGameEvents();

            gameManager.openWelcomeWindow();
            gameManager.startTurn();
        });
    },

    renderTerrains : function(){
        removeAllChildNodes(gameManager.terrainsElement);
        console.log("Renderizando tierras "+ JSON.stringify(this.player.terrains));
        this.player.renderTerrains();
    },


    renderPlayers : function(){
        removeAllChildNodes(document.getElementById("player-list"));
        this.player.render();
        this.players.forEach(player => {
            player.render();
        });
        gameManager.updateLocalPlayerResume();
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

    removeOffertsByOwner : function(ownerKey){
        this.playersOfferts.filter((offert) => offert.owner != ownerKey)
    },

    modalRenderNegociationMenu : function(){
     
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

    modalRenderMarket : function(){
        $("#modal-content").load("wigets/modals/m-market.html", function () {
            for(let i =0; i< gameManager.market.length; i++){
                console.log(i)
                gameManager.market[i].select = false;
                var offert = gameManager.market[i];
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

    showNotification : function(title,type,msg)
    {
        gameManager.polipop.add({
            content: msg,
            title: title,
            type: type,
        });
    },

    openModal : function() {
        gameManager.modalElement.style.display = "block";
    },

    closeModal : function() {
        gameManager.modalElement.style.display = "none";
    }
}