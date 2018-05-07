import os
import json
from datetime import timedelta, datetime

from flask import Flask, render_template
from flask_socketio import SocketIO, emit, send, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY") or 'you-will-never-guess'
socketio = SocketIO(app)


MAX_MESSAGES = 5
CHANNELS = {}

# ROUTES
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/channels")
def channels():
    return render_template("channels.html")


# SOCKETS
@socketio.on('connect')
def send_channel_list():
    emit('channels-display-all', list(CHANNELS.keys()) )

@socketio.on('channels-new')
def create_channel(data):
    global CHANNELS
    channel = data["channel"]
    if channel and channel not in CHANNELS:
        CHANNELS[channel] = []
        emit('channels-display-new', channel, broadcast=True)
        print(f"new channel {channel} created")
    else:
        print(f"{channel}: bad or existing channel name")


@socketio.on('channels-join')
def on_join(data):
    username = data['username']
    channel = data['channel']
    join_room(channel)
    emit('channels-on-join', {"channel": channel, 'messages': CHANNELS.get(channel, [])})
    print(f'{username} has entered the room {channel}.')
    # send(username + ' has entered the room.', room=channel)

@socketio.on('messages-new')
def new_message(data):
    global CHANNELS
    channel = data["channel"]
    message = {
        "author": data["username"],
        "message": data["message"],
        "timestamp": datetime.utcnow().ctime()}
    while len(CHANNELS[channel]) >= MAX_MESSAGES:
        (CHANNELS[channel]).pop(0)
    CHANNELS[channel] += [message]
    emit('messages-display-new', message, room=channel)

@socketio.on('channels-leave')
def on_leave(data):
    username = data['username']
    channel = data['channel']
    leave_room(channel)
    print(f'{username} has left the room {channel}.')
    # send(username + ' has left the room.', room=channel)



if __name__ == "__main__":
    socketio.run(app)   # socketio.run() function encapsulates the start up of the web server
