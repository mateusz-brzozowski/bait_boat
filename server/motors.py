import RPi.GPIO as GPIO


class Motors:
    def __init__(self) -> None:
        self.left_motor_forward_pin: int = 18
        self.left_motor_backward_pin: int = 17
        self.right_motor_forward_pin: int = 27
        self.right_motor_backward_pin: int = 22
        self.water_sensor_pin: int = 23

        self.left_motor_forward_pwm: GPIO.PWM = None
        self.left_motor_backward_pwm: GPIO.PWM = None
        self.right_motor_forward_pwm: GPIO.PWM = None
        self.right_motor_backward_pwm: GPIO.PWM = None

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

    def is_boat_submerged(self) -> bool:
        return GPIO.input(self.water_sensor_pin) == GPIO.HIGH
