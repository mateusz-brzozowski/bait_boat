import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { JoystickEvent } from 'ngx-joystick';
import { JoystickManagerOptions } from 'nipplejs';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-control',
  templateUrl: 'control.page.html',
  styleUrls: ['control.page.scss']
})
export class ControlPage implements OnInit {
  staticOptions: JoystickManagerOptions = {
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: "#286ee9",
  };

  ngOnInit() {
    this.websocketService.listenForEvent('message').subscribe((response: any) => {
      if (response.error) {
        console.log('Message from server:', response);
        this.showToast(response.error, 'warning');
      }
    });

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.addEventListener('change', (mediaQuery) => this.initializeDarkPalette(mediaQuery.matches));
  }

  constructor(private websocketService: WebsocketService,
    private toastController: ToastController
  ) {}

  initializeDarkPalette(isDark: boolean) {
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
  }

  async onMove(event: JoystickEvent) {
    if (event.data.vector) {
      try {
        console.log('Joystick moved', event.data.vector);
        await this.websocketService.sendEvent('joystick', event.data.vector);
      } catch (error) {
        console.error('Error sending joystick data:', error);
        this.showToast('Error sending joystick data: ' + error, 'warning');
      }
    }
  }

  onEnd() {
    console.log('Joystick released');
    this.websocketService.sendEvent('joystick', { x: 0, y: 0 });
  }

  emergencyStop() {
    console.log('Motors emergency stop');
    this.websocketService.sendEvent('motors_emergency_stop');
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top',
      positionAnchor: 'header',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }
}
