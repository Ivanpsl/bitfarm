lobbyManager = {
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
        rooms = roomData;
        console.log(rooms)
        this.renderRoomList(rooms)
    },
        

    selectItem : function(index){
        var docRooms = document.getElementsByClassName("room");
        var joinBtn = document.getElementById("joinbtn");
        for(let i = docRooms.length -1; i>=0; i--){
            docRooms[i].classList.remove("selected");
        }

        if(index !== this.selectedRoomId){
            docRooms[index].classList.add("selected");
            this.selectedRoomId = index;
            joinBtn.disabled = false;
        }else{
            this.selectedRoomId = null;
            joinBtn.disabled = true;
        }
    },

    renderRoomList: function(rooms){
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
            url: "https://localhost:3001/validar",
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
                    Cookies.set('actualRoomId',response.roomInfo)
                    Cookies.set('actualRoomType',response.roomType)
                    roomManager.initRoom(response.roomInfo);
                    console.log("Uniendose a sala")
                }
            },
            error: function (request, error) {
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

