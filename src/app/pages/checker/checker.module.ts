import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckerPageRoutingModule } from './checker-routing.module';

import { CheckerPage } from './checker.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckerPageRoutingModule
  ],
  declarations: [CheckerPage]
})
export class CheckerPageModule {}
