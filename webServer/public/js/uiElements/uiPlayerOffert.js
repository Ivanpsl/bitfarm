/*global  $,document,gameManager,URL_BASE */

// eslint-disable-next-line no-unused-vars
class UIPlayerOffert {
    constructor(index, price, element, ownerKey, isPlayerOwner) {
        this.index = index;
        this.owner = ownerKey;
        this.element = element;
        this.price = price;
        this.isPlayerOwner = isPlayerOwner; 
        console.log("ELEMENTO:" + JSON.stringify(this.element));

        this.onCreate();

    }


    onCreate() {
        if (this.isPlayerOwner) {
            var itemListElement = document.getElementById(`group-item-${this.element.type}-${this.element.index}`);
            var itemCreateOffertBtn = document.getElementById(`btn-offert-create-${this.element.type}-${this.element.index}`);
            var itemPriceInput = document.getElementById(`input-${this.element.type}-${this.element.index}`);
            if (itemListElement && itemCreateOffertBtn) {
                itemListElement.disabled = true;
                itemPriceInput.disabled = true;
                itemListElement.classList.add('list-group-item-secondary')
                itemCreateOffertBtn.disabled = true;
            }
        }
        this.render();
    }

    render() {

        var ownerName = "";
        if( gameManager.players[this.owner] ){
            ownerName = gameManager.players[this.owner].name;
        }else{
            ownerName = gameManager.player.name;
        }
        var itemElement = document.createElement("div");
        itemElement.className = `list-group-item`;
        itemElement.id = `group-item-${this.index}`;

        var flexElement = document.createElement("div");
        flexElement.className = "d-flex w-100 justify-content-between";

        var h5 = document.createElement("h5");
        h5.className = "mb-1";
        h5.textContent = `Oferta de ${ownerName}(${this.price}€)`;

        var btn = document.createElement("button");
        btn.type = "button";
        btn.id = "buy";

        var p = document.createElement("p");
        p.className = "mb-1";
        p.textContent = this.element.label;

        if (this.isPlayerOwner) {
            itemElement.classList.add('list-group-item-secondary')
            btn.className = "btn btn-outline-success";
            btn.textContent = "Cancelar oferta";
            btn.onclick = () => {
                this.remove(); 
            }
        } else {
            btn.className = "btn btn-outline-success";
            btn.textContent = `Comprar (${this.price}€)`;
    
            btn.onclick = () => {
                if (gameManager.player.money > this.price) {
                    this.buy();
                } else {
                    gameManager.setNegotiationNotify("No tienes suficiente dinero")
                    gameManager.showNotification('Error', 'error', 'No tienes suficiente dinero.');
                }
            }
        }

        flexElement.appendChild(h5);
        flexElement.appendChild(btn);
        itemElement.appendChild(flexElement);
        itemElement.appendChild(p);

        gameManager.modalNegociationElements.offertList.appendChild(itemElement);
    }

    onRemove() {
        if (this.isPlayerOwner) {

            var itemListElement = document.getElementById(`group-item-${this.element.type}-${this.element.index}`);
            var itemCreateOffertBtn = document.getElementById(`btn-offert-create-${this.element.type}-${this.element.index}`);
            var itemPriceInput = document.getElementById(`input-${this.element.type}-${this.element.index}`);

            itemListElement.disabled = false;
            itemCreateOffertBtn.disabled = false;
            itemPriceInput.disabled = false;
            itemListElement.classList.remove('list-group-item-secondary')
        }

        this.remove();
    }

    onBuy(){

        var itemListElement = document.getElementById(`group-item-${this.element.type}-${this.element.index}`);
        if(itemListElement)
            itemListElement.parentNode.removeChild(itemListElement);
        this.remove();
    }

    remove(){
        var elem = document.getElementById(`group-item-${this.index}`)

        if(elem)
            elem.parentNode.removeChild(elem);
    }

    buy() {
        let elementLabel = this.element.label;
        $.ajax({
            url: URL_BASE + "/game/offert/buy",
            type: "POST",
            data: {
                index: this.index,
                owner: this.owner,
                element: this.element,
                price: this.price,
                source: gameManager.player.account,
            },
            dataType: 'json',
            // eslint-disable-next-line no-unused-vars
            success: function (response, _textStatus, _jqXHR) {
                gameManager.showNotification('Oferta comprada', 'success', `La oferta de ${elementLabel} ha sido comprada`);
                gameManager.refreshAllData(response);
                
                this.onBuy();
            },
            // eslint-disable-next-line no-unused-vars
            error: function (response, _status, _error) {
                console.error(response.responseText);
                gameManager.setNegotiationNotify(response.responseText)
                gameManager.showNotification('Ha ocurrido un error', 'error', response.responseText);
            }
        });
        this.remove();
    }
}