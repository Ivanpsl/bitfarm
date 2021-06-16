class UITerrain {
    constructor(terrainData){
        this.index = terrainData.index;
        this.owner = terrainData.owner;
        this.status = terrainData.status;
        this.contentIdex = terrainData.status;
        this.content = null;
        this.soilExhaustion = {};


        this.UIElement = null;
    }
    plant(selection,action){
        gameManager.executeAction(action.name,action.time_cost,actionData);

    }
    setContent(contentData){
        this.content = contentData;
    }
    render(){
        this.UIElement = {};
        var containerElement = document.createElement("div");
        containerElement.className = "row terrain-container relieve";
        containerElement.id = `terrain-container-${this.index}`;
        var nameElement = document.createElement("div");
        nameElement.className = "col terrain-name";
        var h5 = document.createElement("h5");
        h5.textContent = `Terreno ${this.index}`
        nameElement.appendChild(h5);

        containerElement.appendChild(nameElement);
        containerElement.appendChild(document.createElement("hr"));

        var infoElement = document.createElement("div");
        infoElement.className = "terrain-info position-relative";

        var spamInfo = document.createElement("spam");
        spamInfo.className="terrain-info-text position-absolute translate-middle";
        spamInfo.id = `terrain-info-${this.index}`;
        spamInfo.textContent = " Este terreno no tiene contenido";

        infoElement.appendChild(spamInfo);
        containerElement.appendChild(infoElement);

        var actionsContainerElement = document.createElement("div");
        actionsContainerElement.className = "terrain-actions d-flex flex-row-reverse";
        actionsContainerElement.id = `terrain-actions-${this.index}`;


        console.log("Renderizando acciones: "+gameManager.gameConfig.terrainActions)

        containerElement.appendChild(actionsContainerElement);

        this.UIElement.actionsContainer = actionsContainerElement;
        this.UIElement.terrainSpamInfo = spamInfo

        this.updateOptions();
        this.updateContainerInfo();

        gameManager.terrainsElement.appendChild(containerElement);
    }

    updateOptions(){
        removeAllChildNodes(this.UIElement.actionsContainer);
        if(this.status === GAME_CONSTANS.TERRAIN_STATUS_EMPTY){
            for(let action of gameManager.gameConfig.terrainActions){
                let actionElement = document.createElement("div");
                actionElement.type ="button";
                actionElement.className = "btn btn-terrain-action";
                actionElement.textContent = action.label;
                let actionData = {type : "TERRAIN", index: this.index};
                actionElement.onclick = ()=> this.onClickAction(action,actionData);
                this.UIElement.actionsContainer.appendChild(actionElement);
            }
        }else{
            if(this.status === GAME_CONSTANS.TERRAIN_STATUS_CONSTUCTED){

            }else if(this.status === GAME_CONSTANS.TERRAIN_STATUS_PLANTED){

            }   
        }
    }

    updateContainerInfo(){
        if(this.status === GAME_CONSTANS.TERRAIN_STATUS_EMPTY){
            this.UIElement.terrainSpamInfo.textContent = " Este terreno no tiene contenido";
        }else{
            this.UIElement.terrainSpamInfo.textContent = JSON.stringify(this.content);
        }
    }

    openModalPlant(action){
        $("#modal-content").load("wigets/modals/m-plant.html", function () {
            var itemList = document.getElementById("inputGroupSelect01");
            var terrainIndexText = document.getElementById("plant-terrain-id");
            terrainIndexText.textContent = this.index;
            var timeContainer = document.getElementById("time")

            timeContainer.textContent =`(${action.time_cost/1000}s.)`;

            removeAllChildNodes(itemList);
            var seeds = gameManager.player.getSeeds();
            if(seeds.length > 0){
                for(var seed of seeds){
                    let actionElement = document.createElement("option");
                    actionElement.value=seed.index;
                    itemList.appendChild(actionElement);
                }

            $('#accept').click(function(){
                var selectedItem = $('.form-select').val();
                var actionData = {terrainIndex: this.index, productIndex : selectedItem};
                gameManager.sendAction(action.name,action.time_cost,actionData, (response)=> {this.onExecuteAction(response,action,actionData)});
            });

            gameManager.openModal();

            }else{
                gameManager.showNotification('Error','error','No tienes semillas para plantar')
            }
        });
    }
    
    openModalBuild(action){
        $("#modal-content").load("wigets/modals/m-build.html", function () {
            var itemList = document.getElementById("inputGroupSelect01");
            var terrainIndexText = document.getElementById("plant-terrain-id");
            terrainIndexText.textContent = this.index;
            var timeContainer = document.getElementById("time")

            timeContainer.textContent =`(${action.time_cost/1000}s.)`;
            removeAllChildNodes(itemList);

            for(var key in gameManager.gameConfig.buildings.buildingsList){
                let buildElement = document.createElement("option");
                buildElement.textContent = gameManager.gameConfig.buildings.buildingsList[key].label;
                buildElement.value=key;
                itemList.appendChild(buildElement);
            }
            
            $('#accept').click(function(){
                var selectedItem = $('.form-select').val();
                var price = gameManager.gameConfig.buildings.buildingsList[selectedItem].money_cost;
                var actionData = {terrainIndex: this.index, buildName : selectedItem, buildCost : price};
                gameManager.sendAction(action.name,action.time_cost,actionData, (response)=> {this.onExecuteAction(response,action,actionData)});
            });

            gameManager.openModal();
        });
    }

    onExecuteAction(response,action,actionData){
        gameManager.player.removeMoney(actionData.buildCost);
        this.updateContainerInfo();
    }

    onClickAction(action, actionData){
        if( action.name === GAME_CONSTANS.ACTION_TERRAIN_PLANT ){
            if(gameManager.player.getNumProducts() > 0) {
                this.openModalBuild(action);
            }else{
                gameManager.showNotification('Error','error','No hay productos para plantar')
            }
        }else if( action.name === GAME_CONSTANS.ACTION_TERRAIN_BUILD ){
            this.openModalBuild(action);
        }
        else {
            gameManager.executeAction(action.name,action.time_cost,actionData);
        }
    }
}