import type { Address } from './user';

export type OrderType = 'delivery' | 'pickup';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'wallet';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItemModifiers {
  [groupName: string]: string[];
}

export interface OrderItem {
  menu_item_id: string;
  name: string;
  qty: number;
  unit_price: number;
  modifiers?: OrderItemModifiers | null;
  subtotal: number;
}

export interface Order {
  id: string;
  user_id: string;
  branch_id: string;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  delivery_address?: Address | null;
  notes?: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  created_at: string;
  estimated_ready_at?: string | null;
  driver_id?: string | null;
  driver_assigned_at?: string | null;
}

export interface CreateOrderInput {
  user_id: string;
  branch_id: string;
  type: OrderType;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_address?: Address | null;
  notes?: string | null;
  payment_method: PaymentMethod;
}
