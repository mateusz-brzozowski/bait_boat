import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlPage } from './control.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { ControlPageRoutingModule } from './control-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    ControlPageRoutingModule
  ],
  declarations: [ControlPage]
})
export class ControlPageModule {}
