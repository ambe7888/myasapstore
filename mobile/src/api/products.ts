import { apiClient } from './client';
import type { Pagination, Product } from './types';

export interface ProductPayload {
  name: string;
  price: number;
  stock: number;
  sku?: string;
  description?: string;
  sale_price?: number;
  cover_image?: string;
  category_id?: number;
  is_active?: boolean;
}

export async function fetchProducts(storeId: number, page = 1) {
  const { data } = await apiClient.get<{ products: Product[]; pagination: Pagination }>('/products', {
    params: { store_id: storeId, page },
  });
  return data;
}

export async function fetchProduct(productId: number) {
  const { data } = await apiClient.get<{ product: Product }>(`/products/${productId}`);
  return data.product;
}

export async function createProduct(storeId: number, payload: ProductPayload) {
  const { data } = await apiClient.post<{ product: Product }>('/products', { store_id: storeId, ...payload });
  return data.product;
}

export async function updateProduct(productId: number, payload: ProductPayload) {
  const { data } = await apiClient.put<{ product: Product }>(`/products/${productId}`, payload);
  return data.product;
}

export async function deleteProduct(productId: number) {
  await apiClient.delete(`/products/${productId}`);
}
