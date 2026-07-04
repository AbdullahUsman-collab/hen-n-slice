import type { Deal } from '@hen-n-slice/types';
import { createClient } from './client';

const supabase = createClient();

export async function getActiveDeals(branchId?: string): Promise<Deal[]> {
  const now = new Date().toISOString();
  let query = supabase
    .from('deals')
    .select('*')
    .eq('is_active', true)
    .lte('valid_from', now)
    .gte('valid_until', now)
    .order('sort_order');

  if (branchId) {
    query = query.or(`branch_id.eq.${branchId},branch_id.is.null`);
  }

  const { data } = await query;
  return data ?? [];
}
