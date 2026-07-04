import type { Order, OrderStatus, CreateOrderInput, Driver } from '@hen-n-slice/types';
import { createClient } from './client';

const supabase = createClient();

export async function createOrder(
  input: CreateOrderInput,
): Promise<Order | null> {
  const { data } = await supabase
    .from('orders')
    .insert({
      ...input,
      status: 'pending',
      discount: 0,
      payment_status: 'pending',
    })
    .select()
    .single();
  return data;
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function cancelOrder(id: string): Promise<void> {
  await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', id);
}

export async function getAvailableDrivers(
  branchId: string,
): Promise<Driver[]> {
  const { data } = await supabase
    .from('drivers')
    .select('*')
    .eq('branch_id', branchId)
    .eq('is_available', true);
  return data ?? [];
}

export async function assignDriver(
  orderId: string,
  driverId: string,
): Promise<Order | null> {
  const { data } = await supabase
    .from('orders')
    .update({
      driver_id: driverId,
      driver_assigned_at: new Date().toISOString(),
      status: 'confirmed',
    })
    .eq('id', orderId)
    .select()
    .single();
  return data;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order | null> {
  const { data } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();
  return data;
}

export async function getAdminOrders(
  branchId?: string,
): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (branchId) {
    query = query.eq('branch_id', branchId);
  }
  const { data } = await query;
  return data ?? [];
}

export async function getUsersByIds(
  ids: string[],
): Promise<{ id: string; email: string | null; full_name: string | null }[]> {
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from('users')
    .select('id, email, full_name')
    .in('id', ids);
  return data ?? [];
}
