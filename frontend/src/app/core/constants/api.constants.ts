import { environment } from '../../../environments/environment';

export const API_BASE_URL = environment.apiUrl;

export const PUBLIC_API_ENDPOINTS = [
  '/auth/register',
  '/auth/login'
] as const;

export const AUTH_TOKEN_KEY = 'foodbridge_auth_token';
