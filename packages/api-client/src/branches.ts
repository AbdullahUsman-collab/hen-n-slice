import type { Branch, BranchWithDistance } from '@hen-n-slice/types';
import { createClient } from './client';

const supabase = createClient();

export async function getActiveBranches(): Promise<Branch[]> {
  const { data } = await supabase
    .from('branches')
    .select('*')
    .eq('is_active', true)
    .order('name');
  return data ?? [];
}

export async function getBranchBySlug(slug: string): Promise<Branch | null> {
  const { data } = await supabase
    .from('branches')
    .select('*')
    .eq('slug', slug)
    .single();
  return data;
}

export async function findNearestBranches(
  lat: number,
  lng: number,
  radius?: number,
): Promise<BranchWithDistance[]> {
  const { data } = await supabase.rpc('find_nearest_branches', {
    ref_lat: lat,
    ref_lng: lng,
    radius_km: radius ?? 15,
  });
  return data ?? [];
}
