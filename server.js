
var express = require('express');

var app = express();
var server = app.listen(4000);

app.use(express.static('public'));

console.log("My socket server is running");

var io = require('socket.io').listen(server);

// var io = socket(server);

io.sockets.on('connection', newConnection);

var connections = 0;

function newConnection(socket) {
  console.log('new connection ' + socket.id);
  console.log("number of connections: " + connections);
  connections++;
  

  socket.on('disconnect', disconnected);
  function disconnected() {
    console.log("number of connections: " + connections);
    connections--;
    console.log(socket.id + ' disconnected');
  }
}
