const express = require('express');
const session = require('express-session');
const createError = require('http-errors');
const path = require('path');
// const cookieParser = require('cookie-parser');
const logger = require('morgan');


var port = 3001 || process.env.PORT;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var server =  require('http').Server(app); 

var SocketService = require('./sockets/socketService'); //require('socket.io')(server);
var GameManager = require('./manager/gameManager');

var gManager = new GameManager(this);
var sService = new SocketService(server,gManager);
sService.initServerIo();

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/server', express.static(__dirname + '/public'));



app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  // next(createError(404));
  next();
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.use(session({
  secret: "secrett",
  resave: true,
  saveUninitialized: true
}));

server.listen(port, () => {
  console.log("Express Listening at http://localhost:" + port);

});