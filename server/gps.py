from typing import Dict

import threading
import time
import serial


class GPSData:
    def __init__(self, Lon: float, Lat: float) -> None:
        self.Lon = Lon
        self.Lat = Lat

    def get_struct(self) -> Dict[str, float]:
        return {
            "Lon": self.Lon,
            "Lat": self.Lat,
        }


class GPS:
    def __init__(
        self,
        port: str = "/dev/ttyS0",
        baud_rate: int = 9600,
        average_data: bool = False,
    ) -> None:
        self.port = port
        self.baud_rate = baud_rate
        self.average_data = average_data

        self.data: GPSData = GPSData(0, 0)
        self.serial: serial.Serial = serial.Serial(port, baud_rate, timeout=1)
        self.running: bool = False
        self.thread: threading.Thread = threading.Thread(
            target=self._read_data
        )

    def start(self) -> None:
        self.running = True
        self.thread.start()

    def stop(self) -> None:
        self.running = False
        self.thread.join()
        self.serial.close()

    def get_data(self) -> GPSData:
        return self.data

    def _read_data(self) -> None:
        while self.running:
            try:
                if self.average_data:
                    positions = []
                    start_time = time.time()
                    while time.time() - start_time < 1:
                        positions.append(self._parse_data())
                        time.sleep(0.1)
                    if positions:
                        lon = sum([pos.Lon for pos in positions]) / len(
                            positions
                        )
                        lat = sum([pos.Lat for pos in positions]) / len(
                            positions
                        )
                        self.data = GPSData(lon, lat)
                else:
                    self.data = self._parse_data()
                    time.sleep(0.1)
            except Exception as e:
                print(f"Error reading GPS data: {e}")
                time.sleep(1)

    def _parse_data(self) -> GPSData | None:
        line = self.serial.readline().decode("ascii", errors="replace")
        if line.startswith("$GNRMC"):
            data = line.split(",")
            if data[2] == "A":
                lat = self._convert_to_degrees(data[3], data[4])
                lon = self._convert_to_degrees(data[5], data[6])
                return GPSData(lon, lat)
            else:
                print("GPS data is not valid.")

    def _convert_to_degrees(
        self, value: float, direction: chr
    ) -> float | None:
        if not value or not direction:
            return None
        degrees = int(value[:2]) if direction in ["N", "S"] else int(value[:3])
        minutes = (
            float(value[2:]) if direction in ["N", "S"] else float(value[3:])
        )
        decimal_degrees = degrees + (minutes / 60)
        if direction in ["S", "W"]:
            decimal_degrees = -decimal_degrees
        return decimal_degrees


if __name__ == "__main__":
    gps = GPS()
    gps.start()
    try:
        while True:
            print(gps.get_data().get_struct())
            time.sleep(1)
    except KeyboardInterrupt:
        gps.stop()
        print("GPS stopped.")
