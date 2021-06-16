class UIPlayerOffert {
    constructor(index, price,element,ownerKey, isPlayerOwner){
        this.index = index;
        this.owner = ownerKey;
        this.element = element;
        this.price = price;
        this.isPlayerOwner = isPlayerOwner;
        this.onCreat();
    }


    // <div class="list-group-item" id="group-item-type-terrain" aria-current="true">
    //                             <div class="d-flex w-100 justify-content-between">
    //                                 <h5 class="mb-1">Item</h5>
    //                                 <small class="text-muted">3 days ago</small>
    //                             </div>
    //                             <div class="d-flex w-100 justify-content-between">
    //                                 <div class="w-75">Objeto plantable</div>
    //                                 <div class="input-group">
    //                                     <input type="text" class="form-control form-control-sm" placeholder="Precio"
    //                                         aria-label="Precio en euros">
    //                                     <span class="input-group-text">€</span>
    //                                     <button id="btn-offert-create-type-index" class="btn btn-outline-secondary" type="button">Crear oferta</button>
    //                                 </div>

    //                             </div>
    //                         </div>
//     <div class="list-group-item" aria-current="true">
//     <div class="d-flex w-100 justify-content-between">
//         <h5 class="mb-1">Oferta de </h5>
//         <button type="button" id="buy" class="btn btn-outline-success">Comprar
//             oferta</button>
//     </div>
//     <p class="mb-1">Semillas de babuino.</p>
// </div>

    onCreate(){
        // var logElement =  document.createElement("div");
        // logElement.className = "log-element log-element-new";
        // logElement.id = `log-element-${index}`;
        // logElement.textContent = text;
        // var spanElement = document.createElement("span");
        if(this.isPlayerOwner){
            var itemListElement = document.getElementById(`group-item-${this.element.type}-${this.element.element.index}`);
            var itemCreateOffertBtn = document.getElementById(`btn-offert-create-${this.element.type}-${this.element.element.index}`);
            if(itemListElement && itemCreateOffertBtn){
                itemListElement.disabled = true;
                itemListElement.classList.add('list-group-item-secondary')
                itemCreateOffertBtn.disabled= true;
            }
        }
        this.render();
        
    }

    render(){
        gameManager.modalNegociationElements.offertList
        
    }

    removeOffert(){
        if(this.isPlayerOwner){
            var itemListElement = document.getElementById(`group-item-${this.element.type}-${this.element.element.index}`);
            var itemCreateOffertBtn = document.getElementById(`btn-offert-create-${this.element.type}-${this.element.element.index}`);
            if(itemListElement && itemCreateOffertBtn){
                itemListElement.disabled = false;
                itemListElement.classList.remove('list-group-item-secondary')
                itemCreateOffertBtn.disabled= false;
            }
        }
    }


}