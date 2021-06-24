class UITerrain {
    constructor(terrainData){
        this.index = terrainData.index;
        this.label = terrainData.label;
        this.name = terrainData.name;
        this.owner = terrainData.owner;
        this.status = terrainData.status;
        this.type = terrainData.type;
        this.terrainContent = null;
        this.soilExhaustion = {};


        this.UIElement = null;
    }
    // plant(selection,action){
    //     gameManager.executeAction(action.name,action.time_cost,actionData);
    // }

    setContent(contentData){
        this.terrainContent = contentData;
        if(this.UIElement && gameManager.player.account.publicKey === this.owner)
            this.updateTerrainData();
    }

    updateTerrainData() {
        this.updateContainerInfo();
        this.updateOptions();
    }

    render(){
        this.UIElement = {};
        var containerElement = document.createElement("div");
        containerElement.className = "row terrain-container relieve";
        containerElement.id = `terrain-container-${this.index}`;
        var nameElement = document.createElement("div");
        nameElement.className = "col terrain-name";
        var h5 = document.createElement("h5");
        h5.className = "bi bi-layers";
        h5.textContent = `Terreno ${this.index}`;
        nameElement.appendChild(h5);

        containerElement.appendChild(nameElement);
        var separator = document.createElement("hr");
        separator.class="p-0 m-0";
        containerElement.appendChild(separator);


        var infoElement = document.createElement("div");
        infoElement.className = "terrain-info";

        var infoTextContainer = document.createElement("div");
        infoTextContainer.className = "terrain-info-text row";


        /// Informacion del producto
        var contentCol1 = document.createElement("div");
        contentCol1.className = "col text-center";
        var contentTitle = document.createElement("div");
        contentTitle.className = "title bi bi-pin-map-fill";
        contentTitle.textContent = "Contenido"
        
        var contentSeparator = document.createElement("hr");
        contentSeparator.className = "p-0 m-0";
        contentCol1.appendChild(contentTitle);
        contentCol1.appendChild(contentSeparator);

        var contentDataContainer1 = document.createElement("div");


        var pItem = document.createElement("p");
        pItem.className = "terrain-info-data";

        var productNameText = document.createElement("spam"); 
        productNameText.className = "terrain-info-data";
        var varSpamSeparator = document.createElement("spam"); 
        varSpamSeparator.textContent = "-"
        var productPlantSizeText = document.createElement("spam");
        productPlantSizeText.className = "bi bi-align-top";
        pItem.appendChild(productNameText);
        pItem.appendChild(varSpamSeparator);
        pItem.appendChild(productPlantSizeText);


        var pWatter = document.createElement("p");
        pWatter.className = "terrain-info-data";
        var terrainWatterText = document.createElement("spam");
        terrainWatterText.className = "bi bi-droplet watter";
        pWatter.appendChild(terrainWatterText);

        contentDataContainer1.appendChild(pItem);
        contentDataContainer1.appendChild(pWatter);
        contentCol1.appendChild(contentDataContainer1);

     /// Informacion del desgaste del terreno
        var contentCol2 = document.createElement("div");
        contentCol2.className = "col text-center";
        var contentTerrainStatusTitle = document.createElement("div");
        contentTerrainStatusTitle.className = "title bi bi-tropical-storm";
        contentTerrainStatusTitle.textContent = "Desgaste"
        
        var contentStatusSeparator = document.createElement("hr");
        contentStatusSeparator.className = "p-0 m-0";
        contentCol2.appendChild(contentTerrainStatusTitle);
        contentCol2.appendChild(contentStatusSeparator);

        var contentStatusContainer = document.createElement("div");
        var pStatusText = document.createElement("p");
        pStatusText.className = "terrain-info-data";
        pStatusText.textContent ="-";
        contentStatusContainer.appendChild(pStatusText);
        contentCol2.appendChild(contentStatusContainer);

        infoTextContainer.appendChild(contentCol1);
        infoTextContainer.appendChild(contentCol2);

        infoElement.appendChild(infoTextContainer);
        containerElement.appendChild(infoElement);

        var actionsContainerElement = document.createElement("div");
        actionsContainerElement.className = "terrain-actions d-flex flex-row-reverse";
        actionsContainerElement.id = `terrain-actions-${this.index}`;


        console.log("Renderizando acciones: "+gameManager.gameConfig.terrainActions);

        containerElement.appendChild(actionsContainerElement);

        this.UIElement.actionsContainer = actionsContainerElement;
        this.UIElement.productNameText = productNameText;
        this.UIElement.productSizeText = productPlantSizeText;
        this.UIElement.productWatterText = terrainWatterText
        this.UIElement.productSeparator = varSpamSeparator;
        this.UIElement.terrainStatusText = pStatusText

        this.updateTerrainData();

        gameManager.terrainsElement.appendChild(containerElement);
    }

    updateOptions(){
        removeAllChildNodes(this.UIElement.actionsContainer);
        console.log("Imprimiendo acciones para: "+this.status)
        if(this.status === GAME_CONSTANTS.TERRAIN_STATUS_EMPTY){
            for(let action of gameManager.gameConfig.terrainActions){
                let actionElement = document.createElement("div");
                actionElement.type ="button";
                actionElement.className = "btn btn-terrain-action";
                actionElement.textContent = action.label;
                let actionData = {type : "TERRAIN", index: this.index};
                actionElement.onclick = ()=> this.onClickAction(action,actionData);
                this.UIElement.actionsContainer.appendChild(actionElement);
            }
        }else if(this.status === GAME_CONSTANTS.TERRAIN_STATUS_BUILDED){
                for(let action of gameManager.gameConfig.buildings.buildingsDefaultActions){
                    let actionElement = document.createElement("div");
                    actionElement.type ="button";
                    actionElement.className = "btn btn-terrain-action";
                    actionElement.textContent = action.label;
                    let actionData = {type : "TERRAIN", terrainIndex: this.index};
                    actionElement.onclick = ()=> this.onClickAction(action,actionData);
                    this.UIElement.actionsContainer.appendChild(actionElement);
                }

        }else if(this.status === GAME_CONSTANTS.TERRAIN_STATUS_PLANTED){
            for(let action of gameManager.gameConfig.products.productsDefaultActions){
                let actionElement = document.createElement("div");
                actionElement.type ="button";
                actionElement.className = "btn btn-terrain-action";
                actionElement.textContent = action.label;
                let actionData = {type : "TERRAIN", terrainIndex: this.index};
                actionElement.onclick = ()=> this.onClickAction(action,actionData);
                this.UIElement.actionsContainer.appendChild(actionElement);
            }
        }   
    }

    updateContainerInfo(){
        console.log("Actualizando contenido del terreno: "+ JSON.stringify(this.terrainContent)+  " "+this.status)
        if(this.status === GAME_CONSTANTS.TERRAIN_STATUS_EMPTY || this.terrainContent ===null){
            this.UIElement.productNameText.textContent =" Vacio"
            this.UIElement.productNameText.className = "bi bi-border";
            this.UIElement.productSizeText.textContent ="";
            this.UIElement.productSizeText.className = "";
            this.UIElement.productSeparator.textContent = "";
            this.UIElement.productWatterText.textContent ="-";
        }else if(this.status === GAME_CONSTANTS.TERRAIN_STATUS_BUILDED){
            this.UIElement.productNameText.textContent = ` ${this.terrainContent.label}`
            this.UIElement.productNameText.className = "bi bi-shop";

            this.UIElement.productSizeText.textContent ="";
            this.UIElement.productSizeText.className = "";
            this.UIElement.productSeparator.textContent = "";
            this.UIElement.productWatterText.textContent ="-";
        }else if(this.status === GAME_CONSTANTS.TERRAIN_STATUS_PLANTED){

            this.UIElement.productNameText.textContent = ` ${this.terrainContent.label}`
            this.UIElement.productNameText.className = "bi bi-tree";

            var finalGrowPrecent = this.terrainContent.growPrecent;
            var icon = ""
            if(finalGrowPrecent >= 100){
                finalGrowPrecent = 100;
                icon= "bi bi-reception-4"
            }else if(finalGrowPrecent >= 75) icon= "bi bi-reception-3";
            else if(finalGrowPrecent >= 50) icon= "bi bi-reception-2";
            else if(finalGrowPrecent >= 25) icon= "bi bi-reception-1";
            else icon= "bi bi-reception-0";

            
            this.UIElement.productSizeText.textContent =` ${finalGrowPrecent}%`;
            this.UIElement.productSizeText.className = icon;
            this.UIElement.productSeparator.textContent = " - ";
            this.UIElement.productWatterText.textContent =`${this.terrainContent.watter}`;
            
        }
        var exhaustionText = ""
        for(let key in this.soilExhaustion){
            exhaustionText += `${key}(${this.soilExhaustion[key].value}) `
        }
        this.UIElement.terrainStatusText.textContent =exhaustionText;
    }

    openModalPlant(action,uiTerrain, onExecute){
        $("#modal-content").load("wigets/modals/m-plant.html", function () {
            var itemList = document.getElementById("inputGroupSelect01");
            var terrainIndexText = document.getElementById("plant-terrain-id");
            terrainIndexText.textContent = uiTerrain.index;
            var timeContainer = document.getElementById("time")

            timeContainer.textContent =`(${action.time_cost/1000}s.)`;

            removeAllChildNodes(itemList);
            var seeds = gameManager.player.getSeeds();
            if(seeds.length > 0){
                for(var seed of seeds){
                    let actionElement = document.createElement("option");
                    actionElement.textContent = seed.label;
                    actionElement.value=seed.index;
                    itemList.appendChild(actionElement);
                }

            $('#accept').click(function(){
                var selectedItem = $('.form-select').val();
                var actionData = {terrainIndex: uiTerrain.index, productIndex : selectedItem};
                gameManager.sendAction(action.name,action.time_cost,actionData, (response)=> {onExecute(response,action,actionData,uiTerrain)});
            });

            gameManager.openModal();

            }else{
                gameManager.showNotification('Error','error','No tienes semillas para plantar')
            }
        });
    }
    
    openModalBuild(action, uiTerrain,onExecute){
        $("#modal-content").load("wigets/modals/m-build.html", function () {
            var itemList = document.getElementById("inputGroupSelect01");
            var terrainIndexText = document.getElementById("plant-terrain-id");
            terrainIndexText.textContent = uiTerrain.index;
            var timeContainer = document.getElementById("time")
    
            timeContainer.textContent =`(${action.time_cost/1000}s.)`;
            removeAllChildNodes(itemList);

            for(var key in gameManager.gameConfig.buildings.buildingsList){
                let buildElement = document.createElement("option");
                buildElement.textContent = `${gameManager.gameConfig.buildings.buildingsList[key].label} (${gameManager.gameConfig.buildings.buildingsList[key].money_cost}€)`;
                buildElement.value=key;
                itemList.appendChild(buildElement);
            }
            
            $('#accept').click(()=>{
                var selectedItem = $('.form-select').val();
                var price = gameManager.gameConfig.buildings.buildingsList[selectedItem].money_cost;
                var actionData = {terrainIndex: uiTerrain.index, buildingId : selectedItem, buildCost : price};
                gameManager.sendAction(action.name,action.time_cost,actionData, (response)=> {onExecute(response,action,actionData,uiTerrain)});
            });

            gameManager.openModal();
        });
    }

    onExecuteAction(response,action,actionData,uiTerrain){
        // gameManager.player.removeMoney(actionData.buildCost);
     //   uiTerrain.updateContainerInfo();
    }

    onClickAction(action, actionData){
        if( action.name === GAME_CONSTANTS.ACTION_TERRAIN_PLANT ){
            if(gameManager.player.getNumProducts() > 0) {
                this.openModalPlant(action,this,this.onExecuteAction);
            }else{
                gameManager.showNotification('Error','error','No hay productos para plantar')
            }
        }else if( action.name === GAME_CONSTANTS.ACTION_TERRAIN_BUILD ){
            this.openModalBuild(action,this,this.onExecuteAction);
        }
        else {
            gameManager.sendAction(action.name,action.time_cost,actionData);
        }
    }
}