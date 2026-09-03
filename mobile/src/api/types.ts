export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: string;
  current_store: number | null;
  needs_plan_subscription: boolean;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  theme: string;
  description: string | null;
  store_url: string;
  total_orders: number;
  total_customers: number;
  total_revenue: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  cover_image: string | null;
  is_active: boolean;
  category: { id: number; name: string } | null;
}

export interface OrderSummary {
  id: number;
  order_number: string;
  customer: string;
  total: number;
  status: OrderStatus;
  payment_status: string;
  items_count: number;
  created_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface OrderDetail {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: string;
  payment_method: string | null;
  customer: { name: string; email: string; phone: string };
  shipping_address: string | null;
  items: Array<{
    id: number;
    name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    image: string | null;
    variants: unknown;
  }>;
  summary: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };
  shipping_method: string | null;
  tracking_number: string | null;
  created_at: string;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface Subscription {
  plan: { id: number; name: string; price: number; yearly_price: number; is_default: boolean } | null;
  is_trial: boolean;
  trial_expire_date: string | null;
  plan_expire_date: string | null;
  has_active_plan: boolean;
  needs_plan_subscription: boolean;
  limits: {
    max_stores: number;
    max_users_per_store: number;
    max_products_per_store: number;
    storage_limit: number;
  };
  usage: { stores: number; products: number };
}
