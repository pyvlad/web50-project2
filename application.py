import os
from datetime import timedelta

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY") or 'you-will-never-guess'
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    socketio.run(app)   # socketio.run() function encapsulates the start up of the web server
