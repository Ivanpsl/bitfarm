module.exports = function (app, controller) {

    app.post("/room/join", function (req, res) {
        try {
            controller.joinRoom(req,res);
        } catch (e) {
            res.status(400).send(e.message);
        }
    });


    app.get("/room/create", function (req, res) {
        try {
            controller.createRoom(req,res);
        } catch (e) {
            console.error(e.message)
            res.status(500).send(e.message);
        }
    });

    app.get("/room/exit", function (req, res) {
        try {
            controller.exitRoom(req,res);
        } catch (e) {
            console.error(e.message)
            res.status(500).send(e.message);
        }
    });

    app.get('/room/subscribeChatRoom', function (req, res) {
        try{
            controller.subscribeToRoomEvents(req,res);
        }catch(e){
            res.status(500).send(e.message);
        }
    });

    app.post("/room/setReady", function (req, res) {
        try {
            controller.setPlayerRoomStatus(req,res);
        }
        catch (e) {
            console.error(e.message)
            res.status(500).send(e.message);
        }
    });

    app.post("/room/sendMessage", function (req, res) {
        try {
            controller.responseSendMessage(req,res)
        }
        catch (e) {
            console.error(e.message)
            res.status(500).send(e.message);
        }
    });

}