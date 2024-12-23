import RPi.GPIO as GPIO
import threading
import time


class Motors:
    def __init__(self, timeout: int = 5) -> None:
        self.timeout = timeout
        self.last_update: float = time.time()
        self.keep_alive: bool = True

        self.left_motor_forward_pin: int = 18
        self.left_motor_backward_pin: int = 17
        self.right_motor_forward_pin: int = 27
        self.right_motor_backward_pin: int = 22
        self.water_sensor_pin: int = 23

        self.left_motor_forward_pwm: GPIO.PWM = None
        self.left_motor_backward_pwm: GPIO.PWM = None
        self.right_motor_forward_pwm: GPIO.PWM = None
        self.right_motor_backward_pwm: GPIO.PWM = None

        self.setup()

    def setup(self) -> None:
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.left_motor_forward_pin, GPIO.OUT)
        GPIO.setup(self.left_motor_backward_pin, GPIO.OUT)
        GPIO.setup(self.right_motor_forward_pin, GPIO.OUT)
        GPIO.setup(self.right_motor_backward_pin, GPIO.OUT)
        GPIO.setup(self.water_sensor_pin, GPIO.IN)

        if self.left_motor_forward_pwm is None:
            self.left_motor_forward_pwm = GPIO.PWM(
                self.left_motor_forward_pin, 100
            )
            self.left_motor_backward_pwm.start(0)

        if self.left_motor_backward_pwm is None:
            self.left_motor_backward_pwm = GPIO.PWM(
                self.left_motor_backward_pin, 100
            )
            self.left_motor_backward_pwm.start(0)

        if self.right_motor_forward_pwm is None:
            self.right_motor_forward_pwm = GPIO.PWM(
                self.right_motor_forward_pin, 100
            )
            self.right_motor_forward_pwm.start(0)

        if self.right_motor_backward_pwm is None:
            self.right_motor_backward_pwm = GPIO.PWM(
                self.right_motor_backward_pin, 100
            )
            self.right_motor_backward_pwm.start(0)

    def cleanup(self) -> None:
        if self.left_motor_forward_pwm is not None:
            self.left_motor_forward_pwm.stop()

        if self.left_motor_backward_pwm is not None:
            self.left_motor_backward_pwm.stop()

        if self.right_motor_forward_pwm is not None:
            self.right_motor_forward_pwm.stop()

        if self.right_motor_backward_pwm is not None:
            self.right_motor_backward_pwm.stop()

        GPIO.cleanup()

    def set_speeds(self, left_speed: int, right_speed: int) -> None:
        self._update_activity()

        if left_speed >= 0:
            self.left_motor_forward_pwm.ChangeDutyCycle(left_speed)
            self.left_motor_backward_pwm.ChangeDutyCycle(0)
        else:
            self.left_motor_forward_pwm.ChangeDutyCycle(0)
            self.left_motor_backward_pwm.ChangeDutyCycle(-left_speed)

        if right_speed >= 0:
            self.right_motor_forward_pwm.ChangeDutyCycle(right_speed)
            self.right_motor_backward_pwm.ChangeDutyCycle(0)
        else:
            self.right_motor_forward_pwm.ChangeDutyCycle(0)
            self.right_motor_backward_pwm.ChangeDutyCycle(-right_speed)

    def stop(self) -> None:
        self.set_speeds(0, 0)

    def is_boat_submerged(self) -> bool:
        return GPIO.input(self.water_sensor_pin) == GPIO.HIGH

    def start_keep_alive(self) -> None:
        self.keep_alive = True
        self._keep_alive_thread = threading.Thread(target=self._keep_alive)
        self._keep_alive_thread.daemon = True
        self._keep_alive_thread.start()

    def stop_keep_alive(self) -> None:
        self.keep_alive = False
        self._keep_alive_thread.join()

    def _update_activity(self) -> None:
        self.last_update = time.time()

    def _keep_alive(self) -> None:
        while self.keep_alive:
            if time.time() - self.last_update > self.timeout:
                self.stop()
            time.sleep(1)
