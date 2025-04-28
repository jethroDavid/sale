import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Navigation } from '@angular/router';
import { filter } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { StorageService } from '../services/storage.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
  animations: [
    trigger('itemAnimation', [
      // Item entering the DOM
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      // Item leaving the DOM
      transition(':leave', [
        animate('500ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
  ]
})
export class HomePage implements OnInit {
  public openDonateSheetModal: boolean = false;
  public segmentValue = 'tracker';
  private navigationHistory: string[] = [];

  constructor(
    public auth: AngularFireAuth,
    public router: Router,
    private storageService: StorageService,
    private navCtrl: NavController,
  ) {}

  ngOnInit(): void {
    // Subscribe to router events to update segment value when navigation occurs
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.url;
      
      // Store the URL in history
      this.navigationHistory.push(url);
      if (this.navigationHistory.length > 10) {
        this.navigationHistory.shift(); // Keep history manageable
      }
      
      if (url.includes('/tracker')) {
        this.segmentValue = 'tracker';
      } else if (url.includes('/checker')) {
        this.segmentValue = 'checker';
      } else if (url.includes('/pick')) {
        this.segmentValue = 'pick';
      }
    });

    // Initial navigation if needed
    if (this.router.url === '/home') {
      this.router.navigate(['/home/tracker']);
    }
  }

  logout() {
    this.auth.signOut().then(async () => {
      await this.storageService.remove('user');
      await this.storageService.remove('token');

      this.router.navigate(['/login']);
    }).catch((error) => {
      // An error happened.
      console.error('Error signing out:', error);
    });
  }

  openDonateSheetModalClicked() {
    this.openDonateSheetModal = !this.openDonateSheetModal;
  }

  openHowToUsePageClicked() {
    this.router.navigate(['/how-to-use']);
  }

  segmentChange(event: CustomEvent) {
    const value = event.detail.value;
    const targetUrl = `/home/${value}`;
    
    if (this.navigationHistory.length === 0) return;
    
    const currentUrl = this.navigationHistory[this.navigationHistory.length - 1];
    
    // Define the navigation order
    const tabOrder = ['tracker', 'checker', 'pick'];
    
    // Get the indices of current and target tabs in the order array
    const currentIndex = tabOrder.findIndex(tab => currentUrl.includes(tab));
    const targetIndex = tabOrder.findIndex(tab => targetUrl.includes(tab));
    
    // If target index is greater than current, we're moving forward
    // If current index is greater than target, we're moving backward
    if (targetIndex > currentIndex) {
      this.navCtrl.navigateForward(targetUrl);
    } else {
      this.navCtrl.navigateBack(targetUrl);
    }
  }
}
