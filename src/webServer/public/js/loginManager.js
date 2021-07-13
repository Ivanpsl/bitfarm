// @ts-nocheck

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */



var loginManager = {
    infoModal : null,
    modalElement : null,
    openCloseInfoModal: function(open,modal){
        if(open)
            if(modal =="blockchain")
                $("#modal-content").load("wigets/modals/m-blockchainInfo.html",()=> {
                    this.showModal(true)
                });
            else{
                $("#modal-content").load("wigets/modals/m-farmchainInfo.html",()=> {
                    this.showModal(true)
                });
            }
        else{
            this.showModal(false);
        }
    },

    showModal : function (show){

        if(show && this.modalElement)
            this.modalElement.style.display = "block";
        else
            this.modalElement.style.display = "none";
    }


}

$(document).ready(function(){
    loginManager.modalElement = document.getElementById("modal-window");
    var btn_blockchainInfo = document.getElementById("btn-iblockchain");
    var btn_farmhainInfo = document.getElementById("btn-ifarmchain");

    btn_blockchainInfo.onclick = function() {
        loginManager.openCloseInfoModal(true,"blockchain");
    }

    btn_farmhainInfo.onclick = function() {
        
        loginManager.openCloseInfoModal(true,"farmchain");
    }


});
