// set global variables
var username = localStorage.getItem('username');
var last_channel = localStorage.getItem('latest_channel');
var current_channel = (last_channel) ? last_channel : "";
var socket;


document.addEventListener('DOMContentLoaded', () => {
    if (!username) {
      get_username();
    } else {
      // greet user
      var greeting = document.querySelector('#greeting');
      greeting.innerHTML = `Hello, ${username}!`;
      greeting.style.display = "block";

      socket = make_socket();

      // show the channels block
      document.querySelector('#channels-container').style.display = "block";
    };
});



function get_username() {

  var form = document.querySelector('#login-form');
  var form_username = document.querySelector('#login-username');
  var form_submit = document.querySelector('#login-submit');

  form_submit.disabled = true;

  // Enable button only if there is text in the username field
  form_username.onkeyup = () => {
    form_submit.disabled = ((form_username.value.length > 0) ? false : true)
  };

  // Define callback for form submit
  form.onsubmit = () => {
    username = form_username.value;
    localStorage.setItem('username', username);
    window.location.reload(false);
    // form.style.display = "none";
    return false;
  }

  // Show form
  form.style.display = "block";
}




function make_socket() {

  var socket = io.connect('http://' + document.domain + ':' + location.port);

  // on connect, add event handler to form submit button
  socket.on('connect', function(){
      document.querySelector("#channels-form").onsubmit = () => {
          socket.emit("channels-new", {"channel": document.querySelector("#channels-new-input").value});
          document.querySelector("#channels-new-input").value = '';
          return false;
      };

      if (current_channel) {
        socket.emit('channels-join', {
          'username': username,
          'channel': current_channel
        });
    }
  });



  // 1. CHANNEL LIST functionality
  // helper function to leave currently active channel
  function leave_current_channel() {
    if (current_channel !== "") {
      // un-select all channels
      document.querySelectorAll('#channels li').forEach( (li) => {li.className = "channel"} );
      // hide the whole messageboard block
      document.querySelector('#messages-container').style.display = "none";
      // remove last channel name
      document.querySelector('#messages-channel-name').innerHTML = "";
      // remove all messages from last channel
      document.querySelector('#messages').innerHTML = "";
      // ubsubscribe from receiving events for last channel
      socket.emit('channels-leave', {
        'username': username,
        'channel': current_channel
      });
      // set global variable
      current_channel = "";
    }
  }


  function add_channel_to_list(name){
      const li = document.createElement("li");
      li.className = (current_channel === name) ? 'channel-selected' : 'channel';
      li.innerHTML = name;
      li.onclick = function() {
          if (current_channel === name) {
              // leave channel
              leave_current_channel();
              this.className = "channel";
          } else {
              // enter channel
              leave_current_channel();
              current_channel = name;
              this.className = "channel-selected";
              socket.emit('channels-join', {
                'username': username,
                'channel': name
              });
          };
          localStorage.setItem('latest_channel', current_channel);
      };
      document.querySelector('#channels').prepend(li);
  };

  // 1.1. On loading the channels page, receive and display all current channels
  socket.on('channels-display-all', (channels) => { channels.forEach(add_channel_to_list) } );
  // 2.2. When someone creates a new channel, add it to the list of channels
  socket.on('channels-display-new', add_channel_to_list);



  // 2. MESSAGE BOARD Functionality
  function add_message_to_list(data){
    const li = document.createElement("li");
    li.innerHTML = `<span class='msg-timestamp'>${data.timestamp}</span>
                    <span class='msg-author'>${data.author}</span>
                    </br>
                    <span class="msg-body">${data.message}</span>`;
    document.querySelector('#messages').prepend(li);
  };

  // 2.1. On entering a channel, prepare and display the messageboard
  socket.on('channels-on-join', (data) => {
    // display channel name
    document.querySelector('#messages-channel-name').innerHTML = "Channel: " + data.channel;
    // display channel messages
    data.messages.forEach(add_message_to_list);
    // add handler to send a new message
    document.querySelector("#messages-form").onsubmit = () => {
        socket.emit("messages-new", {
          "channel": data.channel,
          "username": username,
          "message": document.querySelector("#messages-new-input").value
        });
        document.querySelector("#messages-new-input").value = '';
        return false;
    };
    // show the whole messageboard block
    document.querySelector('#messages-container').style.display = "block";
  });

  // 2.2. On receiving a new message, add it to the list of messages
  socket.on('messages-display-new', add_message_to_list);

  return socket;

}
