from flask import Flask
from flask_socketio import SocketIO, send
from flask_cors import CORS
from typing import Dict

from gps import GPS
from motors import Motors

import threading

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
gps = GPS()
motors = Motors()


@app.route("/")
def index() -> str:
    return "Boat Server is running."


@socketio.on("joystick")
def handle_joystick(data: Dict[str, float]) -> None:
    try:
        message = motors.set_course(data["x"], data["y"])
        print(message)
        send(message, broadcast=True)
    except RuntimeError as e:
        print(e)
        send({"error": "Please setup motors first"}, broadcast=True)


@socketio.on("motors_emergency_stop")
def handle_motors_emergency_stop() -> None:
    motors.stop()
    print("Motors emergency Stop")
    send("Motors emergency Stop", broadcast=True)


@socketio.on("set_motors_speed")
def handle_set_motors_speed(data: Dict[str, int]) -> None:
    motors.set_speed(data["speed"])
    print(f"Set Motors Speed: {data['speed']}")
    send(data, broadcast=True)


def send_gps_data() -> None:
    gps.start()
    while True:
        data = gps.get_data()
        socketio.emit("boat_position", data.get_struct(), namespace="/")
        socketio.sleep(1)


if __name__ == "__main__":
    try:
        motors.start_keep_alive()
        gps_thread = threading.Thread(target=send_gps_data)
        gps_thread.daemon = True
        gps_thread.start()
        socketio.run(
            app, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True
        )
    finally:
        gps_thread.join()
        gps.stop()
        motors.cleanup()
        motors.stop_keep_alive()
