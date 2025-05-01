import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { ApiResponse } from 'src/app/interface/api-response';

@Injectable({
  providedIn: 'root'
})
export class RegisterUrlService {

  constructor(
    private apiService: ApiService
  ) { }

  registerUrl<T>(url: string, frequency: string = '', email: string = '') {
    return this.apiService.post<ApiResponse<T>>('register-url', { url, frequency, email }, true);
  }
    
  registerAvailabilityUrl<T>(url: string, frequency: string = '', email: string = '') {
    return this.apiService.post<ApiResponse<T>>('register-url/availability', { url, frequency, email }, true);
  }
}
