import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-how-to-use',
  templateUrl: './how-to-use.page.html',
  styleUrls: ['./how-to-use.page.scss'],
  standalone: false
})
export class HowToUsePage implements OnInit {

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
    // Any initialization logic can go here
  }

  // Method to navigate back to home
  goToHome() {
    this.navCtrl.navigateBack('/home');
  }
}
