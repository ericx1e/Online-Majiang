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
let socketRooms = new Map();
let totalTiles = new Map();
let playedTiles = new Map();

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
      socketRooms.set(socket.id, room);
      socket.emit('created', room);
      totalTiles.set(room, []);
      playedTiles.set(room, []);
    } else if (numClients < 4) {
      socket.emit('joined', room, rooms.get(room));
      let temp = rooms.get(room);
      temp.push(socketNames.get(socket.id));
      rooms.set(room, temp);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socketRooms.set(socket.id, room);
      io.to(room).emit('otherjoined', socketNames.get(socket.id));
      io.to(room).emit('whosturn', rooms.get(room)[turns.get(room)]);
      if (numClients == 1) {
        isPlaying.set(room, true);
        let pieceNames = ['m', 'p', 's'];
        let extraPieceNames = ['dg', 'dr', 'dw', 'we', 'wn', 'ws', 'ww'];

        pieceNames.forEach((item, i) => {
          for (var n = 1; n <= 9; n++) {
            for (var i = 0; i < 4; i++) {
              totalTiles.get(room).push(item + n);
            }
          }
        });

        extraPieceNames.forEach((item, i) => {
          for (var i = 0; i < 4; i++) {
            totalTiles.get(room).push(item);
          }
        });
        io.to(room).emit('startgame');
        io.to(room).emit('whosturn', rooms.get(room)[turns.get(room)]);
      }
    } else {
      socket.emit('full', room);
    }
    // socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
    // socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
  });

  socket.on('turn', (room, tileId) => {
    if (!isPlaying.get(room)) {
      return;
    }
    playedTiles.get(room).push(tileId);
    io.to(room).emit('playedtile', socketNames.get(socket.id), tileId);
    let n = turns.get(room);
    n++;
    if (n > 1) {
      n = 0;
    }
    turns.set(room, n);
    io.to(room).emit('whosturn', rooms.get(room)[turns.get(room)]);
  });

  socket.on('requesttile', (room) => {
    let tiles = totalTiles.get(room);
    let randI = Math.floor(Math.random() * tiles.length);
    io.to(room).emit('givetile', socketNames.get(socket.id), tiles[randI]);
    totalTiles.get(room).splice(randI, 1);
  });

  socket.on('pong', (room, tileId) => {
    io.to(room).emit('pong', socketNames.get(socket.id), tileId);
  });

  socket.on('disconnect', () => {
    console.log("number of connections: " + connections);
    connections--;
    console.log(socket.id + ' disconnected');
    console.log("number of connections: " + connections);
    let name = socketNames.get(socket.id);
    rooms.forEach((room, i) => {
      if (room.includes(name)) {
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
