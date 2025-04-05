import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NavController, ToastController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
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
      this.toastService.presentToast('Please fill in all fields', 'top', 'danger-toast');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toastService.presentToast('Passwords do not match', 'top', 'danger-toast');
      return;
    }

    if (this.password.length < 6) {
      this.toastService.presentToast('Password must be at least 6 characters long', 'top', 'danger-toast');
      return;
    }

    this.authService.register(this.email, this.password).subscribe({
      next: (response) => {
        this.toastService.presentToast('Registration successful', 'top', 'success-toast');

        this.storageService.set('user', response.user);
        this.storageService.set('token', response.token);
        
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.toastService.presentToast('Registration failed', 'top', 'danger-toast');
      }
    });
  }

  goToSignIn() {
    this.router.navigate(['/login']);
  }
  
  temp() {
    this.router.navigate(['/home']);
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
}
