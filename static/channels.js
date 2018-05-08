var username = localStorage.getItem('username');

var last_channel = localStorage.getItem('latest_channel')
var current_channel = (last_channel) ? last_channel : "";


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



// CHANNEL LIST
function leave_current_channel() {
  if (current_channel !== "") {
    document.querySelectorAll('#channels li').forEach( (li) => {li.className = "channel"} );
    document.querySelector('#messages-container').style.display = "none";
    document.querySelector('#messages-channel-name').innerHTML = "";
    document.querySelector('#messages').innerHTML = "";
    socket.emit('channels-leave', {
      'username': username,
      'channel': current_channel
    });
    current_channel = "";
  }
}


function add_channel_to_list(name){
    const li = document.createElement("li");
    li.className = (current_channel === name) ? 'channel-selected' : 'channel';
    li.innerHTML = name;
    li.onclick = function() {
        if (current_channel === name) {
            leave_current_channel();
            this.className = "channel";
        } else {
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

socket.on('channels-display-all', (channels) => { channels.forEach(add_channel_to_list) } );
socket.on('channels-display-new', add_channel_to_list);



// MESSAGE BOARD
function add_message_to_list(data){
  const li = document.createElement("li");
  li.innerHTML = `<span class='msg-timestamp'>${data.timestamp}</span>
                  <span class='msg-author'>${data.author}</span>
                  </br>
                  <span class="msg-body">${data.message}</span>`;
  document.querySelector('#messages').prepend(li);
};

socket.on('channels-on-join', (data) => {
  document.querySelector('#messages-channel-name').innerHTML = "Channel: " + data.channel;
  document.querySelector("#messages-form").onsubmit = () => {
      socket.emit("messages-new", {
        "channel": data.channel,
        "username": username,
        "message": document.querySelector("#messages-new-input").value
      });
      document.querySelector("#messages-new-input").value = '';
      return false;
  };
  data.messages.forEach(add_message_to_list);
  document.querySelector('#messages-container').style.display = "none";
});
socket.on('messages-display-new', add_message_to_list);
