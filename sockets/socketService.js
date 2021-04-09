const Room = require('../models/Room');

var Instance={};

class SocketService { 

    constructor(server,gameManager) { 
        // this.app = app;
        this.sio = require('socket.io')(server, {
            cors: {
              origin: "*:*",
              methods: ["GET", "POST"]
            }
        });
        console.log(gameManager);
        this.gameManager = gameManager; 
        this.sockets = {};
        Instance = this;
        // this.initServerIo();
    }

    initServerIo(){
        const { gameManager,sio } = Instance;

        sio.on('connection', function(socket){
            
            console.log('[SOCKETS] Usuario conectandose [ID: '+socket.id +' NOMBRE: '+socket.handshake.query.name+']');

            //Crear y enviar informacion de los jugadores
            socket.emit('currentPlayers', gameManager.getPlayer(socket.id));
            // socket.emit('currentChat',textChats);
            
            Instance.addListeners(socket,gameManager)
            socket.join("lobby");
            Instance.sockets[socket.id]= socket;
            gameManager.addPlayer(socket.id,socket.handshake.query.name,socket);
            sio.emit('newPlayer', gameManager.getPlayer(socket.id));
            Instance.sendRoomList();
        });
    }

    addListeners(socket){
        const { gameManager,sio } = Instance;

        socket.on('disconnect', function() {
            console.log('[SOCKETS] Usuario desconectandose');
            gameManager.removePlayer(socket.id);
        });
        
        socket.on('updateName', function(name){
            
            console.log('[SOCKETS] [ID: '+socket.id+' ] Actualizando nombre a '+name);
            gameManager.updateName(socket.id,name);
        });

        socket.on('sendMessage',function(textInfo){
            console.log("Test")
            console.log('[SOCKETS] ha enviado un mensaje: "'+textInfo + '"    [ID:'+socket.id +']');
            sio.emit('newText','\n\t\t\t\t----->' + gameManager.getPlayer(socket.id).name+ " Dice: " + textInfo);
        });


        socket.on('request-room-list',function(){
            const { gameManager } = Instance;
            var roomList = gameManager.getRoomsData();
            socket.emit("update-room-list",roomList);
        });

        socket.on('join-room',function(roomId){
            gameManager.joinRoom(socket.id,roomId)
        });
        
        socket.on('leave-room', function(roomid){
         
        });

        
        socket.on('leave-room', function(roomid){
         
        });
    }

    joinRoom(socketId,roomId){
                // const { gameManager,sio } = sServiceInstance;

        this.sockets[socketId].join(roomId)
        this.sio.to(roomId).emit('newText',`[Sala ${roomId}] ${this.gameManager.getPlayer(socketId).name} Se a unido a la sala`);

    }
    
    getIO(){
        return this.sio;
    }

    registerEvent(eventName, id){
        
    }

    getSocket(id){
        return this.sockets[id];
    }

    sendRoomList(){
        const { gameManager,sio } = Instance;
        var roomList = gameManager.getRoomsData();

        sio.to("lobby").emit("update-room-list",roomList);
    }

    static getInstance(){
        return Instance;
    }
}

module.exports = SocketService,Instance;
