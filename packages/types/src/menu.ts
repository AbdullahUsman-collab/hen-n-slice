export interface Category {
  id: string;
  branch_id?: string | null;
  name: string;
  name_ar?: string | null;
  slug: string;
  icon_url?: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ModifierOption {
  name: string;
  price_adjustment: number;
}

export interface ModifierGroup {
  name: string;
  options: ModifierOption[];
  max: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  branch_id?: string | null;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  price: number;
  discount_price?: number | null;
  image_url?: string | null;
  is_available: boolean;
  is_featured: boolean;
  is_popular: boolean;
  sort_order: number;
  modifier_groups: ModifierGroup[];
}

export interface MenuItemWithCategory extends MenuItem {
  category: Category;
}
