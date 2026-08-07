import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AUTH_TOKEN_KEY } from '../constants/api.constants';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  saveToken(token: string): void {
    if (!this.isBrowser) {
      return;
    }
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  removeToken(): void {
    if (!this.isBrowser) {
      return;
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  isTokenPresent(): boolean {
    return this.getToken() !== null;
  }
}
