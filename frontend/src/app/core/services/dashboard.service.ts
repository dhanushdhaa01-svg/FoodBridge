import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_BASE_URL, DASHBOARD_ENDPOINTS } from '../constants/api.constants';

export interface DashboardStatsResponse {
  role: 'donor' | 'ngo' | 'admin';
  stats: any;
  recentDonations?: any[];
  recentClaims?: any[];
  recentUsers?: any[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getStats(): Observable<DashboardStatsResponse> {
    return this.http.get<{ success: boolean; message: string; data: DashboardStatsResponse }>(
      `${API_BASE_URL}${DASHBOARD_ENDPOINTS.STATS}`
    ).pipe(
      map(response => response.data)
    );
  }
}
