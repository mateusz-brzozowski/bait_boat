import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.page.html',
  styleUrls: ['./status.page.scss'],
})
export class StatusPage implements OnInit {
  batteryLevel: number = 0;
  estimatedTime: string = '10 mins';
  boatSpeed: number = 0;
  distanceFromUser: number = 0;
  boatStatus: string = 'Unknown';

  constructor(private websocketService: WebsocketService) { }

  ngOnInit() {
    this.websocketService.listenForEvent('status_update').subscribe((status: any) => {
      this.batteryLevel = status.batteryLevel;
      this.estimatedTime = status.estimatedTime;
      this.boatSpeed = status.boatSpeed;
      this.distanceFromUser = status.distanceFromUser;
      this.boatStatus = status.boatStatus;
    });
  }
}
