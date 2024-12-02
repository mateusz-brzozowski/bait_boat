from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index() -> str:
    return "Boat Server is running."

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)