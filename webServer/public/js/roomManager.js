var roomManager = {
    actualRoom: null,
    players: [],
    messages: [],
    isReady: false,
    isPlaying: false,
    listeningEvents: true,
    initRoom: function (roomInfo) {
        this.actualRoom = roomInfo;
        this.renderRoom();
        this.subscribeChatRoom();
    },

    renderRoom: function () {
        $("#gamecontainer").load("wigets/w-room.html", function () {
            roomManager.updateRoomPlayers(roomManager.actualRoom.roomPlayers);
            document.getElementById("roomId-spam").innerHTML = roomManager.actualRoom.roomId;
            if (roomManager.actualRoom.roomType === "PRIVATE")
                document.getElementById("room-name").innerHTML = "Sala privada";
            else document.getElementById("room-name").innerHTML = "Sala " + roomManager.actualRoom.roomId;
        });
    },

    sendMessage: function () {
        var text = $("#chat-input").val();
        if (text != null && text != "")
            this.postMessage(text);
    },

    postMessage: function (message) {
        console.log("Enviando mensaje: " + message);
        $.ajax({
            url: URL_BASE + "/room/sendMessage",
            type: "POST",
            data: {
                rId: roomManager.actualRoom.roomId,
                txt: message
            },
            dataType: 'json',
            success: function (response, textStatus, jqXHR) {
                $("#chat-input").val("")
                roomManager.renderMessage(message)
            },
            error: function (request, status, error) {
                console.error("Se ha perdido la conexión con el servidor: \n", "Se ha perdido la conexión con el servidor\n" + console.log(JSON.stringify(error)));
                restartSesion();
            }
        });
    },

    changeReadyStatus: function () {
        this.isReady = !this.isReady;
        $.ajax({
            url: URL_BASE + "/room/setReady",
            type: "POST",
            data: {
                roomId: roomManager.actualRoom.roomId,
                isReady: roomManager.isReady
            },
            dataType: 'json',
            success: function (response, textStatus, jqXHR) {
                roomManager.updateReadyBtn();
            },
            error: function (request, status, error) {
                console.error("Se ha perdido la conexión con el servidor: \n", "Se ha perdido la conexión con el servidor\n" + console.log(JSON.stringify(error)));
                restartSesion();
            }
        });
    },

    startMatch: function () {
        $.ajax({
            url: URL_BASE + "/game/start",
            type: "POST",
            data: {
                rType: roomManager.actualRoom.roomType,
                rId: roomManager.actualRoom.roomId
            },
            dataType: 'json',
            success: function (response, textStatus, jqXHR) {
                if (jqXHR.status === 200) {
                    // if(roomManager.isPlaying===false){
                    //     this.isPlaying = true;
                    //     gameManager.initGame(response);
                    // }
                }
            },
            error: function (request, status, error) {
                console.error("Se ha perdido la conexión con el servidor: \n", "Se ha perdido la conexión con el servidor")
                restartSesion();
            }
        });
    },

    subscribeChatRoom: function () {
        console.log("Subscribe")
        $.ajax({
            url: URL_BASE + "/room/subscribeChatRoom",
            type: "GET",
            async: true,
            success: function (response, textStatus, jqXHR) {
                console.log(JSON.stringify(response));
                if (jqXHR.status === 200) {
                    roomManager.manageEvent(response);
                }
            },
            error: function (request, status, error) {
                console.error("Se ha perdido la conexión con el servidor: \n", "Se ha perdido la conexión con el servidor");
                restartSesion();
            },
            complete: function (request, status, err) {
                if (status == "timeout" || status == "success") {
                    if (!roomManager.isPlaying) {
                        console.log(`[${status}] LOG: Normal timeot, nueva peticion.` + JSON.stringify(request));
                        roomManager.subscribeChatRoom();
                    }
                } else {
                    if (!roomManager.isPlaying) {
                        setTimeout(function () {
                            roomManager.subscribeChatRoom();
                        }, 1000);
                    }
                }
            },
        });
    },

    exitChatRoom: function () {
        $.ajax({
            url: URL_BASE + "/room/exit",
            type: "GET",
            async: true,
            success: function (response, textStatus, jqXHR) {
                if (jqXHR.status === 200) {
                    Cookies.remove('actualRoomId');
                    Cookies.remove('actualRoomType');
                    window.location.href = HOME_URL + "/lobby";
                }
            },
            error: function (request, status, error) {
                console.error("Se ha perdido la conexión con el servidor: \n", "Se ha perdido la conexión con el servidor");
                restartSesion();
            },
        });
    },

    manageEvent: function (event) {
        console.log("******************RECIBIENDO EVENTO: \n" + JSON.stringify(event.eType))
        if (event.eType === ROOM_CONSTANTS.EVENT_PLAYERMESSAGE) {
            //source : sourceId, name:player.name, data: message
            // console.log(JSON.stringify(event.data));
            const newMsg = {
                source: event.source,
                author: event.data.author,
                message: event.data.message
            };
            this.messages.push(newMsg);
            this.renderOtherPlayerMessage(newMsg.author, newMsg.message);
        } else if (event.eType === ROOM_CONSTANTS.EVENT_PLAYER_JOIN) {
            this.addNewPlayer(event.data)
        } else if (event.eType === ROOM_CONSTANTS.EVENT_PLAYER_EXIT) {
            this.removePlayer(event.data);
        } else if (event.eType === ROOM_CONSTANTS.EVENT_PLAYER_CHANGE_STATUS) {
            this.updatePlayerStatus(event.data);
        } else if (event.eType === ROOM_CONSTANTS.EVENT_GAME_START) {
            this.listeningEvents = false
            if (roomManager.isPlaying === false) {
                this.isPlaying = true;
                gameManager.initGame(event.data);
            }
        }
    },


    addNewPlayer: function (playerData) {
        this.players.push(playerData);
        this.renderNewPlayer(playerData);
    },

    removePlayer: function (playerData) {
        var idx = this.players.indexOf(playerData);
        if (idx != -1) this.players.splice(idx, 1);

        this.deletePlayerRender(playerData);
    },

    updateRoomMessages: function (messages) {
        console.log("Limpiando mensajes")
        var messageList = $('#chat-container')[0]
        console.log(messages)
        removeAllChildNodes(messageList);
        if (messages && messages.length > 0) {
            for (let i = 0; i <= messages.length - 1; i++) {
                this.AddOtherPlayerMessage("PLAYER_MESSAGE", messages[i])
            }
        }
    },

    updateRoomPlayers: function (players) {
        this.players = players;
        console.log("Limpiando usuarios");
        var playerList = $('#player-container')[0];
        console.log(players);
        removeAllChildNodes(playerList);
        players.forEach(player => this.renderNewPlayer(player));
    },

    updatePlayerStatus: function (data) {
        var statusElement = document.getElementById(`${data.player.id}-status`);
        console.log("Cambiado estado de " + data.player.id)
        if (statusElement) {
            if (data.isReady === 'true') {
                statusElement.classList.remove("not-ready");
                statusElement.classList.add("ready");
                statusElement.innerHTML = "Listo";
            } else {

                statusElement.classList.add("not-ready");
                statusElement.classList.remove("ready");
                statusElement.innerHTML = "No esta listo";
            }
        }
    },

    updateReadyBtn: function () {
        var btn = document.getElementById('btn-ready');
        var icon = document.getElementById('ready-icon');
        var text = document.getElementById('btn-ready-text');
        if (this.isReady) {
            btn.className = "btn btn-danger mx-0 px-2 py-1";
            icon.className = "bi bi-bootstrap-reboot";
            text.innerHTML = "No estoy listo";
        } else {
            btn.className = "btn btn-primary mx-0 px-2 py-1";
            icon.className = "bi bi-check";
            text.innerHTML = "Estoy listo";
        }
    },

    renderNewPlayer: function (playerInfo) {
        console.log("Añadiendo jugador " + playerInfo.name)
        var pContainer = document.getElementById('player-container');
        var drawer = document.createElement("div");
        drawer.id = playerInfo.id;
        drawer.className = "player-drawer g-0";

        var img = document.createElement("img");
        img.className = "profile-image";
        img.src = "https://avatars.dicebear.com/api/human/" + playerInfo.name + ".svg";
        img.alt = "Profile pic";
        var playerText = document.createElement("div");
        playerText.className = "player-text";
        var h6 = document.createElement("h6");
        h6.innerHTML = playerInfo.name
        var p = document.createElement("p");
        p.id = playerInfo.id + "-status";
        p.className = "player-status text-muted";
        p.innerHTML = "No esta listo";

        playerText.appendChild(h6);
        playerText.appendChild(p);
        drawer.appendChild(img);
        drawer.appendChild(playerText);
        drawer.appendChild(document.createElement("p"));
        pContainer.appendChild(drawer);
    },

    deletePlayerRender: function (playerInfo) {
        var playerDiv = document.getElementById(playerInfo.id);
        if (playerDiv)
            playerDiv.parentNode.removeChild(playerDiv);
    },

    renderOtherPlayerMessage: function (author, msg) {
        var cContainer = document.getElementById('chat-container');
        var row = document.createElement("div");
        var col = document.createElement("div");
        var chatBubble = document.createElement("div");
        var auth = document.createElement("h6");
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

    renderMessage: function (msg) {
        var cContainer = document.getElementById('chat-container');
        var row = document.createElement("div");
        var col = document.createElement("div");
        var chatBubble = document.createElement("div");
        var auth = document.createElement("h6");
        var messg = document.createElement("p");

        row.className = "row g-0";
        col.className = "col-md-3 offset-md-9";
        chatBubble.className = "chat-bubble chat-bubble-right";
        auth.className = "right-author text-muted text-start lh-1 pxy-0 mxy-0";
        messg.className = "chat-msg text-wrap fw-light lh-1 text-start pxy-0 mxy-0";

        auth.innerHTML = "Tu:";
        messg.innerHTML = msg

        chatBubble.appendChild(auth);
        chatBubble.appendChild(messg);
        col.appendChild(chatBubble);
        row.appendChild(col);
        cContainer.appendChild(row);
    },
}