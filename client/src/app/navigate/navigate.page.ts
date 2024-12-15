import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';

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
  leafletMap: any;
  lat: number = 50.705548;
  lng: number = 22.192485;
  zoom: number = 18;

  constructor() { }

  ngOnInit() {
    this.initMap();
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

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href=”https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.leafletMap);

    var MARKERS_MAX = 4;
    var markersGroup = L.layerGroup();
    var linesGroup = L.layerGroup();
    this.leafletMap.addLayer(markersGroup);
    this.leafletMap.addLayer(linesGroup);

    var markers: L.Marker[] = [];

    function createNumberedIcon(number: number) {
      return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="position: relative;">
                 <img src="https://brandeps.com/icon-download/M/Map-pin-icon-05.png" style="width: 28px; height: 28px;">
                 <div style="position: absolute; top: -5px; left: 0; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: white;">${number}</div>
               </div>`,
        iconSize: [28, 28]
      });
    }

    const drawArrows = () =>  {
      linesGroup.clearLayers();
      if (markers.length < 2) return;
    
      for (let i = 0; i < markers.length - 1; i++) {
        var latlngs = [markers[i].getLatLng(), markers[i + 1].getLatLng()];
        L.polyline(latlngs, { color: 'blue' }).addTo(linesGroup);
      }
    }

    this.leafletMap.on('click', function (e: any) {
      var markersCount = markersGroup.getLayers().length;

      if (markersCount < MARKERS_MAX) {
        var marker = L.marker(e.latlng, { icon: createNumberedIcon(markersCount + 1) }).addTo(markersGroup);
        markers.push(marker);
        drawArrows();
        return;
      }
      markersGroup.clearLayers();
      linesGroup.clearLayers();
      markers = [];
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
}
