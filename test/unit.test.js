// @ts-nocheck
/* eslint-disable no-undef */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
process.env.NODE_ENV = 'test'

const {
    ROOM_CONSTANTS,
    GAME_CONSTANTS
} = require('../src/common/constants');

let fs = require('fs');
let FarmChainService = require("../src/Blockchain/FarmChainService");
let WebServer = require("../src/webServer/webServer");
let Transaction = require("../src/blockchain/model/transaction");
let config = require("config");

let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = require('chai').expect;

chai.use(chaiHttp);

const webServiceUrl = 'https://localhost:3000/';
var chainService;
var chainFacade;
var webServer;
var agent;

var testgameId = 3;
var testPlayerName = "testUser";
var testPlayerId = "51312";
var testElementIndex = 9;
var testElementPrice = 10;
var startMoney = 0;

before(function () {
    const httpCertificates = {
        key: fs.readFileSync('certificates/key.pem'),
        cert: fs.readFileSync('certificates/cert.pem')
    }

    chainService = new FarmChainService(config.get("Blockchain"));

    webServer = new WebServer({
        "run_server": true,
        "host": "localhost",
        "port": 3000,
        "logger": 0
    });

    chainFacade = chainService.getFacade();
    webServer.init(httpCertificates, chainFacade);
    chainService.startNode();

    agent = chai.request.agent(webServiceUrl);

    console.log("--------------------- TEST UNITARIOS PARA WEBSERVICE ---------------------");
});

// after(function() {
//     process.exit();
// });


describe('WebServer: ', () => {

    describe('Identificarse: ', () => {
        it('Debe identificarse correctamente', (done) => {
            agent.post('identificarse')
                .send({
                    username: "valid_name"
                })
                .end(function (err, res) {
                    expect(res.req.path).to.equal('/game/main.html');
                    expect(res).to.have.status(200);
                    done();
                });
        });

        it('No debe identificar usuario con nombre invalido', (done) => {
            agent.post('identificarse')
                .send({
                    username: " "
                })
                .end(function (err, res) {
                    expect(res.req.path).to.equal("/game/login.html?mensaje=El%20nombre%20de%20usuario%20no%20es%20un%20nombre%20valido&tipoMensaje=alert-danger")
                    // @ts-ignore
                    expect(res.redirects[0]).to.include.any.string("El%20nombre%20de%20usuario%20no%20es%20un%20nombre%20valido&")
                    done();
                });
        });
    });


    describe('Mostrar lista de salas publicas: ', () => {
        it('Obtener lista de salas publicas', (done) => {

            agent.get('roomList').end(function (err, res) {
                var roomService = webServer.service.getRoomService();

                expect(res.body.length).to.equals(roomService.getPublicRooms().length);
                done();
            });
        });

    });

    describe('Crear una sala: ', () => {
        it('Solicitar la creación de una sala privada', (done) => {

            agent.get('room/create').end(function (err, res) {
                var roomService = webServer.service.getRoomService();
                expect(res.body.roomId, "No se ha devuelto correctamente el identificador de la sala").to.exist;
                expect(res.body.roomId).to.equals(roomService.getRoom(res.body.roomId).roomId);
                done();
            });
        });

    });

    describe('Unirse a una sala: ', () => {
        it('Se solicita unirse a una sala publica existente', (done) => {
            var roomService = webServer.service.getRoomService();
            var testRoom = roomService.getPublicRooms()[0];
            agent.post('room/join').send({
                rType: testRoom.roomType,
                rId: testRoom.roomId
            }).end(function (err, res) {
                expect(res.body.roomInfo.roomId, "No se ha devuelto correctamente el identificador de la sala").to.exist;
                expect(res.body.roomInfo.roomType).to.equals(testRoom.roomType);
                expect(res.body.roomInfo.roomId).to.equals(testRoom.roomId);
                expect(res.body.roomInfo.numPlayers).to.equals(roomService.getRoom(testRoom.roomId).players.length)

                done();
            });
        });

        it('Se solicita unirse a una sala inexistente', (done) => {
            var roomService = webServer.service.getRoomService();
            var testRoom = roomService.getPublicRooms()[0];
            var testId = 100;
            agent.post('room/join').send({
                rType: testRoom.roomType,
                rId: testId
            }).end(function (err, res) {

                expect(res).to.have.status(400);
                expect(res.text).to.equals(`Sala ${testId} no encontrada`);

                done();
            });
        });

        it('Se solicita unirse a una sala con una partida en curso', (done) => {
            var roomService = webServer.service.getRoomService();
            var testRoom = roomService.getPublicRooms()[0];
            testRoom.startGame();
            agent.post('room/join').send({
                rType: testRoom.roomType,
                rId: testRoom.roomId
            }).end(function (err, res) {
                expect(res).to.have.status(400);
                expect(res.text).to.equals(`Sala ${testRoom.roomId} ya esta jugando una partida`);
                done();
            });
        });
    });


    describe('Enviar un mensaje en una sala: ', () => {
        it('Enviar un mensaje a una sala existente', (done) => {
            var roomService = webServer.service.getRoomService();
            var testRoom = roomService.getPublicRooms()[0];
            var text = "message"
            agent.post('room/sendMessage').send({
                txt: text,
                rId: testRoom.roomId
            }).end(function (err, res) {
                expect(res).to.have.status(200);

                expect(1).to.equals(testRoom.messages.length);
                done();
            });
        });

        it('Enviar un mensaje a una sala inexistente', (done) => {
            var text = "message"
            var testId = 100;
            agent.post('room/sendMessage').send({
                txt: text,
                rId: testId
            }).end(function (err, res) {
                expect(res).to.have.status(400);
                expect(res.text).to.equals(`Sala no identificada`);

                done();
            });
        });
    });

    describe('Desconectarse de una sala: ', () => {
        it('Desconectarse de una sala con mas de un jugador', (done) => {
            var roomService = webServer.service.getRoomService();
            var testRoom = roomService.getRoom(7);
            testRoom.addPlayer({
                id: "1111",
                name: "fakePlayer",
                isReady: false
            });

            joinRoom(testRoom.roomId, (err, res) => {
                expect(res.body.roomInfo.numPlayers).to.equals(roomService.getRoom(testRoom.roomId).players.length)

                agent.get('room/exit').send({

                }).end(function () {
                    expect(1).to.equals(testRoom.players.length)
                    expect(testRoom.roomStatus).to.equals(ROOM_CONSTANTS.STATUS_WAITING);
                    done();
                });
            })
        });
        it('Desconectarse de una sala con un unico jugador', (done) => {
            var roomService = webServer.service.getRoomService();
            var testRoom = roomService.getRoom(8);

            joinRoom(testRoom.roomId, (err, res) => {
                expect(res.body.roomInfo.numPlayers).to.equals(roomService.getRoom(testRoom.roomId).players.length)

                agent.get('room/exit').end(function () {
                    expect(0).to.equals(testRoom.players.length)
                    expect(testRoom.roomStatus).to.equals(ROOM_CONSTANTS.STATUS_EMPTY);
                    done();
                });
            })
        });
    });
});


