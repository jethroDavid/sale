import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { ApiResponse } from 'src/app/interface/api-response';

@Injectable({
  providedIn: 'root'
})
export class UserUrlService {

  constructor(
    private apiService: ApiService
  ) { }

  getUserUrls<T>(fromDate: string | null = null, toDate: string | null = null) {
    return this.apiService.get<ApiResponse<T>>('user-urls', { fromDate, toDate }, true);
  }

  getUserUrlAnalysisResults<T>(urlId: number) {
    return this.apiService.get<ApiResponse<T>>(`user-urls/analysis`, { urlId }, true);
  }

  deleteUserUrl<T>(urlId: number) {
    return this.apiService.delete<ApiResponse<T>>(`user-urls/${urlId}`, true);
  }
}
