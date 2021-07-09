/*global window,Cookies, GAME_CONSTANTS,UIPlayer,URL_BASE,$,document,removeAllChildNodes, Polipop,GameEventsHandler */
var gameManager = {

    gameConfig: null,
    townHall: {},
    player: {},
    players: {},
    builds: [],

    market: [],
    playersOfferts: [],

    blockchainLogs: [],

    turn: 0,
    maxMilisecondsPerTurn: 100000,
    turnInterval: null,
    turnIsRunning: true,
    milisecondsRemaining: 0,
    climaticEvent : null,


    playersWaiting: 0,
    weekElement: null,
    climaticElement : null,
    climaticIcon : null,
    timeRemainingElement: null,
    toolsElement: null,
    storageElement: null,
    moneyElement: null,
    blockchainLogContainer: null,
    modalContainerElement: null,
    modalElement: null,
    polipop: null,

    modalNegociationElements: {},

    modalFinalGame : {},

    gameEventsHandler: null,

    initGame: function (gameData) {
        this.loadConfig(gameData.gameConfig);
        this.loadClimaticEvent(gameData.actualEvent);
        this.loadTownHall(gameData.townHall)

        this.blockchainLogs = [];

        this.market = gameData.market;

        this.loadPlayers(gameData.players);

        this.loadTerrains(gameData.terrains);
        this.loadProducts(gameData.products)
        this.loadTools(gameData.tools);
        this.loadBuildings(gameData.buildings);

        this.renderGameWindow();
    },

    loadConfig: function (config) {
        this.gameConfig = config;
        this.maxMilisecondsPerTurn = this.gameConfig.time_per_turn;
        this.milisecondsRemaining = this.maxMilisecondsPerTurn;
    },

    loadTownHall: function (hallData) {
        gameManager.townHall = hallData;

        gameManager.townHall.products = [];
        gameManager.townHall.terrains = [];
        gameManager.townHall.tools = [];

    },

    loadPlayers: function (dataPlayers) {
        this.players = {};
        for (var key in dataPlayers) {
            var player = new UIPlayer(dataPlayers[key]);

            if (dataPlayers[key].id === Cookies.get('userId')) {
                console.log("Jugador reconocido")
                this.player = player;
            } else {
                console.log("Añadiendi jugador " + player.name);
                this.players[key] = player;
            }
        }
    },
    loadClimaticEvent : function (climaticData) {
        this.climaticEvent = climaticData;
    },

    loadTerrains: function (dataTerrains) {
        for (let terrain of dataTerrains) {
            let owner = terrain.owner;
            if (owner === this.townHall.account.publicKey) this.townHall.terrains.push(terrain);
            else if (owner === this.player.account.publicKey) this.player.addTerrain(terrain);
            else if (this.players[owner]) this.players[owner].addTerrain(terrain);
        }
    },

    loadProducts: function (dataProducts) {
        for (let product of dataProducts) {
            if (product && product.owner) {
                let owner = product.owner;
                if (owner === this.townHall.account.publicKey) this.townHall.products.push(product);
                else if (owner === this.player.account.publicKey) {
                    this.player.addProduct(product);
                    if (product.status === GAME_CONSTANTS.PRODUCT_STATUS_PLANTED) {
                        console.log(JSON.stringify(product))
                        this.player.terrains.find((terrain) => terrain.index == product.terrainIndex).setContent(product);
                    }
                } else if (this.players[owner]) {
                    this.players[owner].addProduct(product);
                    if (product.status === GAME_CONSTANTS.PRODUCT_STATUS_PLANTED)
                        this.players[owner].terrains.find((terrain) => terrain.index == product.terrainIndex).setContent(product);
                }
            }
        }
    },

    loadTools: function (dataTools) {
        for (let tool of dataTools) {
            let owner = tool.owner;
            if (owner === this.townHall.account.publicKey) this.townHall.tools.push(tool);
            else if (owner === this.player.account.publicKey) this.player.tools.push(tool);
            else if (this.players[owner]) this.players[owner].tools.push(tool);
        }
    },

    loadBuildings: function (dataBuilding) {
        for (let building of dataBuilding) {
            if (building != null) {
                var terrain;
                let owner = building.owner;
                if (owner === this.player.account.publicKey){
                    terrain= this.player.getElementByTypeAndIndex(GAME_CONSTANTS.TYPE_TERRAIN, building.terrainIndex);
                    if(terrain)
                        terrain.setContent(building);
                }
                else if (this.players[owner])
                    terrain = this.players[owner].getElementByTypeAndIndex(GAME_CONSTANTS.TYPE_TERRAIN, building.terrainIndex);
                    if(terrain)
                        terrain.setContent(building);
            }
        }
    },

    renderGameWindow: function () {
        $("#gamecontainer").load("wigets/w-game.html", function () {
            gameManager.weekElement = document.getElementById("week-number");
            gameManager.climaticElement = document.getElementById("climatic-text");
            gameManager.climaticIcon = document.getElementById("climatic-icon");
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
            gameManager.modalNegociationElements.playerItems = document.getElementById("item-element-list");
            gameManager.modalNegociationElements.offertList = document.getElementById("offert-list");
            gameManager.modalNegociationElements.endTurnBtn = document.getElementById("end-turn");
            gameManager.modalNegociationElements.waitingNumberSpam = document.getElementById("players-waiting");
            gameManager.modalNegociationElements.notificationContainer = document.getElementById("offerts-notifications");

            gameManager.modalFinalGame.parent = document.getElementById("end-modal-window");
            gameManager.modalFinalGame.exit = document.getElementById("btn-exit");
            gameManager.modalFinalGame.title = document.getElementById("end-modal-title");
            gameManager.modalFinalGame.text = document.getElementById("end-modal-desc");

            gameManager.modalNegociationElements.parent.style.display = "none";
            gameManager.modalFinalGame.parent.style.display = "none";

            removeAllChildNodes(gameManager.blockchainLogContainer);

            gameManager.polipop = new Polipop('mypolipop', {
                layout: 'popups',
                insert: 'before',
                pool: 20,
                sticky: false,
                closeText: 'Cerrar',
                progressbar: true,
                life: 3000
            });

            $('#btn-open-storage').click(function () {
                gameManager.player.openStorageModal();
            });
            $('#btn-open-inventory').click(function () {
                gameManager.player.openInventoryModal();
            });
            $('#btn-open-money').click(function () {
                gameManager.openMarket();
            });

            $('#end-turn').click(function () {
                gameManager.endTurn();
            });

            $('#btn-exit').click(function(){
                Cookies.remove('userId');
                Cookies.remove('actualRoomId');
                Cookies.remove('actualRoomType');
            
                var mensaje = "La partida ha finalizado";
                // eslint-disable-next-line no-undef
                window.location.href = HOME_URL+`/game/login.html?mensaje=${mensaje}&tipoMensaje=alert-info` ; 
                if(gameManager.gameEventsHandler && gameManager.gameEventsHandler.listening){
                    gameManager.gameEventsHandler.disconect();
                }
            });

            gameManager.renderPlayers();
            gameManager.renderTerrains();

            gameManager.gameEventsHandler = new GameEventsHandler();
            gameManager.gameEventsHandler.suscribeToGameEvents();

            gameManager.startTurn();
      
        });
    },

    onPlayerEndTurn(eventObj){
        gameManager.removeOffertsByOwner(eventObj.data.publicKey);
        gameManager.playersWaiting++;
        gameManager.modalNegociationElements.waitingNumberSpam.textContent = gameManager.playersWaiting
    },



    turnTick: function () {
        gameManager.milisecondsRemaining -= 1000;
        gameManager.updateSecondsRemaining();
        if (gameManager.milisecondsRemaining <= 0) {
            gameManager.endFase();
        }
    },

    setGameStatus: function (gData) {
        this.renderGameStatus(gData);
    },
    refresPolipop: function(){
        gameManager.polipop =  new Polipop('globalppop', {
            layout: 'popups',
            insert: 'before',
            pool: 20,
            sticky: false,
            closeText: 'Cerrar',
            progressbar: true,
            life: 3000,
            interval: 100
        });
    },

    startTurn: function () {
        gameManager.refresPolipop();
        gameManager.playersWaiting = 0;

        this.turn++;
        this.milisecondsRemaining = this.maxMilisecondsPerTurn;
        this.turnIsRunning = true;
        this.playersOfferts = [];

        if (this.turnInterval == null)
            this.turnInterval = setInterval(() => {
                this.turnTick()
            }, 1000);
            
        this.updateSecondsRemaining();
        this.updateTurnInfo();
        this.closeNegotiationMenu();

        if(gameManager.turn > 1){
            var msg = `Cobrado ${gameManager.gameConfig.terrain_tax * gameManager.player.terrains.length}€ en impuestos de propiedad`;
            gameManager.showNotification('Turno finalizado','info',msg);
            console.log(msg)
        }

        gameManager.checkWinCondition();

    },

    endFase: function () {
        clearInterval(this.turnInterval);
        for (var i = 0; i < this.turnInterval; i++)
            window.clearInterval(i);

        this.turnInterval = null;
        this.modalRenderNegociationMenu();

        this.turnIsRunning = false;
        this.milisecondsRemaining = 0;
    },

    endTurn: function () {
        console.log("Finalizando turno")
        gameManager.modalNegociationElements.endTurnBtn.disabled = true;
        gameManager.modalNegociationElements.endTurnBtn.textContent = "Esperando por los demas jugadores";
        // gameManager.showNotification('Tu turno ha finalizado', 'success', 'Esperando por el resto de jugadores');

        $.ajax({
            url: URL_BASE + "/game/player/endTurn",
            type: "GET",
            data: {},
            dataType: 'json',
            success: function () {
                console.log("Finalizando turno")

            },
            error: function (response) {
                gameManager.showNotification('Ha ocurrido un error', 'error', response.responseText);
                console.log("Finalizando turno")

            }
        });
    },


    openMarket: function () {
        this.modalRenderMarket(this.market);
    },

    removeMarketElementByProductIndexAndType(itemIndex, itemType) {
        console.log(`Eliminando elemento de la tienda ${itemIndex}-> ${itemType}`)

        for (let i = 0; i < gameManager.market.length; i++) {
            console.log(`Check ${gameManager.market[i].item.index}-> ${ gameManager.market[i].item.type}`)
            if (gameManager.market[i].item.index == itemIndex && gameManager.market[i].item.type == itemType) {
                console.log(`Encontrado offert-${i} con index =>${gameManager.market[i].index} `)

                gameManager.market[i].wasBuy = true;
                var uiOffert = document.getElementById(`offert-${i}`);
                if (uiOffert != null)
                    uiOffert.parentNode.removeChild(uiOffert);
            }
        }
    },

    openNegotiationMenu: function () {
        gameManager.modalNegociationElements.parent.style.display = "block";
    },

    closeNegotiationMenu: function () {
        gameManager.removeNegotiationNotify();
        gameManager.modalNegociationElements.waitingNumberSpam.textContent = 0;
        gameManager.modalNegociationElements.parent.style.display = "none";

    },

    
    openEndModal: function (isWin) {
        if(isWin){
            gameManager.modalFinalGame.title.textContent  = "¡Has ganado!"
            gameManager.modalFinalGame.text.innerHTML = "<strong>¡Felicidades!</strong><p>Has sido la granja que más ha aguantado</p> "

        }
        else{
            gameManager.modalFinalGame.title.textContent = "Has perdido";
            gameManager.modalFinalGame.text.textContent = "Te has quedado sin dinero suficiente para seguir jugando";
        }
        
        
        gameManager.modalFinalGame.parent.style.display = "block";

    },


    removeNegotiationNotify : function(){
        removeAllChildNodes(gameManager.modalNegociationElements.notificationContainer);
    },
    setNegotiationNotify : function(msg){
        this.removeNegotiationNotify();
        var alertElement = document.createElement("div");
        alertElement.className = "alert alert-warning m-2 d-flex align-items-center";
        alertElement.role = "alert";
        alertElement.textContent = msg;
        gameManager.modalNegociationElements.notificationContainer.appendChild(alertElement);
    },

    refreshAllData: function (gameData) {
        for (let key in gameManager.players) {
            gameManager.players[key].resetLists();
        }

        gameManager.player.resetLists();

        gameManager.loadTownHall(gameData.townHall);

        for (let key in gameData.players) {
            if (gameManager.players[key]) {
                gameManager.players[key].money = gameData.players[key].money;
                gameManager.players[key].max_storage = gameData.players[key].max_storage;
                gameManager.players[key].modifiers = gameData.players[key].modifiers;
            } else if (gameManager.player.account.publicKey === key) {
                gameManager.player.money = gameData.players[key].money;
                gameManager.player.max_storage = gameData.players[key].max_storage;
                gameManager.player.modifiers = gameData.players[key].modifiers;
            }
        }
        this.market = gameData.market
        gameManager.loadClimaticEvent(gameData.actualEvent);
        gameManager.loadTerrains(gameData.terrains);
        gameManager.loadProducts(gameData.products);
        gameManager.loadBuildings(gameData.buildings);
        gameManager.loadTools(gameData.tools);

        gameManager.updateAllPlayersResume();
        gameManager.updateLocalPlayerResume();
        gameManager.updateTurnInfo();
        gameManager.renderTerrains();
    },

    checkWinCondition(){
        console.log("Checking win condition")
        if(gameManager.player.money<=0){
            gameManager.openEndModal(false);
        }
        var playersLost = 0;
        for (let key in this.players){
            console.log(this.players[key].money)
            if(this.players[key].money> 0){
                return;
            }else{
                playersLost++;
            }
        }
        if(playersLost == this.players.length)
            gameManager.openEndModal(true);
    },

    buyOnMarket: function () {
        for (var offert of this.market) {
            if (offert.select) {

                var actionData = {

                    targetPublicKey: this.townHall.account.publicKey,
                    elementType: offert.item.type,
                    elementIndex: offert.item.index,
                    price: offert.price
                }

                this.sendAction(GAME_CONSTANTS.ACTION_ELEMENT_BUY, 5000, actionData,
                    (completed) => {
                        if(completed){
                            this.removeMarketElementByProductIndexAndType(offert.item.index,offert.item.type)
                            gameManager.showNotification('Se ha llevado a cabo la compra.','success','Compra realizada');
                        }
                    }
                );
            }
        }

    },
    
    sendAction: function (actionName, timeConsume, data, callback) {
        var timeResult = parseInt(gameManager.milisecondsRemaining) - parseInt(timeConsume);

        if (timeResult >= 0) {
            gameManager.milisecondsRemaining = timeResult;

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
                // eslint-disable-next-line no-unused-vars
                success: function (response, _textStatus, _jqXHR) {

                    gameManager.refreshAllData(response)

                    if (callback)
                        callback(true,response);
                    gameManager.closeModal();
                },
                // eslint-disable-next-line no-unused-vars
                error: function (response, _status, _error) {
                    if (callback)
                        callback(false,response);
                    gameManager.showNotification('Ha ocurrido un error', 'error', response.responseText);
                    gameManager.milisecondsRemaining = gameManager.milisecondsRemaining + parseInt(timeConsume);
                }
            });
        } else {
            gameManager.showNotification('Error al ejecutar una acción', 'error', 'No queda tiempo suficiente para realizar esta acción')
        }
    },

    sendNewOffert: function (item, price) {
        console.log("Enviando oferta: " + price)
        $.ajax({
            url: URL_BASE + "/game/offert/create",
            type: "POST",
            data: {
                sourceAcc: gameManager.player.account,
                offertIndex: gameManager.playersOfferts.length,
                itemType: item.type,
                itemIndex: item.index,
                price: price
            },
            dataType: 'json',
            // eslint-disable-next-line no-unused-vars
            success: function (_response, _textStatus, _jqXHR) {
                gameManager.showNotification('Oferta creada', 'success', 'La oferta para ' + item.label + ' ha sido creada');
            },
            // eslint-disable-next-line no-unused-vars
            error: function (response, _status, _error) {
                gameManager.showNotification('Ha ocurrido un error', 'error', response.responseText);
            }
        });
    },


    
    updateAllPlayersResume: function () {
        for (let key in this.players)
            this.players[key].updatePlayerResume();
    },

    updateTurnInfo: function () {
        this.weekElement.textContent = this.turn;
        console.warn("Climatic event " + JSON.stringify(this.climaticEvent) )
        if(this.climaticEvent){
            this.climaticElement.textContent = this.climaticEvent.label;
            if(this.climaticEvent == 'rain')
                this.climaticIcon.className = 'bi bi-cloud-rain-heavy';
            else if(this.climaticEvent == 'drought')
                this.climaticIcon.className = 'bi bi-thermometer-sun';
        }
        else{
            this.climaticElement.textContent = 'Sol con nubes';
            this.climaticIcon.className = 'bi bi-cloud-sun'
        }
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

    updateLocalPlayerResume: function () {
        this.player.updateLocalResume();
    },

   


    renderTerrains: function () {
        removeAllChildNodes(gameManager.terrainsElement);
        this.player.renderTerrains();
    },

    renderPlayers: function () {
        console.log("Renderizando lista jugadores");

        removeAllChildNodes(document.getElementById("player-list"));
        this.player.render();
        console.log(this.players);
        for (let key in this.players) {
            console.log("Renderizando: " + this.players[key].name);
            this.players[key].render();
        }

        gameManager.updateLocalPlayerResume();
    },

    addBlockchainLog: function(log){
        let index = gameManager.blockchainLogs.length;
        gameManager.blockchainLogs[gameManager.blockchainLogs.length] = log;
        gameManager.renderBlockchainLog(index, log.event);
    },

    renderBlockchainLog: function (index,logType) {
    
        var logElement = document.createElement("div");
        logElement.className = "log-element log-element-new";
        logElement.id = `log-element-${index}`;
        var spanElement = document.createElement("span");
        spanElement.className = "badge";
        spanElement.id = `spam-log-badge-${index}`;
        spanElement.textContent = " Nuevo"
   

        if(logType === GAME_CONSTANTS.EVENT_NEW_BLOCK_LOG){
            logElement.textContent = "Bloque";
        }else{
            logElement.textContent = "Transacción";
        }
        logElement.appendChild(spanElement);
        logElement.onclick = () => {
            logElement.classList.remove("log-element-new");
            if (spanElement) {
                spanElement.parentNode.removeChild(spanElement);
                spanElement = null;
            }

            this.modalRenderBlockChainLog(index);
        }

        var firstLog = gameManager.blockchainLogContainer.firstChild;
        if (firstLog) {
            gameManager.blockchainLogContainer.insertBefore(logElement, firstLog);
        } else {
            gameManager.blockchainLogContainer.appendChild(logElement);
        }
    },

    removeOffertsByOwner: function (ownerKey) {
        this.playersOfferts.forEach((offert) => offert.remove());
        this.playersOfferts = this.playersOfferts.filter((offert) => offert.owner != ownerKey);
    },

    modalRenderNegociationMenu: function () {
        
        removeAllChildNodes(gameManager.modalNegociationElements.playerItems);
        removeAllChildNodes(gameManager.modalNegociationElements.offertList);
        gameManager.modalNegociationElements.endTurnBtn.disabled = false;
        gameManager.modalNegociationElements.endTurnBtn.textContent = "Finalizar turno";

        var smallInfo = "";
        var productDescription = "";
        var productTitle = "";
        for (let product of this.player.products) {
            if(product) {
                if (product.status !== GAME_CONSTANTS.PRODUCT_STATUS_PLANTED){
                    if (product.status == GAME_CONSTANTS.PRODUCT_STATUS_SEED) {
                        smallInfo = "semilla";
                        productDescription = "Semillas plantables"
                        productTitle = "Semillas de " + product.label;
                    } else{
                        smallInfo = "Producto";
                        productDescription = "Producto vendible, intercambiable o del que se puede extraer semillas"
                        productTitle = product.label;
                    }
                    gameManager.modalNegociationElements.playerItems.appendChild(
                        gameManager.createNegotiationOptionElement(productTitle, smallInfo, productDescription, product, gameManager.sendNewOffert)
                    );
                }
            }
        }

        for (var tool of this.player.tools) {
            smallInfo = "Herramienta";
            productTitle = tool.label;
            gameManager.modalNegociationElements.playerItems.appendChild(
                gameManager.createNegotiationOptionElement(productTitle, smallInfo, productDescription, tool, gameManager.sendNewOffert)
            );
        }

        for (var terrain of this.player.terrains) {
            productDescription = "Terreno cultivable";
            smallInfo = ""
            productTitle = "Terreno " + terrain.index;
            gameManager.modalNegociationElements.playerItems.appendChild(
                gameManager.createNegotiationOptionElement(productTitle, smallInfo, productDescription, terrain, gameManager.sendNewOffert)
            );
        }

        gameManager.modalNegociationElements.parent.style.display = "block";
        this.playersOfferts.forEach((offert) => offert.render());
    },


    createNegotiationOptionElement: function (itemTitle, smallInfo, description, item, onBtnClick) {
        console.log("Create negotiation --->>" + JSON.stringify(item))
        var elementContainer = document.createElement("div");
        elementContainer.className = `list-group-item-${item.type}-${item.index}`;
        elementContainer.id = `group-item-${item.type}-${item.index}`;

        var flexTitle = document.createElement("div");
        flexTitle.className = "d-flex w-100 justify-content-between";
        var h5 = document.createElement("h5");
        h5.className = "mb-1";
        h5.textContent = itemTitle;
        var smallInfoElement = document.createElement("small");
        smallInfoElement.textContent = smallInfo;
        flexTitle.appendChild(h5);
        flexTitle.appendChild(smallInfoElement);

        var flexContent = document.createElement("div");
        flexContent.className = "d-flex w-100 justify-content-between";

        var divDescription = document.createElement("div");
        divDescription.className = "w-75";
        divDescription.textContent = description;

        var inputGroup = document.createElement("div");
        inputGroup.className = "input-group";
        var inputBox = document.createElement("input");
        inputBox.type = "text";
        inputBox.className = "form-control form-control-sm";
        inputBox.placeholder = "Precio";
        inputBox.id = `input-${item.type}-${item.index}`;
        var inputText = document.createElement("spam");
        inputText.className = "input-group-text";
        inputText.textContent = "€";
        var inputBtn = document.createElement("button");
        inputBtn.id = `btn-offert-create-${item.type}-${item.index}`
        inputBtn.className = "btn btn-outline-secondary";
        inputBtn.type = "button";
        inputBtn.textContent = "Crear oferta";
        inputBtn.onclick = () => {
            inputBtn.disabled = true;
            onBtnClick(item, inputBox.value)
        };

        inputGroup.appendChild(inputBox);
        inputGroup.appendChild(inputText);
        inputGroup.appendChild(inputBtn);

        flexContent.appendChild(divDescription);
        flexContent.appendChild(inputGroup);


        elementContainer.appendChild(flexTitle);
        elementContainer.appendChild(flexContent);
        return elementContainer;
    },

    modalRenderBlockChainLog: function (index) {
        var logType = gameManager.blockchainLogs[index].event;
        var logData = gameManager.blockchainLogs[index].data;
        if(logType === GAME_CONSTANTS.EVENT_NEW_BLOCK_LOG){
            $("#modal-content").load("wigets/modals/m-block.html", function () {

                document.getElementById("block-index").textContent = logData.index;
                document.getElementById("block-timestamp").textContent = logData.timestamp;
                document.getElementById("block-hash").textContent = logData.hash;
                document.getElementById("block-previous-hash").textContent = logData.previousHash;
                gameManager.openModal();
            });
        }else{
            $("#modal-content").load("wigets/modals/m-transaction.html", function () {

                document.getElementById("transaction-publickey").textContent = logData.sender;
                document.getElementById("transaction-timestamp").textContent = logData.timestamp;
                document.getElementById("transaction-signature").textContent = logData.signature;
                document.getElementById("data-text-area").textContent = logData.data;
                gameManager.openModal();
            });
        }
    },

    modalRenderMarket: function () {
        $("#modal-content").load("wigets/modals/m-market.html", function () {
            var marketElementContainer = document.getElementById("element-container");
            removeAllChildNodes(marketElementContainer);
            for (let i = 0; i < gameManager.market.length; i++) {
                if(!gameManager.market[i].wasBuy){
                    gameManager.market[i].select = false;
                    var offert = gameManager.market[i];
                    var description = "";
                    if (offert.item.type === "TERRAIN") {
                        description = `Parcela numero ${offert.item.index} donde cultivar`;
                    } else if (offert.item.type === "TOOL") {
                        description = `Le permitira mejorar su desempeño en la granja`;
                    } else {
                        description = `Se puede plantar en una parcela`
                    }

                    var liContainer = document.createElement("li");
                    liContainer.className = "list-group-item d-flex justify-content-between align-items-start list-group-item-action";
                    liContainer.id = `offert-${i}`;
                    var container = document.createElement("div");
                    container.className = "ms-2 me-auto";

                    var header = document.createElement("div");
                    header.className = "fw-bold";
                    header.textContent = offert.item.label ?? "Terreno";
                    var spamDescription = document.createElement("spam");
                    spamDescription.textContent = description;
                    container.appendChild(header);
                    container.appendChild(spamDescription);

                    var priceSpan = document.createElement("span");
                    priceSpan.className = "badge bg-success rounded-pill";
                    priceSpan.textContent = `${offert.price}€`;

                    liContainer.appendChild(container);
                    liContainer.appendChild(priceSpan);
                    liContainer.addEventListener("click", () => {
                        gameManager.selectMarketItem(i)
                    });

                    marketElementContainer.appendChild(liContainer);
                }
            }


            document.getElementById("current-money").textContent = `${gameManager.player.money}`

            gameManager.openModal();
        });
    },

    selectMarketItem: function (index) {

        if (gameManager.market[index].select) {
            document.getElementById(`offert-${index}`).classList.remove("market-selected");
            gameManager.market[index].select = false;
        } else {
            document.getElementById(`offert-${index}`).classList.add("market-selected");
            gameManager.market[index].select = true;
        }

        var totalPrice = 0;
        var canBuy = false;
        for (let offert of gameManager.market) {
            if (offert.select) {
                totalPrice = totalPrice + offert.price;
                canBuy = true;
            }
        }

        document.getElementById("selection-cost").textContent = `${totalPrice}€`

        if (totalPrice > gameManager.player.money) {
            document.getElementById("btn-buy").disabled = true;
            document.getElementById("market-alert").classList.remove("nodisplay");
        } else {
            document.getElementById("btn-buy").disabled = !canBuy;
            document.getElementById("market-alert").classList.add("nodisplay");
        }
    },

    showNotification: function (title, type, msg) {
        console.log("Notificación "+title + "\n\t"+msg)
        gameManager.polipop.add({
            content: msg,
            title: title,
            type: type,
            progressbar: true,
        });
    },

    openModal: function () {
        gameManager.modalElement.style.display = "block";
    },

    closeModal: function () {
        gameManager.modalElement.style.display = "none";
    }
}