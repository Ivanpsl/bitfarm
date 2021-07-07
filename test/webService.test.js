/* eslint-disable no-undef */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" 
process.env.NODE_ENV = 'test'

const {ROOM_CONSTANTS} = require('../src/common/constants');

let fs = require('fs');
let FarmChainService = require("../src/blockchain/farmChainService");
let WebServer = require("../src/webServer/webServer")
let config = require("config");

let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = require('chai').expect;

chai.use(chaiHttp);

const webServiceUrl = 'https://localhost:3000/';
var chainService;
var webServer;
var agent;

before(function() {
    const httpCertificates = {key: fs.readFileSync('certificates/key.pem'), cert: fs.readFileSync('certificates/cert.pem')}
    
    chainService = new FarmChainService(config.get("Blockchain"));

    webServer = new WebServer({
        "run_server" : true,
        "host" : "localhost",
        "port" : 3000,
        "logger" : 0
    });
    webServer.init(httpCertificates, chainService.getFacade());
    chainService.startNode();

    agent = chai.request.agent(webServiceUrl);

    console.log("--------------------- TEST UNITARIOS PARA WEBSERVICE ---------------------");
});

describe('Identificarse: ', () => {
    it('Debe identificarse correctamente', (done) => {
        agent.post('identificarse')
            .send({
                username : "valid_name"
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
                username : " "
            })
            .end(function (err, res) {   
                expect(res.req.path).to.equal("/game/login.html?mensaje=El%20nombre%20de%20usuario%20no%20es%20un%20nombre%20valido&tipoMensaje=alert-danger")
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
            txt : text,
            rId : testRoom.roomId
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
            txt : text,
            rId : testId
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
        var testRoom = roomService.getRoom(2);
        testRoom.addPlayer({id: "1111",name: "fakePlayer",isReady: false});

        joinRoom(testRoom.roomId,(err,res) => {
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
        var testRoom = roomService.getRoom(3);

        joinRoom(testRoom.roomId,(err,res) => {
            expect(res.body.roomInfo.numPlayers).to.equals(roomService.getRoom(testRoom.roomId).players.length)

            agent.get('room/exit').end(function () {
                expect(0).to.equals(testRoom.players.length)
                expect(testRoom.roomStatus).to.equals(ROOM_CONSTANTS.STATUS_EMPTY);
                done();
            });
        })
    });
});


function joinRoom(roomId,callback){
    var roomService = webServer.service.getRoomService();
    var testRoom = roomService.getRoom(roomId);
    agent.post('room/join').send({
        rType: testRoom.roomType,
        rId: testRoom.roomId
    }).end(function (err, res) {
        callback(err,res,agent)
    });
}


// describe('Identificarse: ', () => {
//     it('Debe identificarse correctamente', (done) => {
//         agent.post('identificarse')
//             .send({
//                 username : "valid_name"
//             })
//             .end(function (err, res) {
//                  console.log(res.header)
//                 // console.log(res.headers)

//                 expect(res).to.have.status(200);
//                 // expect(res).to.have.cookie('sessionid');
//                 done();
//             });
//     });

//     it('No debe identificar usuario con nombre invalido', (done) => {
//         agent.post('identificarse')
//             .send({
//                 username : " "
//             })
//             .end(function (err, res) {     
//                 expect(res.redirects[0]).to.include.any.string("mensaje=El%20nombre%20de%20usuario%20no%20es%20un%20nombre%20valido&")
//                 done();
//             });
//     });
// });


// describe('Insert a country: ', () => {
//     it('should insert a country', (done) => {
//         chai.request(url)
//             .post('/country')
//             .send({
//                 id: 0,
//                 country: "Croacia",
//                 year: 2017,
//                 days: 10
//             })
//             .end(function (err, res) {
//                 console.log(res.body)
//                 expect(res).to.have.status(200);
//                 done();
//             });
//     });
// });


// describe('Insert a country with error: ', () => {
//     it('should receive an error', (done) => {
//         chai.request(url)
//             .post('/country')
//             .send({
//                 id: 1,
//                 country: "Madrid",
//                 year: 2010,
//                 days: 10
//             })
//             .end(function (err, res) {
//                 console.log(res.body)
//                 expect(res).to.have.status(500);
//                 done();
//             });
//     });
// });


// describe("FarmChain api", function () {
//     describe("Online", function () {
//         var url = "http://localhost:3000";
//         it("returns status 200", function () {
//             request(url, function (error, response, body) {
//                 expect(response.statusCode).to.equal(200);
//             });
//         });
//     });
// });

// describe("FarmChain api", function () {
//     describe("Online", function () {
//         var url = "http://localhost:3000";
//         it("returns status 200", function () {
//             request(url, function (error, response, body) {
//                 expect(response.statusCode).to.equal(200);
//             });
//         });
//     });
// });
// describe("FarmChain api", function () {
//     describe("Online", function () {
//         var url = "http://localhost:3000";
//         it("returns status 200", function () {
//             request(url, function (error, response, body) {
//                 expect(response.statusCode).to.equal(200);
//             });
//         });
//     });
// });
// describe("FarmChain api", function () {
//     describe("Online", function () {
//         var url = "http://localhost:3000";
//         it("returns status 200", function () {
//             request(url, function (error, response, body) {
//                 expect(response.statusCode).to.equal(200);
//             });
//         });
//     });
// });
// describe("FarmChain api", function () {
//     describe("Online", function () {
//         var url = "http://localhost:3000";
//         it("returns status 200", function () {
//             request(url, function (error, response, body) {
//                 expect(response.statusCode).to.equal(200);
//             });
//         });
//     });
// });
// describe("FarmChain api", function () {
//     describe("Online", function () {
//         var url = "http://localhost:3000";
//         it("returns status 200", function () {
//             request(url, function (error, response, body) {
//                 expect(response.statusCode).to.equal(200);
//             });
//         });
//     });
// });
// describe("FarmChain api", function () {
//     describe("Online", function () {
//         var url = "http://localhost:3000";
//         it("returns status 200", function () {
//             request(url, function (error, response, body) {
//                 expect(response.statusCode).to.equal(200);
//             });
//         });
//     });
// });
// describe("FarmChain api", function () {
//     describe("Online", function () {
//         var url = "http://localhost:3000";
//         it("returns status 200", function () {
//             request(url, function (error, response, body) {
//                 expect(response.statusCode).to.equal(200);
//             });
//         });
//     });
// });
// describe("FarmChain api", function () {
//     describe("Online", function () {
//         var url = "http://localhost:3000";
//         it("returns status 200", function () {
//             request(url, function (error, response, body) {
//                 expect(response.statusCode).to.equal(200);
//             });
//         });
//     });
// });