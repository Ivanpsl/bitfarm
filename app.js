var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var port = 3001 || process.env.PORT;


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var server =  require('http').Server(app); 
var sio = require('socket.io')(server);
var players = {};
var numPlayers = 0;
var textChats = {};
var textNumers = 0;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/server', express.static(__dirname + '/public'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


server.listen(port, () => {

  console.log("Express Listening at http://localhost:" + port);

});


sio.on('connection', function(socket){
  console.log('[SOCKETS] Usuario conectandose');

  //Crear y enviar informacion de los jugadores

  players[socket.id] = {
    playerId : socket.id,
    money : 100,
    name : "Desconocido " + numPlayers
  }

  numPlayers = numPlayers + 1;

  socket.emit('currentPlayers', players);
  socket.emit('currentChat',textChats);
  
  socket.broadcast.emit('newPlayer',players[socket.id]);
  
  socket.on('disconnect', function() {
      console.log('[SOCKETS] Usuario desconectandose');
  });

  socket.on('sendMessage',function(textInfo){
    textChats[textNumers] = {
      authorId : socket.id,
      text : textInfo
    }

    textNumers = textNumers+1;

    socket.broadcast.emit('newText',textInfo);
  });

});
