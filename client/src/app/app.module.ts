import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from '../environments/environment';
import { Hotspot } from '@ionic-native/hotspot/ngx';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { IonicStorageModule, Storage } from '@ionic/storage-angular';
import { RoutesModalComponent } from './routes-modal/routes-modal.component';

const config: SocketIoConfig = { url: environment.socketUrl, options: {} };

@NgModule({
  declarations: [AppComponent, RoutesModalComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    SocketIoModule.forRoot(config),
    IonicStorageModule.forRoot(),
    FormsModule
  ],
  providers: [
    Hotspot,
    Storage,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
