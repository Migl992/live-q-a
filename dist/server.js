const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
let block = false;

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle messages from clients
  socket.on('chat message', (msg) => {
    if (!block) {
        console.log('Message received: ' + msg);
        // Broadcast the message to all connected clients except the sender
        socket.broadcast.emit('chat message', msg);
    }
  });
  socket.on('title', (title) => {
    console.log('title received: ' + title);
    // Broadcast the message to all connected clients except the sender
    socket.broadcast.emit('title', title);
  });
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
  //one message on
  socket.on('block', () => {
    block = !block;
    console.log('Block mode ' + (block ? 'enabled' : 'disabled'));
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

