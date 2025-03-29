import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  public greeting: string = this.getTimeBasedGreeting();
  
  constructor() { }

  ngOnInit() {

  }

  getTimeBasedGreeting() {
    const hour = moment().hour();
    
    if (hour >= 5 && hour < 12) {
      return "Good Morning!";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon!";
    } else if (hour >= 17 && hour < 22) {
      return "Good Evening!";
    } else {
      return "Good Night!";
    }
  }
}
