import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { ToastController, ModalController } from '@ionic/angular';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-control-geocoder';
import { DarkModeService } from '../services/dark-mode.service';
import { RoutesModalComponent } from '../routes-modal/routes-modal.component';
import * as turf from '@turf/turf';

declare module 'leaflet' {
  namespace Control {
    function geocoder(options?: any): any;
    class Draw {
      constructor(options?: any);
    }
  }
  namespace Draw {
    namespace Event {
      const CREATED: string;
    }
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
  private geofenceLayer: L.FeatureGroup = L.featureGroup();
  private geofence: L.Polygon | null = null;
  private isNavigating: boolean = false;
  private boatMarker: L.Marker = L.marker([0, 0]);
  private boatLat: number = 50.705548;
  private boatLng: number = 22.192485;
  private currentWaypoint: number = 0;
  private lastWaypoint: number = -1;
  private isDark: boolean = false;
  private isDrawControl: boolean = false;
  private drawControl = new L.Control.Draw({
    draw: {
      polygon: true,
      polyline: false,
      rectangle: false,
      circle: false,
      marker: false,
      circlemarker: false
    },
    edit: {
      featureGroup: this.geofenceLayer
    }
  });

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

    this.darkModeService.darkMode$.subscribe((isDark) => {
      this.initializeDarkPalette(isDark);
      this.isDark = isDark;
    });

    setInterval(() => {
      this.checkGeofence();
    }, 5000);

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.addEventListener('change', (mediaQuery) => this.initializeDarkPalette(mediaQuery.matches));
  }

  constructor(private websocketService: WebsocketService,
    private toastController: ToastController,
    private darkModeService: DarkModeService,
    private modalController: ModalController
  ) { }

  async openRoutesModal() {
    const waypoints = this.markers.map(marker => ({
      lat: marker.getLatLng().lat,
      lng: marker.getLatLng().lng
    }));

    const modal = await this.modalController.create({
      component: RoutesModalComponent,
      componentProps: { waypoints }
    });

    modal.onDidDismiss().then((detail) => {
      if (detail.data) {
        this.loadRoute(detail.data.waypoints);
      }
    });

    return await modal.present();
  }

  private loadRoute(waypoints: any[]) {
    this.removeMarkers();
    waypoints.forEach(waypoint => {
      this.addMarker(waypoint.lat, waypoint.lng);
    });
    this.drawArrows();
  }

