import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss']
})
export class SettingsPage implements OnInit {
  motorsSpeed: number = 0;

  ngOnInit() {
    this.websocketService.listenForEvent('message').subscribe((response: any) => {
      if (response.error) {
        console.log('Message from server:', response);
        this.showToast(response.error, 'warning');
      }
    });
  }

  constructor(private toastController: ToastController,
    private websocketService: WebsocketService) { }
  
  pinFormatter(value: number) {
    return `${value*10}%`;
  }

  onSpeedChange() {
    this.websocketService.sendEvent('set_motors_speed', { speed: this.motorsSpeed });
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
