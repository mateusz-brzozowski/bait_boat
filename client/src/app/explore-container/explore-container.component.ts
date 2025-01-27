import { Component, Input } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent {
  @Input() name?: string;
  isConnected: boolean = false;
  batteryLevel: number = 0;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit() {
    this.websocketService.isConnected$.subscribe(isConnected => {
      this.isConnected = isConnected;
    });

    this.websocketService.listenForEvent('status_update').subscribe((status: any) => {
      this.batteryLevel = status.batteryLevel;
    });
  }

  getBatteryIconColor(): string {
    if (this.batteryLevel > 75) {
      return 'success';
    } else if (this.batteryLevel > 50) {
      return 'warning';
    } else {
      return 'danger';
    }
  }
}