  public drawGeofence() {
    if (this.isDrawControl) {
      this.leafletMap.removeControl(this.drawControl);
      this.disableButtons(false);
      this.isDrawControl = false;
      return;
    }
    this.isDrawControl = true;
    this.disableButtons(true);
    this.leafletMap.addControl(this.drawControl);
    this.leafletMap.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      this.geofenceLayer.addLayer(layer);
      this.geofence = layer;
    });
  }

  private disableButtons(disable: boolean) {
    const buttonIds = ['trashButton', 'startPauseButton', 'emergency-button', 'routesButton'];
    buttonIds.forEach(id => {
      const button = document.getElementById(id);
      if (button) {
        if (disable) {
          button.setAttribute('disabled', 'true');
        } else {
          button.removeAttribute('disabled');
        }
      } else {
        console.error(`Button with id ${id} not found`);
      }
    });
  }

  private async checkGeofence(): Promise<void> {
    const boatPoint = turf.point([this.boatLng, this.boatLat]);
  
    const polygons: any[] = [];
    this.geofenceLayer.eachLayer((layer) => {
      if (layer instanceof L.Polygon) {
        const latLngs = layer.getLatLngs();
        const coordinates = this.flattenLatLngs(latLngs);
        if (coordinates.length > 0 && (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
          coordinates.push(coordinates[0]);
        }
        if (coordinates.length >= 4) {
          polygons.push(turf.polygon([coordinates]));
        } else {
          console.error('Invalid polygon with less than 4 points:', coordinates);
        }
      }
    });
  
    if (polygons.length === 0) {
      console.log('No geofence zones available.');
      return;
    }
  
    let insideGeofence = false;
    for (const polygon of polygons) {
      if (turf.booleanPointInPolygon(boatPoint, polygon)) {
        insideGeofence = true;
        break;
      }
    }
  
    if (!insideGeofence) {
      await this.showToast('The boat is outside the geofence!', 'danger');
    }
  }
  
  private flattenLatLngs(latLngs: any): number[][] {
    const coordinates: number[][] = [];
    latLngs.forEach((latLng: any) => {
      if (Array.isArray(latLng)) {
        coordinates.push(...this.flattenLatLngs(latLng));
      } else {
        coordinates.push([latLng.lng, latLng.lat]);
      }
    });
    return coordinates;
  }
  initializeDarkPalette(isDark: boolean) {
    console.log('Dark palette:', isDark);
    document.documentElement.classList.toggle('ion-palette-dark', isDark);

    const leafletElements = document.querySelectorAll('.leaflet-layer, .leaflet-control-zoom-in, .leaflet-control-zoom-out, .leaflet-control-attribution');
    leafletElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      if (isDark) {
        htmlElement.style.filter = 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)';
      } else {
        htmlElement.style.filter = '';
      }
    });

    const geocoderInput = document.querySelector('.leaflet-control-geocoder-form input') as HTMLElement;
    if (geocoderInput) {
      geocoderInput.style.color = isDark ? 'white' : 'black';
      geocoderInput.style.backgroundColor = isDark ? '#333' : '#fff';
    }

    const geocoderButton = document.querySelector('.leaflet-control-geocoder-button') as HTMLElement;
    if (geocoderButton) {
      geocoderButton.style.color = isDark ? 'white' : 'black';
      geocoderButton.style.backgroundColor = isDark ? '#333' : '#fff';
    }

    const geocoderControl = document.querySelector('.leaflet-control-geocoder') as HTMLElement;
    if (geocoderControl) {
      geocoderControl.style.backgroundColor = isDark ? '#333' : '#fff';
      geocoderControl.style.color = isDark ? 'white' : 'black';
    }

    const geocoderResults = document.querySelector('.leaflet-control-geocoder-alternatives') as HTMLElement;
    if (geocoderResults) {
      geocoderResults.style.backgroundColor = isDark ? '#333' : '#fff';
      geocoderResults.style.color = isDark ? 'white' : 'black';
    }

    const geocoderIcon = document.querySelector('.leaflet-control-geocoder-icon') as HTMLElement;
    if (geocoderIcon) {
      geocoderIcon.style.filter = isDark ? 'invert(100%)' : 'none';
      geocoderIcon.style.backgroundColor = 'transparent';
    }

    const layerControl = document.querySelector('.leaflet-control-layers') as HTMLElement;
    if (layerControl) {
      layerControl.style.backgroundColor = isDark ? '#333' : '#fff';
      layerControl.style.color = isDark ? 'white' : 'black';
    }

    const layerControlInputs = document.querySelectorAll('.leaflet-control-layers input') as NodeListOf<HTMLInputElement>;
    layerControlInputs.forEach((input) => {
      input.style.backgroundColor = isDark ? '#333' : '#fff';
      input.style.color = isDark ? 'white' : 'black';
    });

    const layerControlLabels = document.querySelectorAll('.leaflet-control-layers label') as NodeListOf<HTMLLabelElement>;
    layerControlLabels.forEach((label) => {
      label.style.color = isDark ? 'white' : 'black';
    });

    this.updateMarkers(isDark);
  }

  emergencyStop() {
    console.log('Motors emergency stop');
    this.websocketService.sendEvent('motors_emergency_stop');
    this.websocketService.sendEvent('current_waypoint', 0);
    this.currentWaypoint = 0;

    this.stopAllWaypoints();

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
  }

  private pauseNavigation() {
    this.websocketService.sendEvent('pause');
    this.isNavigating = false;
    this.updateButtonIcon();
    this.updateTrashButtonState();
    this.stopAllWaypoints();
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
    const marker = L.marker([lat, lng], { icon: this.createNumberedIcon(this.markers.length + 1, 28, this.isDark) }).addTo(this.leafletMap);
    this.markers.push(marker);
  }

  updateMarkers(isDark: boolean) {
    this.markers.forEach((marker, index) => {
      if (this.currentWaypoint === index && this.isNavigating) {
        marker.setIcon(this.createNumberedIcon(index + 1, 40, isDark, true));
      }
      else {
        marker.setIcon(this.createNumberedIcon(index + 1, 28, isDark));
      }
    });
  }

  private createNumberedIcon(number: number, size: number, isDark: boolean, shouldPulse: boolean = false) {
    const pulseStyle = shouldPulse ? 'animation: pulsate 1.5s infinite;' : '';
    const shadowStyle = shouldPulse ? 'filter: drop-shadow(0 0 10px var(--ion-color-primary));' : '';
    const filterStyle = isDark ? 'filter: invert(100%);' : '';

    return L.divIcon({
      className: 'numbered-div-icon',
      html: `<div style="position: relative; ${pulseStyle} ${filterStyle}">
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

  private async updateCurrentWaypoint(waypoint: number) {
    this.currentWaypoint = waypoint;
    console.log(this.currentWaypoint);
    console.log(this.lastWaypoint);
    if (this.currentWaypoint === this.lastWaypoint) {
      return;
    }
    this.stopAllWaypoints();
    this.lastWaypoint = this.currentWaypoint;
    this.markers[this.currentWaypoint].setIcon(this.createNumberedIcon(this.currentWaypoint + 1, 40, this.isDark, true));
  }

  private async stopAllWaypoints() {
    this.lastWaypoint = -1;
    this.markers.forEach((_, index) => {
      this.markers[index].setIcon(this.createNumberedIcon(index + 1, 28, this.isDark, false));
    });
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
    this.leafletMap.addLayer(this.geofenceLayer);

    const baseMaps = {
      "Base Map": baseLayer,
      "Satellite": satelliteLayer
    };

    L.control.layers(baseMaps).addTo(this.leafletMap);

    this.leafletMap.on('baselayerchange', (e: any) => {
      this.initializeDarkPalette(this.isDark);
    });

    this.addBoatMarker();

    this.leafletMap.on('click', (e: any) => {
      if (this.markers.length < MARKERS_MAX && !this.isNavigating && !this.isDrawControl) {
        this.addMarker(e.latlng.lat, e.latlng.lng);
        this.drawArrows();
        return;
      }
    });

    const geocoder = L.Control.geocoder().addTo(this.leafletMap);

    setTimeout(() => {
      const geocoderInput = document.querySelector('.leaflet-control-geocoder-form input') as HTMLElement;
      if (geocoderInput) {
        geocoderInput.style.color = this.isDark ? 'white' : 'black';
      }

      const geocoderButton = document.querySelector('.leaflet-control-geocoder-button') as HTMLElement;
      if (geocoderButton) {
        geocoderButton.style.color = this.isDark ? 'white' : 'black';
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
