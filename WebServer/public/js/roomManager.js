var onChatRoom = false
function initRoom(){
    onChatRoom = true;
    subscribeChatRoom();
}


function subscribeChatRoom() {
    if (onChatRoom) {
        console.log("Subscribe")
        $.ajax({
            url: URLbase + "/room/subscribeChatRoom",
            type: "GET",
            async: true,
            success: function (response, textStatus, jqXHR) {
                console.log( JSON.stringify(response));
                if(jqXHR.status ===200 && response.acceso){
                    manageEvent(response);
                }
            },
            error: function () { 
                console.error("Se ha perdido la conexión con el servidor: \n","Se ha perdido la conexión con el servidor") 
            },
            complete: function(request, status, err) {
                if (status == "timeout" || status == "success") {
                    console.log(`[${status}] LOG: Normal timeot, nueva peticion.` + JSON.stringify(request));
                    subscribeChatRoom();
                } else {
                    console.warn("WARN: Server probably offline, retrying in 2 sec.");
                    setTimeout(function() {
                        subscribeChatRoom();
                    }, 2000);
                }
            },
        });
    }
}



function sendMessage(){

    var text = $("#chat-input").val();
    console.log(text)
    $.ajax({
        url: URLbase + "/room/send",
        type: "POST",
        data: {
            rId : actualRoom.roomId ,
            txt : text
        },
        dataType: 'json',
        success: function (response, textStatus, jqXHR) {
            $("#chat-input").val("")
            AddPlayerMessage("Tu",text)
        },
        error: function () {
            console.error("Se ha perdido la conexión con el servidor: \n","Se ha perdido la conexión con el servidor") 
        }
    }); 
}

function startMatch() {
    $.ajax({
        url: URLbase + "/game/start",
        type: "POST",
        data: {
            rType : actualRoom.roomType,
            rId : actualRoom.roomId 
        },
        dataType: 'json',
        success: function (response, textStatus, jqXHR) {
            if(jqXHR.status ===200){
                startingGameOnClient(response);
            }
        },
        error: function () {
            console.error("Se ha perdido la conexión con el servidor: \n","Se ha perdido la conexión con el servidor") 
        }
    });
}

function startingGameOnClient(response) {
    onChatRoom = false;
    $("#gamecontainer").load("wigets/w-game.html",function() {
        console.log(JSON.stringify(response))
        setGameStatus(response)
    });
}
function manageEvent(event){
    console.log(JSON.stringify(event))
    if(event.eType === "PLAYER_MESSAGE"){
        AddRoomMessage(event.message)
    }else if(event.eType === "NEW_PLAYER"){
        AddRoomPlayer(event.playerInfo)
    }else if(event.eType === "PLAYER_READY"){
        
    }else if(event.eType === "GAME_START"){

    }
}


function UpdateRoomMessages(messages){
    console.log("Limpiando mensajes")
    var messageList =  $('#chat-container')[0]
    console.log(messages)
    removeAllChildNodes(messageList);
    if(messages && messages.length > 0 ){
        for(let i = 0; i<= messages.length-1; i++){
            AddRoomMessage("PLAYER_MESSAGE",messages[i])
        }
    }
}

function UpdateRoomPlayers(players){
    console.log("Limpiando usuarios")
    var playerList =  $('#player-container')[0]
    console.log(players)
    removeAllChildNodes(playerList);
    players.forEach(player => AddRoomPlayer(player));
}

function AddRoomMessage(mType, msg){
    if(mType === "PLAYER_MESSAGE"){
        AddOtherPlayerMessage(msg.author,msg.msg)
    }
}

function AddOtherPlayerMessage(author,msg){
    var cContainer = document.getElementById('chat-container');
    var row = document.createElement("div");
    var col = document.createElement("div");
    var chatBubble = document.createElement("div");
    var auth =  document.createElement("h6");
    var messg = document.createElement("p");

    
    row.className = "row g-0";
    col.className = "col-md-3";
    chatBubble.className = "chat-bubble chat-bubble-left";
    auth.className = "left-author text-muted text-start lh-1 pxy-0 mxy-0";
    messg.className = "chat-msg text-wrap fw-light lh-1 text-start pxy-0 mxy-0";

    auth.innerHTML = author;
    messg.innerHTML = msg

    chatBubble.appendChild(auth);
    chatBubble.appendChild(messg);
    col.appendChild(chatBubble);
    row.appendChild(col);
    cContainer.appendChild(row);
}

function AddPlayerMessage(author,msg){
    var cContainer = document.getElementById('chat-container');
    var row = document.createElement("div");
    var col = document.createElement("div");
    var chatBubble = document.createElement("div");
    var auth =  document.createElement("h6");
    var messg = document.createElement("p");

    
    row.className = "row g-0";
    col.className = "col-md-3 offset-md-9";
    chatBubble.className = "chat-bubble chat-bubble-right";
    auth.className = "right-author text-muted text-start lh-1 pxy-0 mxy-0";
    messg.className = "chat-msg text-wrap fw-light lh-1 text-start pxy-0 mxy-0";

    auth.innerHTML = author + ":";
    messg.innerHTML = msg

    chatBubble.appendChild(auth);
    chatBubble.appendChild(messg);
    col.appendChild(chatBubble);
    row.appendChild(col);
    cContainer.appendChild(row);
}


function AddRoomPlayer(playerInfo){
    console.log("Añadiendo jugador "+ playerInfo.name)
    var pContainer = document.getElementById('player-container');
    var drawer = document.createElement("div");
    drawer.className = "player-drawer g-0";
    var img = document.createElement("img");
    img.className = "profile-image";
    img.src = "https://avatars.dicebear.com/api/human/"+ playerInfo.name+".svg" //"https://64.media.tumblr.com/867447a52725fd3372358cb0446def20/tumblr_pihjgvRkNZ1xmnkzyo2_250.png";
    img.alt = "Profile pic";
    var playerText = document.createElement("div");
    playerText.className="player-text";
    var h6 = document.createElement("h6");
    h6.innerHTML = playerInfo.name
    var p = document.createElement("p");
    p.setAttribute("id", playerInfo.name);
    p.className = "player-status text-muted";
    p.innerHTML = "Esperando";

    playerText.appendChild(h6);
    playerText.appendChild(p);
    drawer.appendChild(img);
    drawer.appendChild(playerText);
    drawer.appendChild(document.createElement("p"));
    pContainer.appendChild(drawer);

}

