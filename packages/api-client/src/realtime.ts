import type { OrderStatus } from '@hen-n-slice/types';
import { createClient } from './client';

type UnsubscribeFn = () => void;

export function subscribeToOrderStatus(
  orderId: string,
  callback: (status: OrderStatus) => void,
): UnsubscribeFn {
  const supabase = createClient();

  const channel = supabase
    .channel(`order-status-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        const newStatus = payload.new?.status as OrderStatus | undefined;
        if (newStatus) {
          callback(newStatus);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
