
room = {
    actualRoom : null,
    players: [],
    messages : [],

    initRoom : function (roomInfo) {

        this.actualRoom = roomInfo;
        this.renderRoom();
        this.subscribeChatRoom();
    },
    renderRoom : function(){
        $("#gamecontainer").load("wigets/w-room.html",function() {
            room.updateRoomPlayers(room.actualRoom.roomPlayers);
        });
    },
    
    sendMessage : function(){
        var text = $("#chat-input").val();
        if(text!= null && text != "")
            this.postMessage(text);
    },
    postMessage : function(message){ 
        console.log("Enviando mensaje: "+message);
        $.ajax({
            url: URL_BASE + "/room/sendMessage",
            type: "POST",
            data: {
                rId : room.actualRoom.roomId ,
                txt : message
            },
            dataType: 'json',
            success: function (response, textStatus, jqXHR) {
                $("#chat-input").val("")
                room.renderMessage(message)
            },
            error: function (request, status, error) {
                console.error("Se ha perdido la conexión con el servidor: \n","Se ha perdido la conexión con el servidor\n"+console.log(JSON.stringify(error)));
                restartSesion();
            }
        }); 
    },


    startMatch: function() {
        $.ajax({
            url: URL_BASE + "/game/start",
            type: "POST",
            data: {
                rType : room.actualRoom.roomType,
                rId : room.actualRoom.roomId 
            },
            dataType: 'json',
            success: function (response, textStatus, jqXHR) {
                if(jqXHR.status ===200){
                    game.startingGameOnClient(response);
                }
            },
            error: function (request, status, error) {
                console.error("Se ha perdido la conexión con el servidor: \n","Se ha perdido la conexión con el servidor") 
            }
        });
    },

        
    subscribeChatRoom : function() {
        console.log("Subscribe")
        $.ajax({
            url: URL_BASE + "/room/subscribeChatRoom",
            type: "GET",
            async: true,
            success: function (response, textStatus, jqXHR) {
                console.log( JSON.stringify(response));
                if(jqXHR.status ===200){
                    room.manageEvent(response);
                }
            },
            error: function (request, status, error) { 
                console.error("Se ha perdido la conexión con el servidor: \n","Se ha perdido la conexión con el servidor") 
            },
            complete: function(request, status, err) {
                if (status == "timeout" || status == "success") {
                    console.log(`[${status}] LOG: Normal timeot, nueva peticion.` + JSON.stringify(request));
                    room.subscribeChatRoom();
                } else {
                    setTimeout(function() {
                        room.subscribeChatRoom();
                    }, 1000);
                }
            },
        });
    },
    exitChatRoom : function() {
        $.ajax({
            url: URL_BASE + "/room/exit",
            type: "GET",
            async: true,
            success: function (response, textStatus, jqXHR) {
                if(jqXHR.status ===200){
                    Cookies.remove('actualRoomId');
                    Cookies.remove('actualRoomType');
                    window.location.href = HOME_URL+ "/lobby";
                }
            },
            error: function (request, status, error) { 
                console.error("Se ha perdido la conexión con el servidor: \n","Se ha perdido la conexión con el servidor") 
            },
        });
    },
    
    manageEvent: function(event){
        console.log("RECIBIENDO EVENTO: \n" + JSON.stringify(event))
        if(event.eType === ROOM_CONSTANTS.EVENT_PLAYERMESSAGE){
            //source : sourceId, name:player.name, data: message
            console.log(JSON.stringify(event.data));
            const newMsg = {source: event.source, author: event.data.author, message: event.data.message};
            this.messages.push(newMsg);
            this.renderOtherPlayerMessage(newMsg.author, newMsg.message);
        }else if(event.eType === ROOM_CONSTANTS.EVENT_PLAYER_JOIN){
            this.addNewPlayer(event.data)
        }else if(event.eType === ROOM_CONSTANTS.EVENT_PLAYER_EXIT){
            this.removePlayer(event.data);
        }else if(event.eType === "PLAYER_READY"){
        }else if(event.eType === "GAME_START"){

        }
    },   
    addNewPlayer: function(playerData){
        this.players.push(playerData);
        this.renderNewPlayer(playerData);
    },
    removePlayer: function(playerData){
        var idx = this.players.indexOf(playerData);
        if (idx != -1) this.players.splice(idx, 1);

        this.deletePlayerRender(playerData);
    },

    updateRoomMessages: function(messages){
        console.log("Limpiando mensajes")
        var messageList =  $('#chat-container')[0]
        console.log(messages)
        removeAllChildNodes(messageList);
        if(messages && messages.length > 0 ){
            for(let i = 0; i<= messages.length-1; i++){
                this.AddOtherPlayerMessage("PLAYER_MESSAGE",messages[i])
            }
        }
    },

    renderOtherPlayerMessage: function(author,msg){
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
    },
    
    renderMessage: function(msg){
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

        auth.innerHTML ="Tu:";
        messg.innerHTML = msg

        chatBubble.appendChild(auth);
        chatBubble.appendChild(messg);
        col.appendChild(chatBubble);
        row.appendChild(col);
        cContainer.appendChild(row);
    },

    updateRoomPlayers : function(players){
        this.players = players;
        console.log("Limpiando usuarios");
        var playerList =  $('#player-container')[0];
        console.log(players);
        removeAllChildNodes(playerList);
        players.forEach(player => this.renderNewPlayer(player));
    },


    renderNewPlayer: function(playerInfo){
        console.log("Añadiendo jugador "+ playerInfo.name)
        var pContainer = document.getElementById('player-container');
        var drawer = document.createElement("div");
        drawer.id = playerInfo.id;
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
    },
    
    deletePlayerRender : function(playerInfo){
        var playerDiv = document.getElementById(playerInfo.id);
        if(playerDiv)
            playerDiv.parentNode.removeChild(playerDiv);
    }
}











