export type UserRole = 'customer' | 'staff' | 'branch_admin' | 'super_admin';

export interface Address {
  text: string;
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  phone?: string | null;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  default_branch_id?: string | null;
  default_address?: Address | null;
  created_at: string;
}
