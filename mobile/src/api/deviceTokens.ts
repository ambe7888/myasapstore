import { apiClient } from './client';

export async function registerDeviceToken(token: string, platform: 'ios' | 'android') {
  await apiClient.post('/device-tokens', { token, platform });
}

export async function unregisterDeviceToken(token: string) {
  await apiClient.delete('/device-tokens', { data: { token } });
}
