export interface Driver {
  id: string;
  branch_id: string;
  full_name: string;
  phone?: string | null;
  vehicle_info?: string | null;
  is_available: boolean;
  current_location?: { lat: number; lng: number } | null;
  created_at: string;
}
