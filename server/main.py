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
motors_speed = 0.1


@app.route("/")
def index() -> str:
    return "Boat Server is running."


@socketio.on("joystick")
def handle_joystick(data: Dict[str, float]) -> None:
    x = data["x"]
    y = data["y"]
    try:
        if motors.is_boat_submerged():
            left_motor_speed = max(min(y - x, 1), -1) * 100 * motors_speed
            right_motor_speed = max(min(y + x, 1), -1) * 100 * motors_speed
            motors.set_speeds(left_motor_speed, right_motor_speed)
            print("Joystick: " + str(data))
            send(data, broadcast=True)
        else:
            motors.stop()
            print("Boat is not submerged")
            send({"error": "Boat is not submerged"}, broadcast=True)
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
    global motors_speed
    motors_speed = data["speed"] / 10
    print(f"Set Motors Speed: {motors_speed}")
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
