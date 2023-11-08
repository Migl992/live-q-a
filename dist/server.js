const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
let block = false;
const messages = [];
const messageTimeout = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Initialize the slow down state to false
let isSlowDownActive = false;
let lastMessageTimestamp = 0;
const slowDownStates = {};

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Initialize the slowdown state for this user
  slowDownStates[socket.id] = {
    isSlowDownActive: false,
    lastMessageTimestamp: 0,
  };
  // Send existing messages to the new user
  socket.emit('load messages', messages);

  // Handle messages from clients
  socket.on('chat message', (msg) => {
    const userSlowDownState = slowDownStates[socket.id];
    
    if (userSlowDownState.isSlowDownActive) {
      const currentTime = Date.now();
      if (currentTime - userSlowDownState.lastMessageTimestamp < 30000) { // 30 seconds
        socket.emit('slow down message', 'Please wait 30 seconds before sending another message.');
        return;
      }

      userSlowDownState.lastMessageTimestamp = currentTime;
    }

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

  //delete messages
  socket.on('delete messages', () => {
  if (!block) {
      // Delete all messages in the array
      messages.length = 0;

      // Broadcast the action to all connected clients
      io.emit('messages deleted');

      // Emit a reload event to the client page
      io.emit('reload client');
  }
  });

  // Handle the "activate slow down" action from the admin
  socket.on('toggle slow down', () => {
    const userSlowDownState = slowDownStates[socket.id];
    userSlowDownState.isSlowDownActive = !userSlowDownState.isSlowDownActive; // Toggle the slow down state
    console.log("is slow down active", userSlowDownState.isSlowDownActive);
    // Broadcast the action to all connected clients
    io.emit('slow down state', userSlowDownState.isSlowDownActive);
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

