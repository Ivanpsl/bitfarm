class UIPlayer {
    constructor(playerData) {
        this.id = playerData.id;
        this.name = playerData.name;
        this.account = playerData.account; 
        this.money = playerData.money;
        this.max_storage = playerData.max_storage;

        this.terrains = [];

        this.tools = [];
        this.products = [];
        this.modifiers = [];
        this.buildings = [];

        this.playerWaiting =false ;
        this.UIPlayerElement = null;
    }

    getMaxStorage(){
        return this.max_storage;
    }
    
    getSeeds(){
        var seeds = [];
        for(let product of this.products){
            if(product.status === GAME_CONSTANTS.PRODUCT_STATUS_SEED){
                seeds.push(product);
            }
        }
        return seeds;
    }

    getElementByTypeAndIndex(type,index){
        if(type === GAME_CONSTANS.TYPE_TERRAIN) return this.terrains.find((terrain)=> terrain.index == index);
        else if(type === GAME_CONSTANS.TYPE_TOOL) return this.tools.find((tool)=> tool.index == index);
        else if(type === GAME_CONSTANS.TYPE_PRODUCT) return this.products.find((product)=> product.index == index);
        else if(type === GAME_CONSTANS.TYPE_BUILDING) return this.buildings.find((building)=> building.index == index);
    }

    getNumProducts(){
        return this.products.length;
    }

    addProduct(productData){
        this.products.push(productData);
    }

    addTerrain(terrainData){
        this.terrains.push(new UITerrain(terrainData));
    }

    removeMoney(amount){
        this.money = this.money - amount;
        this.updateLocalResume();
    }



    resetLists(){
        this.terrains = [];
        this.tools = [];
        this.products = [];
        this.modifiers = [];
    }
    
    setPlayerWaiting(status){
        this.playerWaiting = status;
    }

    openPlayerModal(){
        var playerData = this;
        $("#modal-content").load("wigets/modals/m-account.html", function () {
            document.getElementById("modal-title").textContent = "Cuenta de "+playerData.name;
            document.getElementById("public-text-area").textContent = playerData.account.publicKey;
            document.getElementById("private-text-area").textContent = playerData.account.privateKey;

            gameManager.openModal();
        });
    }

    openInventoryModal(){
        gameManager.showNotification('Error','error','No tienes ninguna herramienta.');
    }

    openStorageModal(){
        gameManager.showNotification('Error','error','No tienes ninguna herramienta.');
    }

    updatePlayerResume(){
        if(this.UIPlayerElement == null){
            this.render();
        }else{

            this.UIPlayerElement.cash.textContent  = ` ${this.money}$`;
            this.UIPlayerElement.storage.textContent  =` ${this.products.length}/${this.getMaxStorage()}`
            this.UIPlayerElement.terrain.textContent  =` ${this.terrains.length}`
        }
    }

    sendReadyToEndTurn(){
        $.ajax({
            url: URL_BASE + "/game/player/endTurn",
            type: "GET",
            data: {},
            dataType: 'json',
            success: function (response, textStatus, jqXHR) {
                gameManager.showNotification('Turno finalizado','success','Se ha finalizado el turno, esperando por el resto de jugadores');
                this.setPlayerWaiting(true);
            },
            error: function (response, status, error) {
                gameManager.showNotification('Ha ocurrido un error','error',response.responseText);
            }
        });
    }



    updateLocalResume(){
        gameManager.toolsElement.textContent  = `${this.tools.length}`;
        gameManager.storageElement.textContent  =`${this.products.length}/${this.max_storage}`;
        gameManager.moneyElement.textContent  =  `${this.money}€`;
        this.updatePlayerResume();
        
    }


    render(){
        this.UIPlayerElement = {};
        
        var drawer = document.createElement("div");
        drawer.className="player-drawer";
        var img = document.createElement("img");
        img.className = "profile-image";
        img.src = "https://avatars.dicebear.com/api/human/" + this.name + ".svg" ;
        img.alt = "Profile pic";
        drawer.appendChild(img);

        var playerTextContainer = document.createElement("div");
        playerTextContainer.className="player-text";
        var playerNameContainer = document.createElement("h6");
        playerNameContainer.innerHTML = this.name
        playerTextContainer.appendChild(playerNameContainer);

        var playerResumeContainer = document.createElement("div");
        playerResumeContainer.className="row pb-0 px-1 player-resumen shadow-sm text-muted"
        var cashContainer = document.createElement("div");
        cashContainer.className="cash col";
        var cashSpan = document.createElement("span");
        cashSpan.className="bi bi-cash-stack";
        cashSpan.id = `cash-${this.id}`;
        cashContainer.appendChild(cashSpan);
        playerResumeContainer.appendChild(cashContainer);

        var terrainsContainer = document.createElement("div");
        terrainsContainer.className="terrain col";
        var terrainSpan = document.createElement("span");
        terrainSpan.className="bi bi-layers-half";
        terrainSpan.id = `terrain-${this.id}`;
        terrainsContainer.appendChild(terrainSpan);
        playerResumeContainer.appendChild(terrainsContainer);

        var storageContainer = document.createElement("div");
        storageContainer.className="store col";
        var storageSpan = document.createElement("span");
        storageSpan.className="bi bi-box-seam";
        storageSpan.id = `storage-${this.id}`;


        storageContainer.appendChild(storageSpan);
        playerResumeContainer.appendChild(storageContainer);

        playerTextContainer.appendChild(playerResumeContainer);
        
        var separator = document.createElement("hr");
        separator.className = "separator";
        playerTextContainer.appendChild(separator);

        drawer.appendChild(playerTextContainer);

        drawer.onclick = ()=>  {
            this.openPlayerModal();
        }

        this.UIPlayerElement.container = drawer;
        this.UIPlayerElement.cash = cashSpan;
        this.UIPlayerElement.storage = storageSpan;
        this.UIPlayerElement.terrain = terrainSpan;

        document.getElementById('players-resume-list').appendChild(drawer);
    }
    
    renderTerrains(){
        this.terrains.forEach(terrain => terrain.render());
    }
}
