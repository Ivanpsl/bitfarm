  // var websocket; 
        // var serverURL = "ws://localhost:3001";
        var ioServerURL = "http://localhost:3001";
        var socketio;

        function displayMessage(message){
            document.getElementById("display").value += message +"\n";
        }

        function initWebSocket(){
            if(!window.WebSocket){
                displayMessage("Tu navegador no soporta WebSockets");
                return;
            }
            
            socketio = io.connect(ioServerURL, { 'forceNew': true, query :'name='+document.cookie});
            socketio.on('connect', function(data) {
                displayMessage("[ServerWebSocketIO] Conexion iniciada ");
                // socketio.emit("updateName",document.cookie)
                document.getElementById("sendmessage").disabled = false;
            });
            socketio.on('newPlayer', function(data){
                displayMessage("[ServerWebSocketIO] Detectado nuevo jugador: " + data.name);
            });
            socketio.on('newText', function(data) {
                displayMessage("[ServerWebSocketIO] [Servidor] " + data);
            });
            socketio.on("disconnect", function(reason) {
               displayMessage("[ServerWebSocketIO] Conexion cerrada: ("+reason+")");
               if (reason === "io server disconnect") {
                    displayMessage("Tratando de recuperar conexion...")
                    socket.connect();
                }                  

                document.getElementById("sendmessage").disabled = true;
                
            });
            socketio.on('error', function(data) {
               displayMessage("[ServerWebSocketIO] Se ha producido un error "+data);
                document.getElementById("sendmessage").disabled = true;
            });


        }

        function sendMessage(){
            if(socketio.connected){
                var message = document.getElementById("message").value;
                displayMessage("Enviando mensaje: \""+ message + "\"");
                socketio.emit("sendMessage",message);
            } else {
                displayMessage("No se ha establecido conexión con el servidor");
                document.getElementById("sendMessage").disabled = true;
            }
        }