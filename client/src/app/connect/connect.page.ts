import { Component, OnInit } from '@angular/core';
import { Hotspot } from '@ionic-native/hotspot/ngx';
import { ToastController } from '@ionic/angular';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-connect',
  templateUrl: 'connect.page.html',
  styleUrls: ['connect.page.scss']
})
export class ConnectPage {
  isConnecting: boolean = false;
  isTesting: boolean = false;

  ngOnInit() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.addEventListener('change', (mediaQuery) => this.initializeDarkPalette(mediaQuery.matches));
  }

  constructor(
    private hotspot: Hotspot,
    private toastController: ToastController,
    private httpClient: HttpClient
  ) { }

  initializeDarkPalette(isDark: boolean) {
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
  }

  async connectToHotspot() {
    this.isConnecting = true;
    try {
      await this.hotspot.connectToWifi(environment.serverSSID, environment.serverPassword);
      this.showToast('Connected to Raspberry Pi Hotspot', 'success');
    } catch (error) {
      console.error('Error connecting to hotspot:', error);
      this.showToast('Error connecting to hotspot: ' + error, 'danger');
    } finally {
      this.isConnecting = false;
    }
  }

  async testConnection() {
    this.isTesting = true;
    this.httpClient.get(environment.socketUrl, { responseType: 'text' }).subscribe({
      next: response => {
        console.log('Response:', response);
        this.showToast('Connection successful: ' + response, 'success');
        this.isTesting = false;
      },
      error: error => {
        console.error('Error:', error);
        this.showToast('Connection failed: ' + error.message, 'danger');
        this.isTesting = false;
      },
      complete: () => {
        console.log('Request complete');
      }
    });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top',
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
