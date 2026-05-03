import { api, setAuthToken, clearAuthToken } from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  role?: 'owner' | 'veterinarian' | 'admin';
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'owner' | 'veterinarian' | 'admin';
  profileImageUrl?: string;
  phoneNumber?: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<{ user: User; token: string }> {
    const { data } = await api.post('/auth/login', payload);
    await setAuthToken(data.token);
    return { user: data.user, token: data.token };
  },

  async register(payload: RegisterPayload): Promise<{ user: User; token: string }> {
    const { data } = await api.post('/auth/register', payload);
    await setAuthToken(data.token);
    return { user: data.user, token: data.token };
  },

  async getMe(): Promise<User> {
    const { data } = await api.get('/auth/me');
    return data.user;
  },

  async logout(): Promise<void> {
    await clearAuthToken();
  },
};
