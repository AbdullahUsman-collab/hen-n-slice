import type { Branch, DeliveryZone, OrderItem, OrderType, Address } from '@hen-n-slice/types';

interface OrderValidationInput {
  items: OrderItem[];
  type: OrderType;
  branchId: string;
  address?: Address | null;
}

export function validateOrder(
  input: OrderValidationInput,
  branch: Branch,
  zones?: DeliveryZone[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.items.length) {
    errors.push('Cart is empty');
  }

  if (input.type === 'delivery') {
    if (!input.address) {
      errors.push('Delivery address is required');
    }
    if ((input.items.reduce((s, i) => s + i.subtotal, 0)) < branch.min_order_delivery) {
      errors.push(`Minimum order for delivery is PKR ${branch.min_order_delivery}`);
    }
  }

  if (input.type === 'pickup') {
    if ((input.items.reduce((s, i) => s + i.subtotal, 0)) < branch.min_order_pickup) {
      errors.push(`Minimum order for pickup is PKR ${branch.min_order_pickup}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function canDeliverTo(
  branch: Branch,
  lat: number,
  lng: number,
  zones: DeliveryZone[],
): boolean {
  const branchZones = zones.filter((z) => z.branch_id === branch.id);
  return branchZones.length > 0;
}
