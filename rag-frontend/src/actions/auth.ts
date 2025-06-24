import { apiCall } from '../api';

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  msg?: string;
  user_id?: string;
}

export const authActions = {
  login: async (data: LoginData) => {
    return apiCall<AuthResponse>({
      url: '/auth/login',
      method: 'POST',
      data,
    });
  },

  register: async (data: RegisterData) => {
    return apiCall<AuthResponse>({
      url: '/auth/register',
      method: 'POST',
      data,
    });
  },

  logout: async () => {
    return apiCall({
      url: '/auth/logout',
      method: 'POST',
    });
  },
}; 