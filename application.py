import os
from datetime import timedelta

from flask import Flask, render_template, request, session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY") or 'you-will-never-guess'
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=100*365)
socketio = SocketIO(app)


@app.route("/")
def index():
    if "username" in session:
        return render_template("index.html", username=session["username"])

    username = request.args.get("username")
    if username:
        session["username"] = username
        session.permanent = True
    return render_template("index.html", username=username)

if __name__ == "__main__":
    app.run(debug=True)
