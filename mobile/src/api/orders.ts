import { apiClient } from './client';
import type { OrderDetail, OrderStatus, OrderSummary, Pagination } from './types';

export async function fetchOrders(storeId: number, page = 1, status?: string) {
  const { data } = await apiClient.get<{ orders: OrderSummary[]; pagination: Pagination }>('/orders', {
    params: { store_id: storeId, page, status },
  });
  return data;
}

export async function fetchOrder(orderId: number) {
  const { data } = await apiClient.get<{ order: OrderDetail }>(`/orders/${orderId}`);
  return data.order;
}

export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  const { data } = await apiClient.patch<{ order: OrderSummary }>(`/orders/${orderId}/status`, { status });
  return data.order;
}
