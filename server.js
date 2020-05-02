
var express = require('express');

var app = express();
var server = app.listen(4000);

app.use(express.static('public'));

console.log("My socket server is running");

var io = require('socket.io').listen(server);

// var io = socket(server);

let rooms = new Map();

io.sockets.on('connection', (socket) => {
  console.log('new connection ' + socket.id);
  connections++;
  console.log("number of connections: " + connections);

  socket.on("joinRoom", (room) => {
    socket.join(room);
  });

  socket.on('create or join', function(room)
     {
         // numClients = io.of('/').in(room).clients;
         let numClients;
         if(rooms.get(room) == undefined) {
           numClients = 0;
         } else {
           numClients = rooms.get(room);
         }
         console.log("user joining the room");
         console.log(numClients);

         if (numClients === 0)
         {
           rooms.set(room, 1);
             socket.join(room);
             socket.emit('created', room);
         }
         else if (numClients == 1)
         {
           rooms.set(room, 2);
             io.sockets. in (room).emit('join', room);
             socket.join(room);
             socket.emit('joined', room);
         }
         else
         {
             socket.emit('full', room);
         }
         // socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
         // socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
  });

  socket.on('disconnect', () => {
    console.log("number of connections: " + connections);
    connections--;
    console.log(socket.id + ' disconnected');
    console.log("number of connections: " + connections);
  });
});

function numClientsInRoom(namespace, room) {
    var clients = io.nsps[namespace].adapter.rooms[room];
    return Object.keys(clients).length;
}


var connections = 0;

function newConnection(socket) {
}
