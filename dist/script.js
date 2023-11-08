
// Initialize the Socket.IO client
var socket = io();


var $messages = $('.messages-content'),
    d, h, m,
    i = 0;

$(window).load(function() {
    $messages.mCustomScrollbar();
});

function updateScrollbar() {
    $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
        scrollInertia: 10,
        timeout: 0
    });
}

function setDate() {
    d = new Date();
    if (m != d.getMinutes()) {
        m = d.getMinutes();
        $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
    }
}

var isSlowDownActive = false;
var canSendMessage = true;

$('.message-submit').click(function() {
    const msg = $('.message-input').val();
    if ($.trim(msg) == '') {
        return false;
    }

    // Check if slow down is active
    if (isSlowDownActive && !canSendMessage) {
        alert('Slow down is active. You can send a message evry 30 seconds');
        return false;
    }

    canSendMessage = false;
    setTimeout(enableSendMessage, 30000); // Re-enable messaging after 30 seconds

    insertMessage(msg, true); // Display user message on the right
    // Send the message to the server
    socket.emit('chat message', msg);
    // Clear the chat input after sending
    $('.message-input').val('');
});

$(window).on('keydown', function(e) {
    if (e.which == 13) {
        const msg = $('.message-input').val();
        if ($.trim(msg) == '') {
            return false;
        }
        // Check if slow down is active
        if (isSlowDownActive && !canSendMessage) {
            alert('Slow down is active. You can send a message evry 30 seconds');
            return false;
        }

        canSendMessage = false;
        setTimeout(enableSendMessage, 30000); // Re-enable messaging after 30 seconds

        insertMessage(msg, true); // Display user message on the right
        // Send the message to the server
        socket.emit('chat message', msg);
        // Clear the chat input after sending
        $('.message-input').val('');
        return false;
    }
});

$(document).ready(function () {
    // Check if the title is already stored in localStorage
    const storedTitle = localStorage.getItem('adminTitle');
  
    if (storedTitle) {
      // If the title is stored, display it in the chat-title
      insertQuestion(storedTitle);
    }
//admin questions
$('.question-submit').click(function() {
    const title = $('.question-input').val();
    if ($.trim(title) == '') {
        return false;
    }
    insertQuestion(title); // Display title
    // Store the title in localStorage
    localStorage.setItem('adminTitle', title);
    // Send the title to the server
    socket.emit('title', title);
    // Clear the chat input after sending
    $('.question-input').val('');
});

});

//admin one message only
$('.block-messages').click(function() {
    console.log('blockmessage')
    // Send the action to the server
    socket.emit('block');
});

//delete messages
$('.message-delete').click(function() {
    // Send a request to the server to delete messages
    socket.emit('delete messages');
});

//slowdown action
$('.slow-down').click(function() {
    console.log('slowdown');
    // Send the action to the server to activate the slow down
    socket.emit('toggle slow down');
});

// Receive and display messages from the server
socket.on('chat message', function(msg) {
    insertMessage(msg, false); // Display server message on the right
});

// Request existing messages when a new user connects
socket.on('connect', function () {
    socket.emit('request messages');
  });

// Load existing messages
socket.on('load messages', function (msgArray) {
    for (const msg of msgArray) {
      insertMessage(msg.text, false);
    }
});

// Add this code to request existing messages when a new user connects
socket.emit('request messages');

// Receive and display title from the server
socket.on('title', function(newTitle) {
    insertQuestion(newTitle);
});

socket.on('messages deleted', function() {
    // Clear the chat messages on the client-side
    $('.messages-content').empty();
    // Destroy and reinitialize mCustomScrollbar
    updateScrollbar();
    // Reload the page after a brief delay (adjust the delay as needed)
    setTimeout(function() {
        location.reload();
    }, 1000); // Reload the page after 1 second
});

socket.on('reload client', function() {
    // Reload the client page
    location.reload();
}); 

// Listen for the "slow down activated" event from the server
socket.on('slow down state', function(state) {
    isSlowDownActive = state;
});

function enableSendMessage() {
    canSendMessage = true;
}

function insertMessage(message, isUser) {
    // Append the message to the chat container
    const messageClass = isUser ? 'message' : 'message new response-blue';
    $('<div class="' + messageClass + '"><div class="message-text">' + message + '</div></div>').appendTo($('.mCSB_container'));
    //setDate();
    updateScrollbar();
}

function insertQuestion(title) {
    // Append the message to the chat container
    $('.chat-title h1').text(title);
}











/* var Fake = [
  'Hi there, I\'m Fabio and you?',
  'Nice to meet you',
  'How are you?',
  'Not too bad, thanks',
  'What do you do?',
  'That\'s awesome',
  'Codepen is a nice place to stay',
  'I think you\'re a nice person',
  'Why do you think that?',
  'Can you explain?',
  'Anyway I\'ve gotta go now',
  'It was a pleasure chat with you',
  'Time to make a new codepen',
  'Bye',
  ':)'
]

function fakeMessage() {
  if ($('.message-input').val() != '') {
    return false;
  }
  $('<div class="message loading new"><figure class="avatar"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156381/profile/profile-80.jpg" /></figure><span></span></div>').appendTo($('.mCSB_container'));
  updateScrollbar();

  setTimeout(function() {
    $('.message.loading').remove();
    $('<div class="message new"><figure class="avatar"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156381/profile/profile-80.jpg" /></figure>' + Fake[i] + '</div>').appendTo($('.mCSB_container')).addClass('new');
    setDate();
    updateScrollbar();
    i++;
  }, 1000 + (Math.random() * 20) * 100);

} */