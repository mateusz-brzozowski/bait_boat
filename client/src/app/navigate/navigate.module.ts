import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigatePage } from './navigate.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { NavigatePageRoutingModule } from './navigate-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    NavigatePageRoutingModule
  ],
  declarations: [NavigatePage]
})
export class NavigatePageModule {}
