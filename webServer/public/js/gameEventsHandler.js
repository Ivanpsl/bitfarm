class GameEventsHandler {
    constructor() {
        this.listening = false;
        this.events = null;
    }

    suscribeToGameEvents() {
        if (!this.listening) {
            this.events = new EventSource('/game/suscribe');
            
            this.events.onmessage = (event)=> {
                const eventObj = JSON.parse(event.data);
                console.log("Nuevo evento: " + eventObj.event);
                console.log(eventObj.data)
                this.handleEvents(eventObj);
            };

            this.listening = true;
        }
    }
    disconect(){
        this.events.close();
    }

    handleEvents(eventObj) {
        console.log("Reciviendo evento: " + eventObj.event + "\n\t---------->" + JSON.stringify(eventObj.data))
        if (eventObj.event === GAME_CONSTANTS.EVENT_NEW_BLOCK_LOG || eventObj.event === GAME_CONSTANTS.EVENT_NEW_TRANSACTION_LOG) {
            this.onNewBlockchainLog(eventObj);
        } else if (eventObj.event === GAME_CONSTANTS.EVENT_START_TURN) {
            this.onStartTurn();
        } else if (eventObj.event === GAME_CONSTANTS.EVENT_PLAYER_END_TURN) {
            this.onPlayerEndTurn(eventObj);
        } else if (eventObj.event === GAME_CONSTANTS.EVENT_PLAYER_ACTION) {
            this.onPlayerAction(eventObj);
        } else if (eventObj.event === GAME_CONSTANTS.EVENT_OFFERT_BUY) {
            this.onOffertBuy(eventObj);
        } else if (eventObj.event === GAME_CONSTANTS.EVENT_OFFERT_CREATE) {
            this.onCreateOffert(eventObj);
        } else if (eventObj.event === GAME_CONSTANTS.EVENT_OFFERT_REMOVE) {
            this.onRemoveOffert(eventObj);
        }
    }

    onStartTurn() {
        gameManager.startTurn();
    }

    onPlayerEndTurn(eventObj) {
        gameManager.removeOffertsByOwner(eventObj.data.publicKey);
        gameManager.playersWaiting++;
        gameManager.modalNegociationElements.waitingNumberSpam.textContent = gameManager.playersWaiting
    }


    onPlayerAction(eventObj) {
        if (eventObj.data.source.publicKey !== gameManager.player.account.publicKey) {
            if (eventObj.data.action === GAME_CONSTANTS.ACTION_ELEMENT_BUY) {
                gameManager.players[eventObje.data.source.publicKey].removeMoney(eventObj.data.actionData.price);
                if (eventObj.data.actionData.targetPublicKey === gameManager.townHall.account.publicKey) {
                    onMarketBuy(eventObj);
                }
            }
        }
    }

    onMarketBuy(eventObj) {
        gameManager.townHall.money = gameManager.townHall.money + eventObj.data.actionData.price;
        gameManager.removeMarketElementByProductIndexAndType(eventObj.data.actionData.elementIndex, eventObj.data.actionData.elementType);

        if (eventObj.data.actionData.elementType === GAME_CONSTANTS.TYPE_PRODUCT) {
            var product = gameManager.townHall.products.find((pr) => pr.index === eventObj.data.actionData.elementIndex);

            gameManager.players[eventObje.data.source.publicKey].addProduct(product)
            gameManager.townHall.products.filter((pr) => pr.index != index);
        } else if (actionData.elementType === GAME_CONSTANTS.TYPE_TERRAIN) {
            var terrain = gameManager.townHall.terrains.find((tr) => tr.index === eventObj.data.actionData.elementIndex);

            gameManager.players[eventObje.data.source.publicKey].addTerrain(terrain)
            gameManager.townHall.terrains.filter((tr) => tr.index != index);
        } else if (actionData.elementType === GAME_CONSTANTS.TYPE_TOOL) {
            var tool = gameManager.townHall.tools.find((tl) => tl.index === eventObj.data.actionData.elementIndex);

            gameManager.players[eventObje.data.source.publicKey].addTool(tool)
            gameManager.townHall.tools.filter((tl) => tl.index != index);
        }
    }


    onRemoveOffert(eventObj) {
        var offertIndex = eventObj.data.offertIndex;
        var uiOffert = gameManager.playersOfferts.find((offert) => offert.index == offertIndex);

        uiOffert.remove();
    }

    onCreateOffert(eventObj) {
        // source : sourceAccount, offertIndex: offertIndex, itemType : itemType, itemIndex : itemIndex, price : price
        console.log("Create offer: " + JSON.stringify(eventObj))
        var offertIndex = eventObj.data.offertIndex;
        var offertOwner = eventObj.data.source.publicKey;
        var offertPrice = eventObj.data.price;
        var offertItemType = eventObj.data.itemType;
        var offertItemIndex = eventObj.data.itemIndex;
        var offertObj = null;

        // if(this.players[offertOwner]){
        var offertElement = null;
        console.log("owner: " + offertOwner)
        if (gameManager.players[offertOwner])
            offertElement = gameManager.players[offertOwner].getElementByTypeAndIndex(offertItemType, offertItemIndex);
        else if (gameManager.player.account.publicKey == offertOwner)
            offertElement = gameManager.player.getElementByTypeAndIndex(offertItemType, offertItemIndex);

        console.log(`${offertItemType}_${offertItemIndex}------------->>>>>> ` + JSON.stringify(offertElement))

        offertObj = new UIPlayerOffert(offertIndex, offertPrice, offertElement, offertOwner, (gameManager.player.account.publicKey == offertOwner));
        gameManager.playersOfferts.push(offertObj);
        // }
    }

    onOffertBuy(eventObj) {
        let buySource = eventObj.data.source;
        let offertIndex = eventObj.data.offertIndex;

        var uiOffert = gameManager.playersOfferts.find((offert) => offert.index == offertIndex);

        if (uiOffert.owner === gameManager.player.account.publicKey) {
            let elementName = uiOffert.element.name ?? `terreno ${uiOffert.element.index}`;
            gameManager.showNotification("Tu oferta ha sido comprada", "success", `Tu oferta de ${elementName} ha sido comprada por ${gameManager.players[buySource].name}`);
        }

        uiOffert.remove();
        gameManager.playersOfferts.filter((offert) => uiOffert.index != offert.index);
    }


    onNewBlockchainLog(eventObj) {
        let text = "";
        let index = gameManager.blockchainLogs.length;
        gameManager.blockchainLogs[gameManager.blockchainLogs.length] = eventObj;
        if (eventObj.event === GAME_CONSTANTS.EVENT_NEW_BLOCK_LOG)
            text = "Bloque";
        else text = "Transacción"

        gameManager.renderBlockchainLog(index, text);
    }

}