import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { API_BASE_URL } from '../constants/api.constants';
import { AuthResponse, MeResponse } from '../models/auth-response.model';
import { User } from '../models/user.model';
import { LoginRequest } from '../models/login-request.model';
import { RegisterRequest } from '../models/register-request.model';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  private readonly _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/register`, data).pipe(
      tap(response => {
        if (response.data?.token) {
          this.tokenService.saveToken(response.data.token);
          this.setCurrentUser(response.data.user);
        }
      })
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, data).pipe(
      tap(response => {
        if (response.data?.token) {
          this.tokenService.saveToken(response.data.token);
          this.setCurrentUser(response.data.user);
        }
      })
    );
  }

  logout(): void {
    this.tokenService.removeToken();
    this.clearCurrentUser();
  }

  hydrateCurrentUser(): Observable<User | null> {
    if (!this.tokenService.isTokenPresent()) {
      this.clearCurrentUser();
      return of(null);
    }

    return this.http.get<MeResponse>(`${API_BASE_URL}/auth/me`).pipe(
      map(response => {
        this.setCurrentUser(response.data!.user);
        return response.data!.user;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          this.tokenService.removeToken();
        }
        this.clearCurrentUser();
        return of(null);
      })
    );
  }

  refreshUser(): Observable<User> {
    return this.hydrateCurrentUser().pipe(
      map(user => {
        if (!user) {
          throw new Error('Failed to refresh user');
        }
        return user;
      })
    );
  }

  setCurrentUser(user: User | null): void {
    this._currentUser.set(user);
  }

  clearCurrentUser(): void {
    this._currentUser.set(null);
  }
}
