import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HowToUsePageRoutingModule } from './how-to-use-routing.module';

import { HowToUsePage } from './how-to-use.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HowToUsePageRoutingModule
  ],
  declarations: [HowToUsePage],
})
export class HowToUsePageModule {}
