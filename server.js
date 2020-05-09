var express = require('express');

var app = express();
var server = app.listen(4000);

app.use(express.static('public'));

console.log("My socket server is running");

var io = require('socket.io').listen(server);

// var io = socket(server);

let rooms = new Map();
let decks = new Map();
let socketNames = new Map();
let turns = new Map();
let isPlaying = new Map();

io.sockets.on('connection', (socket) => {
  console.log('new connection ' + socket.id);
  connections++;
  console.log("number of connections: " + connections);

  socket.on('new name', (name) => {
    socketNames.set(socket.id, name);
  });

  socket.on('create or join', function(room) {
    // numClients = io.of('/').in(room).clients;
    let numClients;
    if (rooms.get(room) == undefined) {
      numClients = 0;
    } else {
      numClients = rooms.get(room).length;
    }
    console.log("user joining the room");
    console.log(numClients);

    if (numClients === 0) {
      rooms.set(room, [socketNames.get(socket.id)]);
      turns.set(room, 0);
      isPlaying.set(room, false);
      socket.join(room);
      socket.emit('created', room);
    } else if (numClients < 4) {
      socket.emit('joined', room, rooms.get(room));
      let temp = rooms.get(room);
      temp.push(socketNames.get(socket.id));
      rooms.set(room, temp);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      io.to(room).emit('otherjoined', socketNames.get(socket.id));
      io.to(room).emit('whosturn', rooms.get(room)[turns.get(room)]);
      if(numClients == 3) {
        isPlaying.set(room, true);
      }
    } else {
      socket.emit('full', room);
    }
    // socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
    // socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
  });

  socket.on('turn', (room) => {
    if(!isPlaying.get(room)) {
      return;
    }
    let n = turns.get(room);
    n++;
    if(n > 3) {
      n = 0;
    }
    turns.set(room, n);
    io.to(room).emit('whosturn', rooms.get(room)[turns.get(room)]);
  });

  socket.on('disconnect', () => {
    console.log("number of connections: " + connections);
    connections--;
    console.log(socket.id + ' disconnected');
    console.log("number of connections: " + connections);
    let name = socketNames.get(socket.id);
    rooms.forEach((room, i) => {
      if(room.includes(name)) {
        io.to(room).emit('otherleft', name);
        room.splice(room.indexOf(name), 1);
      }
    });
  });
});

function numClientsInRoom(namespace, room) {
  var clients = io.nsps[namespace].adapter.rooms[room];
  return Object.keys(clients).length;
}


var connections = 0;

function newConnection(socket) {}
