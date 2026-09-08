import { environment } from '../../../environments/environment';

export const API_BASE_URL = environment.apiUrl;

export const PUBLIC_API_ENDPOINTS = [
  '/auth/register',
  '/auth/login'
] as const;

export const DONATION_ENDPOINTS = {
  LIST: '/donations',
  MY: '/donations/my',
  MY_CLAIMS: '/donations/my-claims',
  ALL: '/donations/all',
  DETAIL: '/donations',
  CREATE: '/donations',
  CLAIM: '/donations',
  CANCEL_CLAIM: '/donations',
  COMPLETE: '/donations',
  CANCEL: '/donations'
} as const;

export const USER_ENDPOINTS = {
  PENDING: '/users/pending',
  APPROVE: '/users',
  PROFILE: '/users/profile',
  ALL: '/users'
} as const;

export const DASHBOARD_ENDPOINTS = {
  STATS: '/dashboard/stats'
} as const;

export const AUTH_TOKEN_KEY = 'foodbridge_auth_token';
