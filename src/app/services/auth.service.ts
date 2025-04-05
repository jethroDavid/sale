import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  /**
   * Register a new user with email and password
   * @param email User's email address
   * @param password User's password
   * @returns Observable of the registration response
   */
  register(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post(
      `${environment.apiUrl}/auth/register`, 
      {
        email,
        password
      }, { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Login user with email and password
   * @param email User's email address
   * @param password User's password
   * @returns Observable of the login response
   */
  login(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(
      `${environment.apiUrl}/auth/login`,
      {
        email,
        password
      }, { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  registerGoogle(idToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(
      `${environment.apiUrl}/auth/google`,
      {
        idToken
      }, { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    if (error.status === 0) {
      // A client-side or network error occurred
      console.error('Network error:', error.error);
    } else {
      // The backend returned an unsuccessful response code
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`);
    }
    
    // Return an observable with a user-facing error message
    return throwError(() => error);
  }
}
