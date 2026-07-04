export interface BranchCoordinates {
  lat: number;
  lng: number;
}

export interface BranchOpeningHours {
  open: string;
  close: string;
}

export interface Branch {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  location: BranchCoordinates;
  phone?: string | null;
  opening_hours?: Record<string, BranchOpeningHours> | null;
  is_active: boolean;
  image_url?: string | null;
  delivery_radius_km: number;
  min_order_delivery: number;
  min_order_pickup: number;
}

export interface BranchWithDistance extends Branch {
  distance_km: number;
}
