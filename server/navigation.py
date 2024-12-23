from gps import GPS, GPSData
from motors import Motors
from typing import Dict, List

import time
import math


class Navigation:
    def __init__(
        self, gps: GPS, motors: Motors, simulation: bool = False
    ) -> None:
        self.gps = gps
        self.motors = motors
        self.simulation = simulation
        self.current_waypoint: int = 0
        self.waypoints: List[GPSData] = []
        self.paused: bool = True

    def navigate(
        self, waypoints: List[GPSData], current_waypoint: int
    ) -> None:
        self.waypoints = waypoints
        self.current_waypoint = current_waypoint
        self.paused = False

        if self.simulation and self.gps.get_data().Lat == 0:
            self.gps.set_position(
                waypoints[current_waypoint].Lat + 0.0001,
                waypoints[current_waypoint].Lon
            )

        while self.current_waypoint < len(self.waypoints):
            if self.paused:
                return
            current_position = self.gps.get_data()
            target_waypoint = self.waypoints[self.current_waypoint]
            distance = self._calculate_distance(
                current_position, target_waypoint
            )
            print(distance)
            if distance < 10:
                self.current_waypoint += 1
                if self.current_waypoint >= len(self.waypoints):
                    self.motors.stop()
                    break

            course = self._calculate_course(current_position, target_waypoint)
            self.motors.set_course(course["x"], course["y"])
            if self.simulation:
                self.gps.set_position(
                    current_position.Lat + course["x"] * 0.00004,
                    current_position.Lon + course["y"] * 0.00004,
                )
            time.sleep(1)

    def pause(self) -> None:
        self.paused = True

    def is_paused(self) -> bool:
        return self.paused

    def get_current_waypoint(self) -> int:
        return self.current_waypoint

    def set_current_waypoint(self, current_waypoint) -> None:
        self.current_waypoint = current_waypoint

    def _calculate_distance(
        self, position1: GPSData, position2: GPSData
    ) -> float:
        R = 6371e3
        phi1 = math.radians(position1.Lat)
        phi2 = math.radians(position2.Lat)
        delta_phi = math.radians(position2.Lat - position1.Lat)
        delta_lambda = math.radians(position2.Lon - position1.Lon)

        a = (
            math.sin(delta_phi / 2) ** 2
            + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        distance = R * c
        return distance

    def _calculate_course(
        self, current_position: GPSData, target_waypoint: GPSData
    ) -> Dict[str, float]:
        delta_lat = target_waypoint.Lon - current_position.Lon
        delta_lon = target_waypoint.Lat - current_position.Lat

        magnitude = math.sqrt(delta_lat**2 + delta_lon**2)
        x = delta_lon / magnitude
        y = delta_lat / magnitude

        return {"x": x, "y": y}
