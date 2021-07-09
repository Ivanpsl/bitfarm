/*global  GAME_CONSTANTS,$,document,gameManager,UITerrain,URL_BASE,removeAllChildNodes */
// eslint-disable-next-line no-unused-vars
class UIPlayer {
    constructor(playerData, isLocalPlayer = false) {
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
        this.lost = false;

        this.isLocalPlayer = isLocalPlayer;
        this.playerWaiting =false ;
        this.UIPlayerElement = null;
    }

    getMaxStorage(){
        return this.max_storage;
    }
    getActualOcupation(){
        return this.products.filter((product) => product != undefined && product.status != GAME_CONSTANTS.TERRAIN_STATUS_PLANTED).length; 
    }
    getActualStorage(){
        return this.getMaxStorage() - this.getActualOcupation();
    }

    
    getSeeds(){
        var seeds = [];
        for(let product of this.products){
            if(product && product.status === GAME_CONSTANTS.PRODUCT_STATUS_SEED){
                seeds.push(product);
            }
        }
        return seeds;
    }

    getElementByTypeAndIndex(type,index){
        var result = null;
        if(type === GAME_CONSTANTS.TYPE_TERRAIN) {
            result = this.terrains.find((terrain)=> terrain.index == index);
        }
        else if(type === GAME_CONSTANTS.TYPE_TOOL) {
            result = this.tools.find((tool)=> tool.index == index);
        }
        else if(type === GAME_CONSTANTS.TYPE_PRODUCT) {
            result = this.products.find((product)=> product.index == index);
        }
        else if(type === GAME_CONSTANTS.TYPE_BUILDING) {
            result = this.buildings.find((building)=> building.index == index);
        }
        
        if(result == null) {
            console.error(`${type} No encontrado con indice ${index} para el jugador ${this.name}`)
            var list = null;
            if(type === GAME_CONSTANTS.TYPE_TERRAIN ) list = this.terrains;
            else if(type === GAME_CONSTANTS.TYPE_TOOL) list = this.tools;
            else if(type === GAME_CONSTANTS.TYPE_PRODUCT) list = this.products;
            else if(type === GAME_CONSTANTS.TYPE_BUILDING) list = this.buildings;

            console.error(JSON.stringify(list));
        }
        
        return result;
    }

    removeElemenyByTypeAndIndex(type,index){
        if(type === GAME_CONSTANTS.TYPE_TERRAIN) {
            this.terrains = this.terrains.filter((terrain)=> terrain.index != index);
        }
        else if(type === GAME_CONSTANTS.TYPE_TOOL) {
            this.tools = this.tools.filter((tool)=> tool.index != index);
        }
        else if(type === GAME_CONSTANTS.TYPE_PRODUCT) {
            this.products = this.products.filter((product)=> product != undefined && product.index != index);
        }
        else if(type === GAME_CONSTANTS.TYPE_BUILDING) {
            this.buildings = this.buildings.filter((building)=> building.index != index);
        }
        
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
    
    addTool(toolData){
        this.tools.push(toolData);
    }

    removeMoney(amount){
        this.money = this.money - amount;
        if(this.isLocalPlayer)
            this.updateLocalResume();
        else
            this.updatePlayerResume();
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
        $("#modal-content").load("wigets/modals/m-storage.html", ()=>  {
            var listElement = document.getElementById("product-list");
     
            if(listElement){
                document.getElementById("max-storage").textContent = this.getMaxStorage();
                document.getElementById("actual-storage").textContent = this.getActualOcupation();
                document.getElementById("storage").textContent = this.getActualStorage();

                removeAllChildNodes(listElement)
                this.products.forEach((product) => {
                    if(product.status != GAME_CONSTANTS.PRODUCT_STATUS_PLANTED){
                        let a = document.createElement("a");
                        a.className = "list-group-item list-group-item-action";
                        let flexContent = document.createElement("div");
                        flexContent.className = "d-flex w-100 justify-content-between";
                        let h5 = document.createElement("div");
                        h5.className = "mb-1";
                        h5.textContent = product.label;
                        let small = document.createElement("small");
                        small.className = "text-muted";
                        if(product.status == GAME_CONSTANTS.PRODUCT_STATUS_SEED)
                            small.textContent = "Semilla"
                        else small.textContent = "Producto"
                        
                        let description = document.createElement("div");
                        description.innerHTML = `<p class="mb-1">Producto vendible</p>`
                        
                        flexContent.appendChild(h5);
                        flexContent.appendChild(small);
                        a.appendChild(flexContent);
                        a.appendChild(description);
                        listElement.appendChild(a);
                    }
                });

                gameManager.openModal();
            }
        });
      
    }

    updatePlayerResume(){
        if(this.UIPlayerElement == null){
            this.render();
        }
        // }else{

            this.UIPlayerElement.cash.textContent  = ` ${this.money}$`;
            this.UIPlayerElement.storage.textContent  =` ${this.getActualOcupation()}/${this.getMaxStorage()}`
            this.UIPlayerElement.terrain.textContent  =` ${this.terrains.length}`
            if(this.money <= 0){
                this.UIPlayerElement.cash.textContent  = `0$`;
                this.UIPlayerElement.name.innerHTML = this.name + " <code>DERROTADO</code>" 
                this.lost = true;
            }
        // }
    }

    sendReadyToEndTurn(){
        $.ajax({
            url: URL_BASE + "/game/player/endTurn",
            type: "GET",
            data: {},
            dataType: 'json',
            // eslint-disable-next-line no-unused-vars
            success: function (_response, _textStatus, _jqXHR) {
                gameManager.showNotification('Turno finalizado','success','Se ha finalizado el turno, esperando por el resto de jugadores');
                this.setPlayerWaiting(true);
            },
            // eslint-disable-next-line no-unused-vars
            error: function (response, _status, _error) {
                gameManager.showNotification('Ha ocurrido un error','error',response.responseText);
            }
        });
    }

    updateLocalResume(){
        gameManager.toolsElement.textContent  = `${this.tools.length}`;
        gameManager.storageElement.textContent  =`${this.getActualOcupation()}/${this.getMaxStorage()}`;
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
        this.UIPlayerElement.name = playerNameContainer;

        document.getElementById('player-list').appendChild(drawer);
        this.updatePlayerResume();
    }
    
    renderTerrains(){
        this.terrains.forEach(terrain => terrain.render());
    }
}
