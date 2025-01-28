import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { Subscription, timer } from 'rxjs';

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
  boatStatus: string = 'Disconnected';
  leftMotorTemp: number = 0;
  rightMotorTemp: number = 0;
  gpsSignalStrength: number = 0;
  private statusSubscription: Subscription | null = null;
  private disconnectTimerSubscription: Subscription | null = null;

  constructor(private websocketService: WebsocketService) { }

  ngOnInit() {
    this.statusSubscription = this.websocketService.listenForEvent('status_update').subscribe((status: any) => {
      this.batteryLevel = status.batteryLevel;
      this.estimatedTime = status.estimatedTime;
      this.boatSpeed = status.boatSpeed;
      this.distanceFromUser = status.distanceFromUser;
      this.leftMotorTemp = status.leftMotorTemp;
      this.rightMotorTemp = status.rightMotorTemp;
      this.gpsSignalStrength = status.gpsSignalStrength;
      this.boatStatus = 'Connected';

      if (this.disconnectTimerSubscription) {
        this.disconnectTimerSubscription.unsubscribe();
      }
      this.disconnectTimerSubscription = timer(10000).subscribe(() => {
        this.boatStatus = 'Disconnected';
      });
    });
  }

  ngOnDestroy() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
    if (this.disconnectTimerSubscription) {
      this.disconnectTimerSubscription.unsubscribe();
    }
  }

  getBatteryColor(): string {
    if (this.batteryLevel > 75) {
      return 'success';
    } else if (this.batteryLevel > 50) {
      return 'warning';
    } else {
      return 'danger';
    }
  }
}
