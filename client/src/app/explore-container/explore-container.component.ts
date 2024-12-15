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

  constructor(private websocketService: WebsocketService) {}

  ngOnInit() {
    this.websocketService.isConnected$.subscribe(isConnected => {
      this.isConnected = isConnected;
    });
  }
}
