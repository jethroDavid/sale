import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickPageRoutingModule } from './pick-routing.module';

import { PickPage } from './pick.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickPageRoutingModule
  ],
  declarations: [PickPage]
})
export class PickPageModule {}
