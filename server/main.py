from flask import Flask
from flask_socketio import SocketIO, send
from flask_cors import CORS
from typing import Dict

from gps import GPS, GPSData
from motors import Motors
from navigation import Navigation

import threading
import time
import random

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
gps = GPS(average_data=True, simulation=True)
motors = Motors()
navigation = Navigation(gps, motors, simulation=True)


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
def handle_motors_emergency_stop(data: None) -> None:
    motors.stop()
    print("Motors emergency Stop")
    send("Motors emergency Stop", broadcast=True)


@socketio.on("set_motors_speed")
def handle_set_motors_speed(data: Dict[str, int]) -> None:
    motors.set_speed(data["speed"])
    print(f"Set Motors Speed: {data['speed']}")
    send(data, broadcast=True)


@socketio.on("navigate")
def handle_navigate(data: Dict) -> None:
    data["waypoints"] = [
        GPSData(waypoint["lat"], waypoint["lng"])
        for waypoint in data["waypoints"]
    ]
    print(data["waypoints"])
    navigation.navigate(data["waypoints"], data["current_waypoint"])
    print("Navigation Started")
    send("Navigation Started", broadcast=True)


@socketio.on("pause")
def handle_pause(data: None) -> None:
    navigation.pause()
    print("Navigation Paused")
    send("Navigation Paused", broadcast=True)


@socketio.on("current_waypoint")
def handle_current_waypoint(data: int) -> None:
    navigation.set_current_waypoint(data)
    print(f"Set Current Waypoint: {data}")
    send(data, broadcast=True)


def send_navigation_data() -> None:
    gps.start()
    while True:
        data = gps.get_data()
        print(data.get_struct())
        socketio.emit("boat_position", data.get_struct(), namespace="/")
        if not navigation.is_paused():
            print(navigation.get_current_waypoint())
            socketio.emit(
                "current_waypoint",
                navigation.get_current_waypoint(),
                namespace="/",
            )
        time.sleep(1)


def send_status_data() -> None:
    while True:
        battery_level = round(random.randint(0, 100), 2)
        left_motor_temp = round(random.uniform(20.0, 100.0), 2)
        right_motor_temp = round(random.uniform(20.0, 100.0), 2)
        boat_speed = round(random.uniform(0, 50), 2)
        distance_from_user = round(random.uniform(0, 1000), 2)
        gps_signal_strength = round(random.uniform(0, 100), 2)
        estimated_time_value = estimated_time = (battery_level / 100) * 60
        estimated_time = f"{round(estimated_time_value, 2)} mins" 
        boat_status = "Connected"
        status = {
            "batteryLevel": battery_level,
            "leftMotorTemp": left_motor_temp,
            "rightMotorTemp": right_motor_temp,
            "boatSpeed": boat_speed,
            "gpsSignalStrength": gps_signal_strength,
            "distanceFromUser": distance_from_user,
            "estimatedTime": estimated_time,
            "boatStatus": boat_status
        }
        print(status)
        socketio.emit("status_update", status, namespace="/")
        time.sleep(5)


if __name__ == "__main__":
    try:
        motors.start_keep_alive()
        navigation_thread = threading.Thread(target=send_navigation_data)
        navigation_thread.daemon = True
        navigation_thread.start()

        status_thread = threading.Thread(target=send_status_data)
        status_thread.daemon = True
        status_thread.start()

        socketio.run(
            app, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True
        )
    finally:
        navigation_thread.join()
        status_thread.join()
        gps.stop()
        motors.cleanup()
        motors.stop_keep_alive()
