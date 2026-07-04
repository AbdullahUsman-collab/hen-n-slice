import type { DeliveryZone } from '@hen-n-slice/types';
import { createClient } from './client';

const supabase = createClient();

export async function checkDeliveryAvailability(
  branchId: string,
  lat: number,
  lng: number,
): Promise<{ available: boolean; zone?: DeliveryZone; fee?: number }> {
  const { data } = await supabase.rpc('check_delivery_zone', {
    ref_branch_id: branchId,
    ref_lat: lat,
    ref_lng: lng,
  });

  if (!data) {
    return { available: false };
  }

  return { available: true, zone: data, fee: data.fee };
}
