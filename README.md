# WPAM24Z

## Requirements

```sh
npm install -g @ionic/cli native-run cordova-res
```

## Create Hotspot on Raspberry Pi

1. Update the system:
    ```sh
    sudo apt-get update
    ```

2. Install the required packages:
    ```sh
    sudo apt-get install hostapd dnsmasq
    ```

3. Run the appropriate script based on your Raspberry Pi model and OS version:

    - If using Raspberry Pi Zero 2 W or Raspberry Pi 4 B with Raspbian Bullseye:
        ```sh
        curl https://raw.githubusercontent.com/MkLHX/AP_STA_RPI_SAME_WIFI_CHIP/master/ap_sta_config2.sh | sudo bash -s -- --ap BaitBoat baitpassword --client {YourSSID} {YourPassword} --country PL
        ```

    - If using Raspberry Pi Zero W, Raspberry Pi 3 B+, or Raspberry Pi 3 A+ with Raspbian Buster:
        ```sh
        curl https://raw.githubusercontent.com/MkLHX/AP_STA_RPI_SAME_WIFI_CHIP/master/ap_sta_config.sh | sudo bash -s -- --ap BaitBoat baitpassword --client {YourSSID} {YourPassword} --country PL
        ```

    **Note:** Replace `{YourSSID}` and `{YourPassword}` with the SSID and password of your Wi-Fi network that connects to the internet. This will ensure that you do not lose SSH access to your Raspberry Pi.

4. Reboot the Raspberry Pi:
    ```sh
    sudo reboot
    ```

For more details, visit: [AP_STA_RPI_SAME_WIFI_CHIP](https://github.com/MkLHX/AP_STA_RPI_SAME_WIFI_CHIP)

## Run application on reboot

To ensure that the Bait Boat Flask Server starts automatically on system reboot, follow these steps:

1. **Create a systemd service file:**
   ```sh
   sudo nano /etc/systemd/system/bait_boat.service
   ```

2. **Add the following configuration to the service file:**
   ```sh
   [Unit]
   Description=Bait Boat Flask Server
   After=network.target

   [Service]
   ExecStart=/usr/bin/python3 /home/{YourUserName}/server/main.py
   WorkingDirectory=/home/{YourUserName}/server
   StandardOutput=inherit
   StandardError=inherit
   Restart=always
   User={YourUserName}

   [Install]
   WantedBy=multi-user.target
   ```

   **Note:** Replace `{YourUserName}` with your own username. You can check your username by running the command:
   ```sh
   whoami
   ```

3. **Reload systemd to recognize the new service:**
   ```sh
   sudo systemctl daemon-reload
   ```

4. **Enable the service to start on boot:**
   ```sh
   sudo systemctl enable bait_boat.service
   ```

5. **Start the service immediately:**
   ```sh
   sudo systemctl start bait_boat.service
   ```