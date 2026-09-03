import { apiClient } from './client';
import type { User } from './types';

export interface RegisterPayload {
  name: string;
  store_name: string;
  email: string;
  phone: string;
  country_code: string;
  password: string;
  password_confirmation: string;
}

export async function registerSeller(payload: RegisterPayload) {
  const { data } = await apiClient.post<{ token: string; user: User }>('/auth/register', payload);
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<{ token: string; user: User }>('/auth/login', { email, password });
  return data;
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

export async function fetchMe() {
  const { data } = await apiClient.get<{ user: User }>('/auth/me');
  return data.user;
}
