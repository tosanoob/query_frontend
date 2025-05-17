import { API_BASE_URL } from '@/app/lib/utils/constants';
import { apiClient } from './apiClient';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  user_id: string;
  username: string;
  role: string | null;
}

export async function login(credentials: LoginRequest): Promise<TokenResponse> {
  return apiClient.post<TokenResponse>('/api/auth/login', credentials);
}

export async function logout(token: string): Promise<{ success: boolean; message: string }> {
  return apiClient.post<{ success: boolean; message: string }>('/api/auth/logout', { token }, { token });
} 