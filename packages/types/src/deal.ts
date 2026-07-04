export interface Deal {
  id: string;
  branch_id?: string | null;
  title: string;
  title_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  image_url?: string | null;
  discount_percent?: number | null;
  discount_price?: number | null;
  applicable_item_ids?: string[] | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  sort_order: number;
}

export interface DealWithDiscount extends Deal {
  savings: number;
}
