import type { OrderItem, Deal } from '@hen-n-slice/types';

export function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

export function applyDealDiscount(
  subtotal: number,
  deal: Deal,
): { discountedTotal: number; saved: number } {
  if (deal.discount_percent) {
    const saved = Math.round(subtotal * (deal.discount_percent / 100) * 100) / 100;
    return { discountedTotal: subtotal - saved, saved };
  }
  if (deal.discount_price != null) {
    return { discountedTotal: deal.discount_price, saved: subtotal - deal.discount_price };
  }
  return { discountedTotal: subtotal, saved: 0 };
}

export function calculateTotal(
  subtotal: number,
  deliveryFee: number,
  discount: number,
): number {
  return Math.max(0, subtotal + deliveryFee - discount);
}
