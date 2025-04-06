import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseAuthenticationService } from '../..';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private readonly firebaseAuthenticationService: FirebaseAuthenticationService,
    private readonly router: Router,
  ) {}

  public async canActivate(): Promise<boolean> {
    const user = await this.firebaseAuthenticationService.getCurrentUser();
    if (user) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