describe('Blockchain: guardar estado', () => {


    it('Ejecutar smartContract', (done) => {


        var gameInfo = chainService.createGame(testgameId, [{
            name: testPlayerName,
            id: testPlayerId
        }]);
        var playerInfo = getPlayerDataById(testPlayerId, gameInfo);
        var townHawll = gameInfo.townHall;
        
        let actionData = {
            targetPublicKey: townHawll.account.publicKey,
            elementType: GAME_CONSTANTS.TYPE_TERRAIN,
            elementIndex: testElementIndex,
            price: testElementPrice
        }

        startMoney = playerInfo.money;
        expect(playerInfo.name).to.equals(testPlayerName);

        chainFacade.handleAction(testgameId, GAME_CONSTANTS.ACTION_ELEMENT_BUY, playerInfo.account, actionData).then((result) => {
            let playerLastInfo = getPlayerDataById(testPlayerId, result);
            expect(playerLastInfo.money).to.equals(startMoney - testElementPrice);
            expect(result.terrains[testElementIndex].owner == playerLastInfo.account.publicKey);
            done();
        });
    });

    it('Finalizar turno', (done) => {


        var result = chainFacade.endPlayerTurn(testgameId, testPlayerId);
        // return {allPlayersReady : true, newTurnData : newTurn};
        expect( result.allPlayersReady ).to.equal( true );
        let playerLastInfo = getPlayerDataById(testPlayerId, result.newTurnData); 
        //Dinero antes de la compra - precio de la compra - precio de impuestos por 2 terrenos
        expect(playerLastInfo.money).to.equals(startMoney - testElementPrice - 200);
        done();
    });
    
    it('Guardar estado', (done) => {

        it('Creación de una partida', (done) => {
            
            chainService.createGame(testgameId, [{
                name: testPlayerName,
                id: testPlayerId
            }]);
            let game = chainService.getGameState(testgameId);
            for(let key in game.players){
                if(game.players[key].id == testPlayerId){
                    done();
                }
            }
        });
        done();
    });

    it('Blockchain: crear partida', (done) => {

            
            chainService.createGame(testgameId, [{
                name: testPlayerName,
                id: testPlayerId
            }]);
                     
 
            let game = chainService.getGameState(testgameId);
            for(let key in game.players){
                if(game.players[key].id == testPlayerId){
                    done();
                }
            }

   
   
    });
    it('Blockchain: crear partida', (done) => {

        var newtestgameId  = testgameId +1;
        var gameInfo = chainService.createGame(newtestgameId, [{
            name: testPlayerName,
            id: testPlayerId
        }]);

        // var playerInfo = getPlayerDataById(testPlayerId, gameInfo);
        var townHawll = gameInfo.townHall;

        for(let i=0; i<6;i++){
            let transaction =new Transaction(townHawll.account.publicKey,chainService.villages[testgameId].getInfo() )
            transaction.signTransaction(townHawll.account.publicKey, townHawll.account.privateKey);
            chainService.addTransaction(newtestgameId, transaction);
        }
        expect(chainService.blockchains[newtestgameId].getLength()).to.equals(2);

        done();
    });


});




function getPlayerDataById(id, gameData) {
    for (var key in gameData.players) {
        if (gameData.players[key].id == id) {
            return gameData.players[key];
        }
    }
}


function joinRoom(roomId, callback) {
    var roomService = webServer.service.getRoomService();
    var testRoom = roomService.getRoom(roomId);
    agent.post('room/join').send({
        rType: testRoom.roomType,
        rId: testRoom.roomId
    }).end(function (err, res) {
        callback(err, res, agent)
    });
}
