import os
import json
from datetime import timedelta

from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY") or 'you-will-never-guess'
socketio = SocketIO(app)


CHANNELS = []


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/channels")
def channels():
    return render_template("channels.html")


@socketio.on('connect')
def send_current_channels():
    emit('all channels', CHANNELS)


@socketio.on('create channel')
def create_channel(data):
    global CHANNELS
    channel = data["channel"]
    if channel not in CHANNELS:
        CHANNELS += [channel]
        emit('new channel', channel, broadcast=True)
        print("new channel {channel} created")
    else:
        print(f"channel {channel} already exists")


# @socketio.on('join')
# def on_join(data):
#     username = data['username']
#     channel = data['channel']
#     join_room(channel)
#     send(username + ' has entered the room.', room=channel)
#
# @socketio.on('leave')
# def on_leave(data):
#     username = data['username']
#     channel = data['channel']
#     leave_room(channel)
#     send(username + ' has left the room.', room=channel)


if __name__ == "__main__":
    socketio.run(app)   # socketio.run() function encapsulates the start up of the web server
