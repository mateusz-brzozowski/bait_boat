import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { WebsocketService } from '../services/websocket.service';
import { DarkModeService } from '../services/dark-mode.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss']
})
export class SettingsPage implements OnInit {
  motorsSpeed: number = 0;
  darkPaletteToggle = false;
  highContrastPaletteToggle = false;
  boatSSID: string = '';
  boatPassword: string = '';

  async ngOnInit() {
    this.websocketService.listenForEvent('message').subscribe((response: any) => {
      if (response.error) {
        console.log('Message from server:', response);
        this.showToast(response.error, 'warning');
      }
    });

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const prefersHighContrast = window.matchMedia('(prefers-contrast: more)');
    this.initializeHighContrastPalette(prefersHighContrast.matches);
    prefersDark.addEventListener('change', (mediaQuery) => this.initializeDarkPalette(mediaQuery.matches));
    prefersHighContrast.addEventListener('change', (mediaQuery) =>
      this.initializeHighContrastPalette(mediaQuery.matches)
    );

    await this.storage.create();
    this.boatSSID = (await this.storage.get('boatSSID')) || '';
    this.boatPassword = (await this.storage.get('boatPassword')) || '';
  }

  constructor(private toastController: ToastController,
    private websocketService: WebsocketService,
    private darkModeService: DarkModeService,
    private storage: Storage) { }


  async saveSettings() {
    await this.storage.set('boatSSID', this.boatSSID);
    await this.storage.set('boatPassword', this.boatPassword);
    this.showToast('Settings saved successfully', 'success');
  }

  pinFormatter(value: number) {
    return `${value*10}%`;
  }

  onSpeedChange() {
    this.websocketService.sendEvent('set_motors_speed', { speed: this.motorsSpeed });
  }

  initializeDarkPalette(isDark: boolean) {
    this.darkPaletteToggle = isDark;
    this.toggleDarkPalette(isDark);
  }

  initializeHighContrastPalette(isHighContrast: boolean) {
    this.highContrastPaletteToggle = isHighContrast;
    this.toggleHighContrastPalette(isHighContrast);
  }

  darkPaletteToggleChange(ev: any) {
    this.toggleDarkPalette(ev.detail.checked);
  }

  highContrastPaletteToggleChange(ev: any) {
    this.toggleHighContrastPalette(ev.detail.checked);
  }

  toggleDarkPalette(isDark: boolean) {
    this.darkModeService.toggleDarkMode(isDark);
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
  }

  toggleHighContrastPalette(shouldAdd: boolean) {
    document.documentElement.classList.toggle('ion-palette-high-contrast', shouldAdd);
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
