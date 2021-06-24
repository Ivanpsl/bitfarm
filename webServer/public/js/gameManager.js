
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


    playersWaiting: 0,
    weekElement: null,
    timeRemainingElement: null,
    toolsElement: null,
    storageElement: null,
    moneyElement: null,
    blockchainLogContainer: null,
    modalContainerElement: null,
    modalElement: null,
    polipop: null,

    modalNegociationElements: {},

    gameEventsHandler: null,

    initGame: function (gameData) {
        this.loadConfig(gameData.gameConfig);

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
        this.players ={};
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
            let owner = product.owner;
            if (owner === this.townHall.account.publicKey) this.townHall.products.push(product);
            else if (owner === this.player.account.publicKey) {
                this.player.addProduct(product);
                if (product.status === GAME_CONSTANTS.PRODUCT_STATUS_PLANTED){
                    console.log(JSON.stringify(product))
                    this.player.terrains.find((terrain) => terrain.index == product.terrainIndex).setContent(product);
                }
            } else if (this.players[owner]) {
                this.players[owner].addProduct(product);
                if (product.status === GAME_CONSTANTS.PRODUCT_STATUS_PLANTED)
                    this.players[owner].terrains.find((terrain) => terrain.index == product.terrainIndex).setContent(product);
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
            if(building!=null) {
                let owner = building.owner;
                if (owner === this.player.account.publicKey)
                    this.player.getElementByTypeAndIndex(GAME_CONSTANTS.TYPE_TERRAIN, building.terrainIndex).setContent(building);
                else if (this.players[owner])
                    this.players[owner].getElementByTypeAndIndex(GAME_CONSTANTS.TYPE_TERRAIN, building.terrainIndex).setContent(addBuilding);
            }
        }
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

    startTurn: function () {
        this.turn++;
        this.milisecondsRemaining = this.maxMilisecondsPerTurn;
        this.turnIsRunning = true;
        if(this.turnInterval== null)
            this.turnInterval = setInterval(() => {
                this.turnTick()
            }, 1000);
        this.updateSecondsRemaining();
        this.weekElement.textContent = this.turn;
        this.closeNegotiationMenu();
    },

    endFase: function () {
        clearInterval(this.turnInterval);
        for (var i = 0; i < this.turnInterval; i++)
	        window.clearInterval(i);

        this.turnInterval= null;
        this.modalRenderNegociationMenu();

        this.turnIsRunning = false;
        this.milisecondsRemaining = 0;
    },

    endTurn: function () {
        console.log("Finalizando turno")
        gameManager.modalNegociationElements.endTurnBtn.disabled = true;
        gameManager.modalNegociationElements.endTurnBtn.textContent = "Esperando por los demas jugadores";
        $.ajax({
            url: URL_BASE + "/game/player/endTurn",
            type: "GET",
            data: {},
            dataType: 'json',
            success: function (response) {
                gameManager.showNotification('Tu turno ha finalizado', 'success', 'Esperando por el resto de jugadores');
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
        for (let i = 0; i < gameManager.market.length; i++) {
            if (gameManager.market[i].item.index === itemIndex && gameManager.market[i].item.type === itemType) {
                gameManager.market.filter((offert) => (offert.index !== gameManager.market[i].index));
                var uiOffert = document.getElementById(`offert-${i}`);
                if (uiOffert != null)
                    uiOffert.parentNode.removeChild(uiOffert);
            }
        }
    },

    openNegotiationMenu: function () {
        gameManager.modalElement.style.display = "block";
    },

    closeNegotiationMenu: function () {
        gameManager.modalElement.style.display = "none";
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
                    () => {
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
                success: function (response, textStatus, jqXHR) {

                    for (let key in gameManager.players) {
                        gameManager.players[key].resetLists();
                    }

                    gameManager.player.resetLists();

                    gameManager.loadTownHall(response.townHall);

                    for (let key in response.players) {
                        if (gameManager.players[key]) {
                            gameManager.players[key].money = response.players[key].money;
                            gameManager.players[key].max_storage = response.players[key].max_storage;
                            gameManager.players[key].modifiers = response.players[key].modifiers;
                        } else if (gameManager.player.account.publicKey === key){
                            gameManager.player.money = response.players[key].money;
                            gameManager.player.max_storage = response.players[key].max_storage;
                            gameManager.player.modifiers = response.players[key].modifiers;
                        }
                    }

                    gameManager.loadTerrains(response.terrains);
                    gameManager.loadProducts(response.products);
                    gameManager.loadBuildings(response.buildings);
                    gameManager.loadTools(response.tools);

                    gameManager.updateAllPlayersResume();
                    gameManager.updateLocalPlayerResume();
                    gameManager.renderTerrains();
                    if(callback)
                        callback(response);
                    gameManager.closeModal();
                },
                error: function (response, status, error) {
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
            success: function (response, textStatus, jqXHR) {
                gameManager.showNotification('Oferta creada', 'success', 'La oferta para ' + item.label + ' ha sido creada');
            },
            error: function (response, status, error) {
                gameManager.showNotification('Ha ocurrido un error', 'error', response.responseText);
            }
        });
    },


    updateAllPlayersResume: function () {
        for (let key in this.players)
            this.players[key].updatePlayerResume();
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

    renderGameWindow: function () {
        $("#gamecontainer").load("wigets/w-game.html", function () {
            gameManager.weekElement = document.getElementById("week-number");
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

            gameManager.modalNegociationElements.parent.style.display = "none";

            removeAllChildNodes(gameManager.blockchainLogContainer);

            gameManager.polipop = new Polipop('mypolipop', {
                layout: 'popups',
                insert: 'before',
                pool: 5,
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

            gameManager.renderPlayers();
            gameManager.renderTerrains();

            gameManager.gameEventsHandler = new GameEventsHandler();
            gameManager.gameEventsHandler.suscribeToGameEvents();

            gameManager.startTurn();
        });
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

    renderBlockchainLog: function (index, text) {
        var logElement = document.createElement("div");
        logElement.className = "log-element log-element-new";
        logElement.id = `log-element-${index}`;
        logElement.textContent = text;
        var spanElement = document.createElement("span");
        spanElement.className = "badge";
        spanElement.id = `spam-log-badge-${index}`;
        spanElement.textContent = " Nueva"
        logElement.appendChild(spanElement);
        logElement.onclick = () => {
            logElement.classList.remove("log-element-new");
            if (spanElement) {
                logElement.removeChild(spanElement);
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
        this.playersOfferts.filter((offert) => offert.owner != ownerKey);
    },

    modalRenderNegociationMenu: function () {
        this.playersOfferts = [];
        removeAllChildNodes(gameManager.modalNegociationElements.playerItems);
        removeAllChildNodes(gameManager.modalNegociationElements.offertList);
        gameManager.modalNegociationElements.endTurnBtn.disabled = false;
        gameManager.modalNegociationElements.endTurnBtn.textContent = "Finalizar turno";

        var smallInfo = "";
        var productDescription = "";
        var productTitle = "";
        for (let product of this.player.products) {
            if (product.status == GAME_CONSTANTS.PRODUCT_STATUS_SEED) {
                smallInfo = "semilla";
                productDescription = "Semillas plantables"
                productTitle = "Semillas de " + product.label;
            } else {
                smallInfo = "Producto";
                productDescription = "Producto vendible, intercambiable o del que se puede extraer semillas"
                productTitle = product.label;
            }
            gameManager.modalNegociationElements.playerItems.appendChild(
                gameManager.createNegotiationOptionElement(productTitle, smallInfo, productDescription, product, gameManager.sendNewOffert)
            );
        
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
        $("#modal-content").load("wigets/modals/m-transaction.html", function () {
            var log = gameManager.blockchainLogs[index].data;
            document.getElementById("transaction-publickey").textContent = log.sender;
            document.getElementById("transaction-timestamp").textContent = log.timestamp;
            document.getElementById("transaction-signature").textContent = log.signature;
            document.getElementById("data-text-area").textContent = log.data;
            gameManager.openModal();
        });
    },

    modalRenderMarket: function () {
        $("#modal-content").load("wigets/modals/m-market.html", function () {
            var marketElementContainer = document.getElementById("element-container");
            removeAllChildNodes(marketElementContainer);
            for (let i = 0; i < gameManager.market.length; i++) {
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