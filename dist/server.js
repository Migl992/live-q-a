const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
let block = false;
const messages = [];
const messageTimeout = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send existing messages to the new user
  socket.emit('load messages', messages);

  // Handle messages from clients
  socket.on('chat message', (msg) => {
    if (!block) {
        console.log('Message received: ' + msg);
        // Add the message to the messages array
        messages.push({ text: msg, timestamp: Date.now() });

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
  // Request existing messages
  socket.on('request messages', () => {
    socket.emit('load messages', messages);
  });

});

// Periodically prune old messages
setInterval(() => {
  const now = Date.now();
  for (let i = messages.length - 1; i >= 0; i--) {
    if (now - messages[i].timestamp > messageTimeout) {
      messages.splice(i, 1);
    }
  }
}, 60000); // Check every minute

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

