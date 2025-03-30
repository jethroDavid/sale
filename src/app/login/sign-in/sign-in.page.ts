import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
  standalone: false,
})
export class SignInPage implements OnInit {
  private DEFAULT_EMAIL = 'johndoe@hotmail.com';
  public email: string = this.DEFAULT_EMAIL;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    public auth: AngularFireAuth
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
    this.router.navigate(['/home']);
  }

  signInWithGoogle() {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then((result) => {
      // Successfully signed in
      console.log('User signed in successfully', result.user);
      this.router.navigate(['/home']);
    })
    .catch((error) => {
      console.error('Error during sign in:', error);
      // Handle specific error cases
      if (error.code === 'auth/configuration-not-found') {
        console.error('Firebase configuration is missing or incorrect');
      }
    });
  }

  goToSignUp() {
    this.navCtrl.navigateForward('/sign-up');
  }
}
