import { apiClient } from './client';
import type { Store } from './types';

export async function fetchStores() {
  const { data } = await apiClient.get<{ stores: Store[] }>('/stores');
  return data.stores;
}

export async function fetchStore(storeId: number) {
  const { data } = await apiClient.get<{ store: Store }>(`/stores/${storeId}`);
  return data.store;
}

export async function createStore(payload: { name: string; description?: string; theme: string }) {
  const { data } = await apiClient.post<{ store: Store }>('/stores', payload);
  return data.store;
}
