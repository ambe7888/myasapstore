import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { Accept: 'application/json' },
});

// The session provider (src/lib/session.tsx) keeps this in sync with the
// persisted token. Kept outside React state so the axios interceptor (which
// runs outside the component tree) always reads the latest value.
let currentToken: string | null = null;

export function setApiToken(token: string | null) {
  currentToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

export interface ApiErrorShape {
  message?: string;
  errors?: Record<string, string[]>;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorShape | undefined;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      if (first?.[0]) return first[0];
    }
    if (data?.message) return data.message;
  }
  return 'Une erreur est survenue. Veuillez réessayer.';
}
