/* eslint-disable no-undef */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" 
process.env.NODE_ENV = 'test'

let fs = require('fs');
let FarmChainService = require("../blockchain/farmChainService");
let WebServer = require("../webServer/webServer")
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
        "logger" : null
    });
    webServer.init(httpCertificates, chainService.getFacade());
    chainService.startNode();

    agent = chai.request.agent(webServiceUrl);
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