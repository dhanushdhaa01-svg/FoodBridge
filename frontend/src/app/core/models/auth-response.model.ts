import { User } from './user.model';

export interface AuthPayload {
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthPayload;
}

export interface MeResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}
