import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { ToastController } from '@ionic/angular';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';
import { NumberSymbol } from '@angular/common';

declare module 'leaflet' {
  namespace Control {
    function geocoder(options?: any): any;
  }
}

@Component({
  selector: 'app-navigate',
  templateUrl: 'navigate.page.html',
  styleUrls: ['navigate.page.scss']
})
export class NavigatePage implements OnInit {
  private leafletMap: any;
  private lat: number = 50.705548;
  private lng: number = 22.192485;
  private zoom: number = 18;
  private markers: L.Marker[] = [];
  private markersGroup: L.LayerGroup = L.layerGroup();
  private linesGroup: L.LayerGroup = L.layerGroup();
  private boatLayer: L.LayerGroup = L.layerGroup();
  private isNavigating: boolean = false;
  private boatMarker: L.Marker = L.marker([0, 0]);
  private boatLat: number = 50.705548;
  private boatLng: number = 22.192485;
  private currentWaypoint: number = 0;

  ngOnInit() {
    this.websocketService.listenForEvent('message').subscribe((response: any) => {
      if (response.error) {
        console.log('Message from server:', response);
        this.showToast(response.error, 'warning');
      }
    });

    this.websocketService.listenForEvent('boat_position').subscribe((response: any) => {
      this.updateBoatMarker(response);
    });

    this.websocketService.listenForEvent('current_waypoint').subscribe((response: any) => {
      this.updateCurrentWaypoint(response);
    });

    this.initMap();
  }

  constructor(private websocketService: WebsocketService,
    private toastController: ToastController
  ) { }

  emergencyStop() {
    console.log('Motors emergency stop');
    this.websocketService.sendEvent('motors_emergency_stop');
    this.currentWaypoint = 0;

    if (this.isNavigating) {
      this.pauseNavigation();
    }
  }

  locate() {
    if (this.leafletMap) {
      this.leafletMap.setView([this.boatLat, this.boatLng], this.leafletMap.getZoom());
    }
  }

  removeMarkers() {
    this.markers.forEach(marker => {
      this.leafletMap.removeLayer(marker);
    });
    this.markersGroup.clearLayers();
    this.linesGroup.clearLayers();
    this.markers = [];
  }

  start() {
    if (this.isNavigating) {
      this.pauseNavigation();
      return;
    }

    if (this.markers.length < 2) {
      this.showToast('Please add at least two markers', 'warning');
      return;
    }

    const waypoints = this.markers.map(marker => {
      return {
        lat: marker.getLatLng().lat,
        lng: marker.getLatLng().lng
      };
    });

    console.log('Waypoints:', waypoints);
    this.websocketService.sendEvent('navigate', { 'waypoints': waypoints, 'current_waypoint': this.currentWaypoint });
    this.isNavigating = true;
    this.updateButtonIcon();
    this.updateTrashButtonState();
    this.updateCurrentWaypoint(this.currentWaypoint);
  }

  private pauseNavigation() {
    this.websocketService.sendEvent('pause', {});
    this.isNavigating = false;
    this.updateButtonIcon();
    this.updateTrashButtonState();
    this.updateCurrentWaypoint();
  }

  private updateButtonIcon() {
    const button = document.getElementById('startPauseButton');
    if (button) {
      const icon = button.querySelector('ion-icon');
      if (icon) {
        if (this.isNavigating) {
          icon.setAttribute('name', 'pause');
        } else {
          icon.setAttribute('name', 'play');
        }
      } else {
        console.error('Icon element not found');
      }
    } else {
      console.error('Button element not found');
    }
  }

  private updateTrashButtonState() {
    const trashButton = document.getElementById('trashButton');
    if (trashButton) {
      if (this.isNavigating) {
        trashButton.setAttribute('disabled', 'true');
      } else {
        trashButton.removeAttribute('disabled');
      }
    } else {
      console.error('Trash button element not found');
    }
  }

  private addMarker(lat: number, lng: number) {
    const marker = L.marker([lat, lng], { icon: this.createNumberedIcon(this.markers.length + 1, 28) }).addTo(this.leafletMap);
    this.markers.push(marker);
  }

  private createNumberedIcon(number: number, size: number, shouldPulse: boolean = false) {
    const pulseStyle = shouldPulse ? 'animation: pulsate 1.5s infinite;' : '';
    const shadowStyle = shouldPulse ? 'filter: drop-shadow(0 0 10px var(--ion-color-primary));' : '';
    return L.divIcon({
      className: 'numbered-div-icon',
      html: `<div style="position: relative; ${pulseStyle}">
               <img src="assets/marker.png" style="width: ${size}px; height: ${size}px; ${shadowStyle}">
               <div style="position: absolute; top: -5px; left: 0; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; color: white; font-size: ${size / 2}px;">${number}</div>
             </div>
             <style>
                @keyframes pulsate {
                  0% { transform: scale(0.9); opacity: 0.7; }
                  50% { transform: scale(1.1); opacity: 1; }
                  100% { transform: scale(0.9); opacity: 0.7; }
                }
             </style>`,
      iconSize: [size, size]
    });
  }

