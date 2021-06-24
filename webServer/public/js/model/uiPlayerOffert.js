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
        h5.textContent = "Oferta de " + ownerName;

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
            btn.textContent = "Comprar oferta";
    
            btn.onclick = () => {
                if (gameManager.player.money > this.money) {
                    this.buy();
                } else {
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

    remove() {
        if (this.isPlayerOwner) {

            var itemListElement = document.getElementById(`group-item-${this.element.type}-${this.element.index}`);
            var itemCreateOffertBtn = document.getElementById(`btn-offert-create-${this.element.type}-${this.element.index}`);
            var itemPriceInput = document.getElementById(`input-${this.element.type}-${this.element.index}`);

            itemListElement.disabled = false;
            itemCreateOffertBtn.disabled = false;
            itemPriceInput.disabled = false;
            itemListElement.classList.remove('list-group-item-secondary')

            var elem = document.getElementById(`group-item-${this.index}`)
            if(elem)
                elem.parentNode.removeChild(elem);
        }
    }

    buy() {
        $.ajax({
            url: URL_BASE + "/game/offert/buy",
            type: "GET",
            data: {
                index: this.index,
                owner: this.owner,
                element: this.element,
                price: this.price,
                source: gameManager.player.account.publicKey,
            },
            dataType: 'json',
            success: function (response, textStatus, jqXHR) {
                gameManager.showNotification('Oferta comprada', 'success', 'La oferta para ' + item.label + ' ha sido comprada');

            },
            error: function (response, status, error) {
                gameManager.showNotification('Ha ocurrido un error', 'error', response.responseText);
            }
        });
        this.remove();
    }
}