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
  d = new Date()
  if (m != d.getMinutes()) {
    m = d.getMinutes();
    $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
  }
}

var isUserMessage = true; // Start with the user's message on the right

function insertMessage() {
  const msg = $('.message-input').val();
  if ($.trim(msg) == '') {
    return false;
  }

  // Append the message to the chat container
  const messageClass = 'message';
  $('<div class="' + messageClass + '"><div class="message-text">' + msg + '</div></div>').appendTo($('.mCSB_container'));
  setDate();
  updateScrollbar();

  // Send the message to the server
  socket.emit('chat message', msg);

  // Clear the chat input after sending
  $('.message-input').val('');
}

$('.message-submit').click(function() {
  insertMessage();
});

$(window).on('keydown', function(e) {
  if (e.which == 13) {
    insertMessage();
    return false;
  }
});

// Initialize the Socket.IO client
var socket = io();

// Receive and display messages from the server
socket.on('chat message', function(msg) {
  // Determine whether to display the message on the right or left
  const messageClass = isUserMessage ? 'message' : 'message new response-blue';
  
  // Append the message with the appropriate class
  $('<div class="' + messageClass + '"><div class="message-text">' + msg + '</div></div>').appendTo($('.mCSB_container'));
  setDate();
  updateScrollbar();

  // Toggle the isUserMessage variable for the next message
  isUserMessage = !isUserMessage;
});










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