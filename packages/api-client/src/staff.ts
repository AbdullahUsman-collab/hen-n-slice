import type { User, Driver, UserRole } from '@hen-n-slice/types';
import { createClient } from './client';

const supabase = createClient();

export async function lookupUserByEmail(
  email: string,
): Promise<User | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  return data;
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<User | null> {
  const { data } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();
  return data;
}

export async function getStaffByBranch(
  branchId: string,
): Promise<{ users: User[]; drivers: Driver[] }> {
  const [usersRes, driversRes] = await Promise.all([
    supabase
      .from('users')
      .select('*')
      .or(`role.eq.staff,role.eq.branch_admin`),
    supabase
      .from('drivers')
      .select('*')
      .eq('branch_id', branchId),
  ]);
  return {
    users: usersRes.data ?? [],
    drivers: driversRes.data ?? [],
  };
}

export async function assignDriver(
  userId: string,
  branchId: string,
  phone: string | null,
  vehicleInfo: string | null,
): Promise<Driver | null> {
  const { data } = await supabase
    .from('drivers')
    .insert({
      id: userId,
      branch_id: branchId,
      full_name: '',
      phone,
      vehicle_info: vehicleInfo,
    })
    .select()
    .single();
  return data;
}

export async function removeDriver(driverId: string): Promise<void> {
  await supabase.from('drivers').delete().eq('id', driverId);
}

export async function updateDriverInfo(
  driverId: string,
  data: { full_name?: string; phone?: string | null; vehicle_info?: string | null },
): Promise<Driver | null> {
  const { data: result } = await supabase
    .from('drivers')
    .update(data)
    .eq('id', driverId)
    .select()
    .single();
  return result;
}
