import type { MenuItem } from './menu';
import type { OrderType } from './order';
import type { OrderItemModifiers } from './order';
import type { Address } from './user';

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  modifiers?: OrderItemModifiers | null;
  subtotal: number;
}

export interface CartState {
  items: CartItem[];
  branchId: string | null;
  type: OrderType;
  deliveryAddress?: Address | null;
  notes?: string;
}
