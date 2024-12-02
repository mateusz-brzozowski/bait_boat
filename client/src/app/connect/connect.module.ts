import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConnectPage } from './connect.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { ConnectPageRoutingModule } from './connect-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    ConnectPageRoutingModule
  ],
  declarations: [ConnectPage]
})
export class ConnectPageModule {}
