import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { API_BASE_URL, USER_ENDPOINTS } from '../constants/api.constants';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getPendingNgoApprovals(): Observable<User[]> {
    return this.http.get<{ success: boolean; message: string; data: { users: User[] } }>(
      `${API_BASE_URL}${USER_ENDPOINTS.PENDING}`
    ).pipe(
      map(response => response.data.users)
    );
  }

  approveNgo(id: string): Observable<User> {
    return this.http.patch<{ success: boolean; message: string; data: { user: User } }>(
      `${API_BASE_URL}${USER_ENDPOINTS.APPROVE}/${id}/approve`,
      null
    ).pipe(
      map(response => response.data.user)
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<{ success: boolean; message: string; data: { user: User } }>(
      `${API_BASE_URL}${USER_ENDPOINTS.PROFILE}`
    ).pipe(
      map(response => response.data.user)
    );
  }

  updateProfile(profileData: Partial<User>): Observable<User> {
    return this.http.put<{ success: boolean; message: string; data: { user: User } }>(
      `${API_BASE_URL}${USER_ENDPOINTS.PROFILE}`,
      profileData
    ).pipe(
      map(response => response.data.user)
    );
  }

  getAllUsers(filters?: { role?: string; isApproved?: boolean | string; search?: string; page?: number; limit?: number }): Observable<{ users: User[]; pagination: any }> {
    return this.http.get<{ success: boolean; message: string; data: { users: User[]; pagination: any } }>(
      `${API_BASE_URL}${USER_ENDPOINTS.ALL}`,
      { params: filters as any }
    ).pipe(
      map(response => response.data)
    );
  }
}
