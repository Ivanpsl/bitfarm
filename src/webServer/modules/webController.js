// eslint-disable-next-line no-unused-vars
const WebService = require("./webService");

/** Clase encargada de recoger las peticiones de las rutas y darles respuesta a traves de los servicios necesarios */
class WebController {
    /**
    * Constructor de WebController.
    * 
    * @param  {object} app  - Objeto app
    * @param  {WebService} webService - Servicio web con el que se comunica
    */
    constructor(app, webService) {
        this.app = app;
        this.webService = webService;
    }

    /**
     * Devuelve el servicio web
     * 
     * @returns {any} - WebService
     */
    getWebService(){ return this.webService}

    /**
     * Función que redirige la identificación de un usuario 
     */
    singin(req,res){

        if(req.body.username != null && req.body.username.trim().length > 0){
            var user = req.body.username;
            var playerToken;
            
            playerToken = this.app.get('jwt').sign({usuario: user , tiempo: Date.now() / 1000},"secreto");

            req.session.user = user;
            req.session.token = playerToken;
            req.session.playerId = playerToken;
            req.session.inRoom = false;
            req.session.inGame = false;
            res.status(200).redirect('/lobby');
        } else throw Error("El nombre de usuario no es un nombre valido")
    }
    


    /**
     * Función que redirige la petición de lista de salas
     */
    requestRoomList(req,res){
        var rooms = this.webService.getRoomService().getRoomsData();
        res.status(200).send(rooms);
        res.end();
    }


    /**
     * Función que redirige la union a una sala
     */
    joinRoom(req,res){
        if (req.session.playerId && req.body.rId != null) {
            var player = {
                id: req.session.playerId,
                name: req.session.user,
                isReady: false
            }
            var roomId =  req.body.rId;

            var response = this.webService.getRoomService().joinRoom(player, roomId);

            if (response.error) {   
                console.error(response.error);
                res.status(400).send(response.error);
            } else {
                console.log(JSON.stringify(response))
                req.session.room = response.roomInfo.roomId
                req.session.inRoom = true;
                res.status(200).send(response);
            }
        } else {
            throw new Error("Sesión no iniciada o sala no existente");
        }
    }

    /**
     * Función que redirige la creación de una sala
     */
    createRoom(req,res){
        var playerId = req.session.playerId;
        if (playerId) {
            var newRoom = this.webService.getRoomService().createPrivateRoom(playerId);
            res.status(200).send(newRoom);
        }else{
            throw new Error("Error al reconocer el usuario")
        }
    }
    
    /**
     * Función que redirige la peticion de salir de una sala
     */
    exitRoom(req,res){
        if (req.session.playerId != null && req.session.room != null && req.session.room != undefined) {
            this.webService.getRoomService().exitRoom(req.session.playerId, req.session.room);
            req.session.room = null;
            res.redirect('/lobby');
        }
    }

    /**
     * Función que redirige la peticion de salir de una sala
     */
    subscribeToRoomEvents(req,res){
        if (req.session.room != null) {
            var room = this.webService.getRoomService().getRoom(req.session.room);
            if (room) room.addListener(req.session.playerId, res);
            else throw new Error("No existe una sala con el ID introducido")

        }else{
            throw new Error("No es posible suscribirse a los eventos de la sala, no se ha especificado ID de sala")
        }
    }

    /**
     * Función que redirige la petición de cambiar de estado dentro de una sala
     */
    setPlayerRoomStatus(req,res){
        if (req.session.token && req.session.playerId && req.body.roomId == req.session.room && req.body.isReady) {
            var roomId = req.body.roomId;
            var playerId = req.session.playerId;
            var isReady = req.body.isReady;

            var roomService = this.webService.getRoomService();

            roomService.setPlayeStatus(playerId,roomId,isReady)

            if (roomService.getRoom(roomId).arePlayersReady() && roomService.getRoom(roomId).getNumPlayers()>1){
                    this.webService.startGame(roomId);
            }

            res.status(200).send(true);
        } else {
            throw new Error("No es posible suscribirse a los eventos de la sala, no se ha especificado ID de sala")
        }
    }


    responseSendMessage(req,res){
        if (req.session.token && req.session.playerId != null && req.body.txt) {
            var room = this.webService.getRoomService().getRoom(req.body.rId);
            if (room){
                room.addMessage(req.session.playerId, req.body.txt);
                res.status(200).send(true);
            }
            else res.status(400).send("Sala no identificada");
        } else {
            res.status(400).send("Faltan datos en la petición");
        }
    }

    checkToken(req,res,next){
        var token = req.headers['token'] || req.body.token || req.query.token || req.session.token;
        if (token != null) {
            this.app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
                if (err || (Date.now() / 1000 - infoToken.tiempo) > 240) {
                    console.log("Token")
                    console.error("Error con el token: "+err);
                    res.status(403);
                    console.error("No hay token valido")
                    res.redirect('/game/login.html?mensaje=Token no valido')
                } else {
                    res.usuario = infoToken.usuario;
                    next();
                }
            });
        } else {
            res.status(403);
            res.redirect("/");
        }
    }
}


module.exports = WebController;