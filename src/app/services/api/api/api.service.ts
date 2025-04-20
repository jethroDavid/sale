import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from '../../storage.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) { }

  /**
   * Get request
   * @param endpoint API endpoint
   * @param params Optional HTTP parameters
   * @param requiresAuth Whether the request requires authentication
   * @returns Observable of the response
   */
  get<T>(endpoint: string, params?: any, requiresAuth = true): Observable<T> {
    return from(this.getHeaders(requiresAuth)).pipe(
      switchMap(headers => {
        const options = {
          headers: headers,
          params: this.buildParams(params)
        };

        return this.http.get<T>(`${this.apiUrl}/${endpoint}`, options)
          .pipe(catchError(this.handleError));
      })
    );
  }

  /**
   * Post request
   * @param endpoint API endpoint
   * @param body Request payload
   * @param requiresAuth Whether the request requires authentication
   * @returns Observable of the response
   */
  post<T>(endpoint: string, body: any, requiresAuth = true): Observable<T> {
    return from(this.getHeaders(requiresAuth)).pipe(
      switchMap(headers => {
        const options = {
          headers: headers
        };

        return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body, options)
          .pipe(catchError(this.handleError));
      })
    );
  }

  /**
   * Put request
   * @param endpoint API endpoint
   * @param body Request payload
   * @param requiresAuth Whether the request requires authentication
   * @returns Observable of the response
   */
  put<T>(endpoint: string, body: any, requiresAuth = true): Observable<T> {
    return from(this.getHeaders(requiresAuth)).pipe(
      switchMap(headers => {
        const options = {
          headers: headers
        };

        return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body, options)
          .pipe(catchError(this.handleError));
      })
    );
  }

  /**
   * Delete request
   * @param endpoint API endpoint
   * @param requiresAuth Whether the request requires authentication
   * @returns Observable of the response
   */
  delete<T>(endpoint: string, requiresAuth = true): Observable<T> {
    return from(this.getHeaders(requiresAuth)).pipe(
      switchMap(headers => {
        const options = {
          headers: headers
        };

        return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, options)
          .pipe(catchError(this.handleError));
      })
    );
  }


  /**
   * Create HTTP headers
   * @param requiresAuth Whether to include authorization token
   * @returns HttpHeaders object
   */
  private async getHeaders(requiresAuth: boolean): Promise<HttpHeaders> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (requiresAuth) {
      const token = await this.storageService.get('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  /**
   * Build HTTP parameters
   * @param params Key-value pairs for query parameters
   * @returns HttpParams object
   */
  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return httpParams;
  }

  /**
   * Handle HTTP errors
   * @param error HTTP error response
   * @returns Observable error
   */
  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    if (error.status === 0) {
      // A client-side or network error occurred
      console.error('Network error:', error.error);
    } else if (error.status === 401) {
      // Unauthorized - clear token and redirect to login
      console.error('Authentication error. Please log in again.');
      localStorage.removeItem('auth_token');
      // You might want to inject Router and navigate to login page here
    } else {
      // The backend returned an unsuccessful response code
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`);
    }
    
    // Return an observable with the error
    return throwError(() => error);
  }
}
