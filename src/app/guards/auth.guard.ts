import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private storageService: StorageService,
    private router: Router,
    private toastService: ToastService
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      // Check if user is authenticated by verifying token exists
      const tokenPromise = this.storageService.get('token');
      const isAuthenticated = tokenPromise ? !!(await tokenPromise) : false;
      
      if (!isAuthenticated) {
        // If not authenticated, redirect to login page
        this.toastService.presentToast('Please log in to access this page', 'top', 'danger');
        this.router.navigate(['/login']);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
