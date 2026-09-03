import { apiClient } from './client';
import type { Subscription } from './types';

export async function fetchSubscription() {
  const { data } = await apiClient.get<Subscription>('/subscription');
  return data;
}

export interface PlanOption {
  id: number;
  name: string;
  description: string | null;
  price: number;
  yearly_price: number;
  max_stores: number;
  max_products_per_store: number;
  max_users_per_store: number;
  is_default: boolean;
}

export async function fetchPlans() {
  const { data } = await apiClient.get<{ plans: PlanOption[] }>('/plans');
  return data.plans;
}
