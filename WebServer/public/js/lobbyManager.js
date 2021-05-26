var rooms;
var selectedRoomId;
var actualRoom;
var URLbase = "https://localhost:3000";
var autoUpdateRoomList = true;

var intervalUpdateRoom ;

function getServerRooms() {
    $.ajax({
        url: URLbase + "/roomList",
        type: "GET",
        data: {},
        dataType: 'json',
        // headers: {"token": token},
        success: function (respuesta) {
            rooms = respuesta;
            console.log(rooms)
            updateRoomList(rooms)
        },
        error: function () {
            toast("toastError","Se ha perdido la conexión con el servidor: \n","Se ha perdido la conexión con el servidor") 
        }
    });
}

function joinRoomRequest(roomType, roomId) {
    $.ajax({
        url: URLbase + "/joinRoom",
        type: "POST",
        data: {
            rType : roomType,
            rId : roomId 
        },
        dataType: 'json',
        success: function (response, textStatus, jqXHR) {
            if(jqXHR.status ===200){
                autoUpdateRoomList = false
                actualRoom = response
                $("#gamecontainer").load("wigets/w-room.html",function() {
                    console.log(response)
              
                    UpdateRoomPlayers(response.roomPlayers);
                    // UpdateRoomMessages(response.messages);
           
                });
            }
    
        },
        error: function () {
            console.error("Se ha perdido la conexión con el servidor: \n","Se ha perdido la conexión con el servidor") 
        }
    });
}





function toast(toastId,message,title){
            
    // var dt = new Date();
    // document.getElementById("datetime-"+toastId).innerHTML = dt.toLocaleTimeString();
    // document.getElementById("toast-body-"+toastId).innerHTML = message;
    // document.getElementById("me-auto-"+toastId).innerHTML = title;

    // $('.'+toastId).toast();
    // $('.'+toastId).toast('show');
}

function selectItem(index){
    console.log("Seleccionando: "+index)
    var docRooms = document.getElementsByClassName("room");
    var joinBtn = document.getElementById("joinbtn");
    for(let i = docRooms.length -1; i>=0; i--){
        docRooms[i].classList.remove("selected");
    }

    if(index !== selectedRoomId){
        docRooms[index].classList.add("selected");
        selectedRoomId = index;
        joinBtn.disabled = false;
    }else{
        selectedRoomId = null;
        joinBtn.disabled = true;
    }
                 
}

function updateRoomList(rooms){
    gameRooms = [];
    var roomList = document.getElementById('rooms');
    removeAllChildNodes(roomList);
    if(rooms.length>0){
        for(let i = 0; i<= rooms.length-1; i++){
            var container = document.createElement("div");
            container.className = "room shadow-lg m-1 mx-0 p-0 pb-0";
            container.addEventListener("click",()=>selectItem(i));
            var container2 = document.createElement("div");
            container2.className = "row title-sector p-2 m-1 align-items-center";
            var roomTitle = document.createElement("div");
            roomTitle.className="roomtitle col-auto"
            roomTitle.innerHTML = "Sala: " + rooms[i].roomId;
            var roomStatus = document.createElement("div");
            roomStatus.className = "roomstatus col-auto shadow ms-auto text-truncate " + rooms[i].roomStatus
            roomStatus.innerHTML ="" + getStatusName(rooms[i].roomStatus);
            
            container2.appendChild(roomTitle);
            container2.appendChild(roomStatus);
            container.appendChild(container2);
            roomList.appendChild(container);
        }
    }

    document.getElementById("update-icon").classList.remove("nodisplay")
    document.getElementById("update-spin").classList.add("nodisplay");7

    if(selectedRoomId != null){
        selectItem(selectedRoomId);
    }
}


function removeAllChildNodes(parent) {
    while (parent && parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function requestUpdate(forceUpdate){
    if( autoUpdateRoomList == true || forceUpdate == true){
        console.log("Actualizando lista de salas")
        var roomList = document.getElementById('rooms');

        removeAllChildNodes(roomList);
        document.getElementById("update-icon").classList.add("nodisplay")
        document.getElementById("update-spin").classList.remove("nodisplay");
        getServerRooms()
        
        if(autoUpdateRoomList === true && intervalUpdateRoom == null && forceUpdate === false){
            startRoomsInterva();
        }
    }
}

function joinPublic(){
    joinRoomRequest("PUBLIC_ROOM",selectedRoomId);
}

function getStatusName(status){
    if(status==="waiting") return "Esperando";
    if(status==="running") return "Jugando";
    if(status==="empty") return "Vacia";
    if(status==="starting") return "Iniciando";
}

function getToken() {
    $.ajax({
        url: "https://localhost:3001/validar",
        type: "GET",
        dataType: 'json',
        success: function (respuesta) {
            if (respuesta.estado === true) {
                $("#desconectar").show();
            } else {
                $("#desconectar").hide();
            }
        },
        error: function (error) {
        }
    });
}


function startRoomsInterva() {
    intervalUpdateRoom = setInterval(function () {
        requestUpdate(false)
    }, 10000);
}

function stopRoomsInterval(){
    clearInterval(intervalUpdateRoom);
    intervalUpdateRoom = null;
}

$( document ).ready(function() {
 


    if (Cookies.get('actualRoom') != null) {
        // room = Cookies.get('actualRoom');
        // actualRoom = room;
        // var url = new URL(window.location.href);
        // var w = url.searchParams.get("w");
        // if (w === "room") {
        //     $("#gamecontainer").load("w-room.html");
        // }
        $("#gamecontainer").load("wigets/w-room.html");
        document.getElementById("lobby-screen").classList.add("nodisplay")
    }else{
        toast("toastConnecting","Conectando con el servidor para obtener la lista de partidas.","Conectando con el servidor")
        document.getElementById("lobby-screen").classList.remove("nodisplay");
        document.getElementById("joinbtn").disabled = true;
        document.getElementById("update-spin").classList.add("nodisplay");
        // getToken();
        requestUpdate(false);
    }

});

