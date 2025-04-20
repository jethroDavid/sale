import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NavController, Platform } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { FirebaseAuthenticationService } from 'src/app/core';
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: false,
})
export class SignUpPage implements OnInit {
  private DEFAULT_EMAIL = 'johndoe@hotmail.com';
  public email: string = this.DEFAULT_EMAIL;
  public password: string = '';
  public confirmPassword: string = '';

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private toastService: ToastService,
    private authService: AuthService,
    private storageService: StorageService,
    private firebaseAuthenticationService: FirebaseAuthenticationService,
    private platform: Platform,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {}

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

  signUp() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.toastService.presentToast('Please fill in all fields', 'top', 'danger');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toastService.presentToast('Passwords do not match', 'top', 'danger');
      return;
    }

    if (this.password.length < 6) {
      this.toastService.presentToast('Password must be at least 6 characters long', 'top', 'danger');
      return;
    }

    this.authService.register(this.email, this.password).subscribe({
      next: (response) => {
        this.toastService.presentToast('Registration successful', 'top', 'success');

        this.storageService.set('user', response.email);
        this.storageService.set('token', response.token);
        
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.toastService.presentToast('Registration failed', 'top', 'danger');
      }
    });
  }

  goToSignIn() {
    this.navCtrl.navigateBack('/login');
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
          this.toastService.presentToast('Google sign-in failed', 'top', 'danger');
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
          this.toastService.presentToast('Google sign-in failed', 'top', 'danger');
        });
    }
  }

  private processGoogleAuthResult(result: any) {
    const credential = result.credential as firebase.auth.OAuthCredential;
    const idToken = credential?.idToken;
    
    if (!idToken) {
      console.error('No ID token found in the credential');
      this.toastService.presentToast('Authentication failed: No ID token', 'top', 'danger');
      return;
    }
    
    this.authService.registerGoogle(idToken).subscribe({
      next: (response) => {
        this.toastService.presentToast('Login successful', 'top', 'success');
        this.storageService.set('user', response.email);
        this.storageService.set('token', response.token);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.toastService.presentToast('Login failed', 'top', 'danger');
      }
    });
  }
}
