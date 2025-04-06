import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { FirebaseAuthenticationService } from '../core';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  private DEFAULT_EMAIL = 'johndoe@hotmail.com';
  public email: string = this.DEFAULT_EMAIL;
  public password: string = '';
  public greeting: string = this.getTimeBasedGreeting();
  
  constructor(
    private navCtrl: NavController,
    private router: Router,
    public auth: AngularFireAuth,
    private toastService: ToastService,
    private authService: AuthService,
    private storageService: StorageService,
    private firebaseAuthenticationService: FirebaseAuthenticationService,
    private platform: Platform,
  ) {}

  ngOnInit() {}

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

  clearEmail() {
    if (this.email === this.DEFAULT_EMAIL) {
      this.email = '';
    }
  }
  
  placeholderEmail() {
    if (this.email === '') {
      this.email = this.DEFAULT_EMAIL;
    }
  }

  signIn() {
    if (!this.email || !this.password) {
      this.toastService.presentToast('Please fill in all fields', 'top', 'danger-toast');
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.toastService.presentToast('Login successful', 'top', 'success-toast');

        this.storageService.set('user', response.user);
        this.storageService.set('token', response.token);
        
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.toastService.presentToast('Login failed', 'top', 'danger-toast');
      }
    });
  }

  signInWithGoogle() {
    if (this.platform.is('android') || this.platform.is('ios')) {
      // Mobile implementation (Android/iOS) using Capacitor
      this.firebaseAuthenticationService.signInWithGoogle()
        .then(result => {
          console.log('User signed in successfully with Capacitor', result.user);
          this.processGoogleAuthResult(result);
        })
        .catch(error => {
          console.error('Error during Capacitor Google sign in:', error);
          this.toastService.presentToast('Google sign-in failed', 'top', 'danger-toast');
        });
    } else {
      // Web implementation using popup
      this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then(result => {
          console.log('User signed in successfully with Web', result.user);
          this.processGoogleAuthResult(result);
        })
        .catch(error => {
          console.error('Error during sign in:', error);
          if (error.code === 'auth/configuration-not-found') {
            console.error('Firebase configuration is missing or incorrect');
          }
          this.toastService.presentToast('Google sign-in failed', 'top', 'danger-toast');
        });
    }
  }

  goToSignUp() {
    this.navCtrl.navigateForward('/sign-up');
  }

  private processGoogleAuthResult(result: any) {
    const credential = result.credential as firebase.auth.OAuthCredential;
    const idToken = credential?.idToken;
    
    if (!idToken) {
      console.error('No ID token found in the credential');
      this.toastService.presentToast('Authentication failed: No ID token', 'top', 'danger-toast');
      return;
    }
    
    this.authService.registerGoogle(idToken).subscribe({
      next: (response) => {
        this.toastService.presentToast('Login successful', 'top', 'success-toast');
        this.storageService.set('user', response.user);
        this.storageService.set('token', response.token);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.toastService.presentToast('Login failed', 'top', 'danger-toast');
      }
    });
  }
}
