import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.isConnectedSubject.asObservable();

  constructor(private socket: Socket) {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    this.socket.on('connect', () => {
      this.updateStatus(true);
    });

    let reconnectAttempts = 0;

    this.socket.on('disconnect', () => {
      this.updateStatus(false);
      const backoffTime = Math.min(30000, Math.pow(2, reconnectAttempts) * 1000);
      setTimeout(() => {
        reconnectAttempts++;
        this.connectWebSocket();
      }, backoffTime);
    });

    this.socket.on('message', (msg: string) => {
      console.log('Message from server: ', msg);
    });
  }

  private updateStatus(isConnected: boolean) {
    this.isConnectedSubject.next(isConnected);
  }

  public sendEvent(event: string, data: any = null) {
    this.socket.emit(event, data);
  }

  public listenForEvent(event: string) {
    return this.socket.fromEvent(event);
  }
}
