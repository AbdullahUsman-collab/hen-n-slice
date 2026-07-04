import type { Category, MenuItem } from '@hen-n-slice/types';
import { createClient } from './client';

const supabase = createClient();

export async function getCategories(branchId: string): Promise<Category[]> {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .or(`branch_id.eq.${branchId},branch_id.is.null`)
    .eq('is_active', true)
    .order('sort_order');
  return data ?? [];
}

export async function getMenuItems(
  branchId: string,
  categoryId?: string,
): Promise<MenuItem[]> {
  let query = supabase
    .from('menu_items')
    .select('*')
    .or(`branch_id.eq.${branchId},branch_id.is.null`)
    .eq('is_available', true)
    .order('sort_order');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getFeaturedItems(branchId: string): Promise<MenuItem[]> {
  const { data } = await supabase
    .from('menu_items')
    .select('*')
    .or(`branch_id.eq.${branchId},branch_id.is.null`)
    .eq('is_featured', true)
    .eq('is_available', true)
    .order('sort_order');
  return data ?? [];
}

export async function getPopularItems(branchId: string): Promise<MenuItem[]> {
  const { data } = await supabase
    .from('menu_items')
    .select('*')
    .or(`branch_id.eq.${branchId},branch_id.is.null`)
    .eq('is_popular', true)
    .eq('is_available', true)
    .order('sort_order');
  return data ?? [];
}
