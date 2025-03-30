import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NavController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: false,
})
export class SignUpPage implements OnInit {
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

  goToSignIn() {
    this.navCtrl.navigateBack('/login/sign-in');
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
}