  private createPulsatingDotIcon() {
    return L.divIcon({
      className: 'pulsating-div-icon',
      html: `<div style="position: relative; width: 20px; height: 20px;">
               <div style="width: 20px; height: 20px; background: radial-gradient(circle, rgba(255,0,0,1) 0%, rgba(255,0,0,0.6) 40%, rgba(255,0,0,0) 70%); border-radius: 50%; box-shadow: 0 0 6px rgba(255,0,0,0.6); animation: pulsate 1.5s infinite;"></div>
               <style>
                 @keyframes pulsate {
                   0% { transform: scale(0.8); opacity: 0.7; }
                   50% { transform: scale(1.2); opacity: 1; }
                   100% { transform: scale(0.8); opacity: 0.7; }
                 }
                 .custom-div-icon div {
                   width: 20px;
                   height: 20px;
                   background: radial-gradient(circle, rgba(255,0,0,1) 0%, rgba(255,0,0,0.6) 40%, rgba(255,0,0,0) 70%);
                   border-radius: 50%;
                   box-shadow: 0 0 6px rgba(255,0,0,0.6);
                   animation: pulsate 1.5s infinite;
                 }
               </style>
             </div>`,
      iconSize: [20, 20]
    });
  }

  private drawArrows() {
    this.linesGroup.clearLayers();
    if (this.markers.length < 2) return;

    for (let i = 0; i < this.markers.length - 1; i++) {
      var latlngs = [this.markers[i].getLatLng(), this.markers[i + 1].getLatLng()];
      L.polyline(latlngs, { color: 'blue' }).addTo(this.linesGroup);
    }
  }

  private async addBoatMarker() {
    const position = await this.getBoatPosition();
    this.boatLayer.clearLayers();
    this.boatMarker = L.marker([position.lat, position.lng], { icon: this.createPulsatingDotIcon() }).addTo(this.boatLayer);
  }

  private async updateBoatMarker(position: { lat: number, lng: number }) {
    this.boatLat = position.lat;
    this.boatLng = position.lng;
    if (this.boatMarker) {
      this.boatMarker.setLatLng([position.lat, position.lng]);
    }
  }

  private async updateCurrentWaypoint(waypoint?: number) {
    if (this.currentWaypoint !== undefined) {
      this.markers[this.currentWaypoint].setIcon(this.createNumberedIcon(this.currentWaypoint + 1, 28, false));
    }
    if(typeof waypoint !== 'undefined') {
      this.currentWaypoint = waypoint;
      this.markers[this.currentWaypoint].setIcon(this.createNumberedIcon(this.currentWaypoint + 1, 40, true));
    }
  }

  private getBoatPosition(): Promise<{ lat: number, lng: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ lat: 50.705548, lng: 22.192485 });
      }, 1000);
    });
  }

  private initMap(): void {
    this.leafletMap = new L.Map('leafletMap');
    const self = this;

    this.leafletMap.on("load", function () {
      setTimeout(() => {
        self.leafletMap.invalidateSize();
      }, 10);
    });

    this.leafletMap.setView([this.lat, this.lng], this.zoom);

    const baseLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    const satelliteLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: '&copy; Esri, TomTom, Garmin, METI/NASA, USGS'
    });

    baseLayer.addTo(this.leafletMap);

    var MARKERS_MAX = 99;
    this.markersGroup = L.layerGroup();
    this.linesGroup = L.layerGroup();
    this.leafletMap.addLayer(this.markersGroup);
    this.leafletMap.addLayer(this.linesGroup);
    this.leafletMap.addLayer(this.boatLayer);

    const baseMaps = {
      "Base Map": baseLayer,
      "Satellite": satelliteLayer
    };

    L.control.layers(baseMaps).addTo(this.leafletMap);

    this.addBoatMarker();

    this.leafletMap.on('click', (e: any) => {
      if (this.markers.length < MARKERS_MAX && !this.isNavigating) {
        this.addMarker(e.latlng.lat, e.latlng.lng);
        this.drawArrows();
        return;
      }
    });

    const geocoder = L.Control.geocoder().addTo(this.leafletMap);

    setTimeout(() => {
      const geocoderInput = document.querySelector('.leaflet-control-geocoder-form input') as HTMLElement;
      if (geocoderInput) {
        geocoderInput.style.color = 'black';
      }

      const geocoderButton = document.querySelector('.leaflet-control-geocoder-button') as HTMLElement;
      if (geocoderButton) {
        geocoderButton.style.color = 'black';
      }
    }, 500);
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
