// @ts-nocheck

/*global Cookies, URL_BASE,$,document,removeAllChildNodes, restartSesion,ROOM_CONSTANTS,roomManager */
var lobbyManager = {
    rooms: null,
    selectedRoomId : null,
    intervalUpdateRoom: null,
    autoUpdateRoomList : true,

    renderLobby: function(){
        $("#gamecontainer").load("wigets/w-lobby.html",function() {
                console.log("Solicitando salas");
                console.log("Conectando con el servidor para obtener la lista de partidas.","Conectando con el servidor");
                document.getElementById("lobby-screen").classList.remove("nodisplay");
                document.getElementById("joinbtn").disabled = true;
                document.getElementById("update-spin").classList.add("nodisplay");

                var btnJoinPrivate = document.getElementById("btn-join-private");
                btnJoinPrivate.addEventListener("click",()=>lobbyManager.joinPrivate());
                lobbyManager.requestUpdate(false);
        });
    },
    
    getServerRooms: function() {
        $.ajax({
            url: URL_BASE + "/roomList",
            type: "GET",
            data: {},
            dataType: 'json',
            // headers: {"token": token},
            success: function (response) {
                lobbyManager.updateRoomList(response);
            },
            error: function () {
                console.error("Se ha perdido la conexión con el servidor: \n","Se ha perdido la conexión con el servidor");
                restartSesion();
            }   
        });
    },

    updateRoomList: function(roomData){
        this.rooms = roomData;
        console.log(roomData)
        this.renderRoomList()
    },
        

    selectItem : function(index){
        var docRooms = document.getElementsByClassName("room");
        var joinBtn = document.getElementById("joinbtn");
        for(let i = docRooms.length -1; i>=0; i--){
            docRooms[i].classList.remove("selected");
        }

        if(index !== this.selectedRoomId && this.rooms[index].roomStatus != ROOM_CONSTANTS.STATUS_RUNNING){
            docRooms[index].classList.add("selected");
            this.selectedRoomId = index;
            joinBtn.disabled = false;
        }else{
            this.selectedRoomId = null;
            joinBtn.disabled = true;
        }
    },


    createPrivateRoom: function(){
        this.createPrivateRoomRequest();
    },



    renderRoomList: function(){
        var rooms = this.rooms;
        var roomList = document.getElementById('rooms');
        removeAllChildNodes(roomList);
        if(rooms.length>0){
            for(let i = 0; i<= rooms.length-1; i++){
                var container = document.createElement("div");
                container.className = "room shadow-lg m-1 mx-0 p-0 pb-0";
                container.addEventListener("click",()=>this.selectItem(i));
                var container2 = document.createElement("div");
                container2.className = "row title-sector p-2 m-1 align-items-center";
                var roomTitle = document.createElement("div");
                roomTitle.className="roomtitle col-auto"
                roomTitle.innerHTML = "Sala: " + rooms[i].roomId;
                var roomStatus = document.createElement("div");
                roomStatus.className = "roomstatus col-auto shadow ms-auto text-truncate " + rooms[i].roomStatus
                roomStatus.innerHTML ="" + this.statusToString(rooms[i].roomStatus);
                
                container2.appendChild(roomTitle);
                container2.appendChild(roomStatus);
                container.appendChild(container2);
                roomList.appendChild(container);
            }
        }

        document.getElementById("update-icon").classList.remove("nodisplay")
        document.getElementById("update-spin").classList.add("nodisplay");

        if(this.selectedRoomId != null){
            this.selectItem(this.selectedRoomId);
        }
    },


    requestUpdate: function(forceUpdate){
        if(this.autoUpdateRoomList || forceUpdate){
            console.log("Actualizando lista de salas")
            var roomList = document.getElementById('rooms');

            removeAllChildNodes(roomList);
            document.getElementById("update-icon").classList.add("nodisplay")
            document.getElementById("update-spin").classList.remove("nodisplay");
            this.getServerRooms()
            
            if(this.autoUpdateRoomList === true && this.intervalUpdateRoom == null && forceUpdate === false){
                this.startRoomsInterval();
            }
        }
    },
    joinPrivate: function(){
        var imput = document.getElementById("recipient-ident");
        this.joinRoomRequest(ROOM_CONSTANTS.TYPE_PRIVATE,imput.value);
    },

    joinPublic: function(){
        this.joinRoomRequest(ROOM_CONSTANTS.TYPE_PUBLIC,this.selectedRoomId);
    },

    statusToString: function(status){
        if(status===ROOM_CONSTANTS.STATUS_WAITING) return "Esperando";
        if(status===ROOM_CONSTANTS.STATUS_RUNNING) return "Jugando";
        if(status===ROOM_CONSTANTS.STATUS_EMPTY) return "Vacia";
    },

    getToken : function() {
        $.ajax({
            url: URL_BASE+"/validar",
            type: "GET",
            dataType: 'json',
            success: function (response) {
                if (response.estado === true) {
                    $("#desconectar").show();
                } else {
                    $("#desconectar").hide();
                }
            },
            error: function (error) {
                // eslint-disable-next-line no-undef
                alert(error.message);
                restartSesion();
            }
        });
    },

    startRoomsInterval : function() {
        this.intervalUpdateRoom = setInterval(function () {
            lobbyManager.requestUpdate(false)
        }, 10000);
    },

    stopRoomsInterval: function(){
        clearInterval( this.intervalUpdateRoom);
        this.intervalUpdateRoom = null;
    },


    
    createPrivateRoomRequest: function(){
        $.ajax({
                url: URL_BASE + "/room/create",
                type: "GET",
                data: {
                },
                dataType: 'json',
                success: function (response, textStatus, jqXHR) {
                    if(jqXHR.status ===200){
                        lobbyManager.joinRoomRequest(response.roomType,response.roomId);
                    }
                },
                // eslint-disable-next-line no-unused-vars
                error: function (_request, _error) {
                    console.error("Se ha perdido la conexión con el servidor: \n","Se ha perdido la conexión con el servidor");
                    restartSesion();
                }
            });
    },

    joinRoomRequest: function(roomType, roomId) {
        $.ajax({
            url: URL_BASE + "/room/join",
            type: "POST",
            data: {
                rType : roomType,
                rId : roomId 
            },
            dataType: 'json',
            success: function (response, textStatus, jqXHR) {
                if(jqXHR.status ===200){
                    lobbyManager.autoUpdateRoomList = false
                    Cookies.set('userId',response.userId)
                    Cookies.set('actualRoomId',response.roomInfo)
                    Cookies.set('actualRoomType',response.roomType)
                    
                    roomManager.initRoom(response.roomInfo);
                    console.log("Uniendose a sala " + response.roomType)
                }
            },
            // eslint-disable-next-line no-unused-vars
            error: function (_request, _error) {
                console.error("Se ha perdido la conexión con el servidor: \n","Se ha perdido la conexión con el servidor");
                restartSesion();
            }
        });
    }
}




$(document).ready(function() {
    if (Cookies.get('actualRoomId') != null && Cookies.get('actualRoomType') != null && Cookies.get('actualRoomId') != undefined && Cookies.get('actualRoomType') != undefined) {
        lobbyManager.joinRoomRequest(Cookies.get('actualRoomType'),Cookies.get('actualRoomId') );
        document.getElementById("lobby-screen").classList.add("nodisplay");
    }else{
        lobbyManager.renderLobby();
    }

});

