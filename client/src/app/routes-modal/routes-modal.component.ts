import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-routes-modal',
  templateUrl: './routes-modal.component.html',
  styleUrls: ['./routes-modal.component.scss'],
})
export class RoutesModalComponent implements OnInit {
  @Input() waypoints: any[] = [];
  routes: { name: string, waypoints: any[] }[] = [];
  newRouteName: string = '';

  constructor(private modalController: ModalController,
    private storage: Storage,
    private toastController: ToastController) { }

  async ngOnInit() {
    await this.storage.create();
    this.routes = (await this.storage.get('routes')) || [];
  }

  async saveRoute() {
    if (!this.newRouteName.trim()) {
      this.showToast('Route name cannot be empty', 'danger');
      return;
    }

    if (this.waypoints.length < 2) {
      this.showToast('Cannot save route with less than 2 waypoints', 'danger');
      return;
    }

    this.routes.push({ name: this.newRouteName, waypoints: this.waypoints });
    await this.storage.set('routes', this.routes);
    this.newRouteName = '';
    this.showToast('Route saved successfully', 'success');
  }

  async loadRoute(route: { name: string, waypoints: any[] }) {
    await this.modalController.dismiss(route);
  }

  async deleteRoute(route: { name: string, waypoints: any[] }) {
    this.routes = this.routes.filter(r => r !== route);
    await this.storage.set('routes', this.routes);
    this.showToast('Route deleted successfully', 'success');
  }

  async close() {
    await this.modalController.dismiss();
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
