import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
  standalone: false,
})
export class SignInPage implements OnInit {
  private DEFAULT_EMAIL = 'johndoe@hotmail.com';
  public email: string = this.DEFAULT_EMAIL;
  public password: string = '';

  constructor(
    private navCtrl: NavController,
    private router: Router,
    public auth: AngularFireAuth,
    private toastService: ToastService,
    private authService: AuthService,
    private storageService: StorageService,
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
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((result) => {
        // Successfully signed in
        console.log('User signed in successfully', result.user);
        
        // Correctly access the ID token
        const credential = result.credential as firebase.auth.OAuthCredential;
        const idToken = credential?.idToken;
        
        if (idToken) {
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
        } else {
          console.error('No ID token found in the credential');
          this.toastService.presentToast('Authentication failed: No ID token', 'top', 'danger-toast');
        }
      })
      .catch((error) => {
        console.error('Error during sign in:', error);
        // Handle specific error cases
        if (error.code === 'auth/configuration-not-found') {
          console.error('Firebase configuration is missing or incorrect');
        }
        this.toastService.presentToast('Google sign-in failed', 'top', 'danger-toast');
      });
  }

  goToSignUp() {
    this.navCtrl.navigateForward('/sign-up');
  }
}
