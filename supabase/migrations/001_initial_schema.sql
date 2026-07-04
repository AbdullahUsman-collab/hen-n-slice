-- ============================================================================
-- Hen N Slice — Initial Schema
-- Run this in Supabase SQL Editor. Creates all tables, indexes, RLS policies,
-- and storage buckets for the platform.
-- ============================================================================

-- 0. Extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Branches (referenced by users FK, so created first)
-- ============================================================================
CREATE TABLE branches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  address       text,
  location      geography(Point, 4326),
  phone         text,
  opening_hours jsonb DEFAULT '{}'::jsonb,
  is_active     boolean NOT NULL DEFAULT true,
  image_url     text,
  delivery_radius_km numeric NOT NULL DEFAULT 5,
  min_order_delivery  numeric NOT NULL DEFAULT 0,
  min_order_pickup    numeric NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_branches_location ON branches USING GIST (location);
CREATE INDEX idx_branches_slug ON branches (slug);
CREATE INDEX idx_branches_active ON branches (is_active) WHERE is_active = true;

-- 2. Users (references auth.users + branches)
-- ============================================================================
CREATE TABLE users (
  id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone             text,
  email             text,
  full_name         text,
  avatar_url        text,
  role              text NOT NULL DEFAULT 'customer'
                    CHECK (role IN ('customer', 'branch_admin', 'super_admin')),
  default_branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  default_address   jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_phone ON users (phone);
CREATE INDEX idx_users_email ON users (email);

-- 3. Delivery Zones (references branches)
-- ============================================================================
CREATE TABLE delivery_zones (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name      text NOT NULL,
  boundary  geometry(Polygon, 4326),
  fee       numeric NOT NULL DEFAULT 0,
  min_order numeric NOT NULL DEFAULT 0
);

CREATE INDEX idx_delivery_zones_branch ON delivery_zones (branch_id);
CREATE INDEX idx_delivery_zones_boundary ON delivery_zones USING GIST (boundary);

-- 4. Categories (references branches, nullable)
-- ============================================================================
CREATE TABLE categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id  uuid REFERENCES branches(id) ON DELETE CASCADE,
  name       text NOT NULL,
  name_ar    text,
  slug       text NOT NULL,
  icon_url   text,
  sort_order smallint NOT NULL DEFAULT 0,
  is_active  boolean NOT NULL DEFAULT true
);

CREATE INDEX idx_categories_branch ON categories (branch_id);
CREATE INDEX idx_categories_slug ON categories (slug);

-- 5. Menu Items (references categories + branches)
-- ============================================================================
CREATE TABLE menu_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  branch_id       uuid REFERENCES branches(id) ON DELETE CASCADE,
  name            text NOT NULL,
  name_ar         text,
  description     text,
  description_ar  text,
  price           numeric NOT NULL,
  discount_price  numeric,
  image_url       text,
  is_available    boolean NOT NULL DEFAULT true,
  is_featured     boolean NOT NULL DEFAULT false,
  is_popular      boolean NOT NULL DEFAULT false,
  sort_order      smallint NOT NULL DEFAULT 0,
  modifier_groups jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX idx_menu_items_category ON menu_items (category_id);
CREATE INDEX idx_menu_items_branch_category_sort
  ON menu_items (branch_id, category_id, sort_order);
CREATE INDEX idx_menu_items_featured ON menu_items (branch_id, is_featured)
  WHERE is_featured = true;
CREATE INDEX idx_menu_items_popular ON menu_items (branch_id, is_popular)
  WHERE is_popular = true;
CREATE INDEX idx_menu_items_available ON menu_items (is_available)
  WHERE is_available = true;

-- 6. Deals (references branches, nullable)
-- ============================================================================
CREATE TABLE deals (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id          uuid REFERENCES branches(id) ON DELETE CASCADE,
  title              text NOT NULL,
  title_ar           text,
  description        text,
  description_ar     text,
  image_url          text,
  discount_percent   smallint,
  discount_price     numeric,
  applicable_item_ids uuid[],
  valid_from         timestamptz NOT NULL,
  valid_until        timestamptz NOT NULL,
  is_active          boolean NOT NULL DEFAULT true,
  sort_order         smallint NOT NULL DEFAULT 0
);

CREATE INDEX idx_deals_branch ON deals (branch_id);
CREATE INDEX idx_deals_active_dates ON deals (is_active, valid_from, valid_until);
CREATE INDEX idx_deals_sort ON deals (sort_order);

-- 7. Orders (references users + branches)
-- ============================================================================
CREATE TABLE orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  branch_id         uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  type              text NOT NULL CHECK (type IN ('delivery', 'pickup')),
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'preparing',
                                      'ready', 'completed', 'cancelled')),
  items             jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal          numeric NOT NULL DEFAULT 0,
  delivery_fee      numeric NOT NULL DEFAULT 0,
  discount          numeric NOT NULL DEFAULT 0,
  total             numeric NOT NULL DEFAULT 0,
  delivery_address  jsonb,
  notes             text,
  payment_method    text NOT NULL DEFAULT 'cash'
                    CHECK (payment_method IN ('cash', 'card', 'wallet')),
  payment_status    text NOT NULL DEFAULT 'pending'
                    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  estimated_ready_at timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);
CREATE INDEX idx_orders_branch_status ON orders (branch_id, status);

-- ============================================================================
-- Row-Level Security (RLS)
-- ============================================================================

-- Branches: public read, admin write
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY branches_select_all ON branches FOR SELECT USING (true);
CREATE POLICY branches_insert_admin ON branches FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));
CREATE POLICY branches_update_admin ON branches FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));
CREATE POLICY branches_delete_admin ON branches FOR DELETE
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'super_admin'));

-- Users: read own, admin read all, update own
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_select_self ON users FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY users_select_admin ON users FOR SELECT
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));
CREATE POLICY users_update_self ON users FOR UPDATE
  USING (auth.uid() = id);
CREATE POLICY users_insert_trigger ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Delivery zones: public read, branch_admin/super_admin write
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY dz_select_all ON delivery_zones FOR SELECT USING (true);
CREATE POLICY dz_insert_admin ON delivery_zones FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));
CREATE POLICY dz_update_admin ON delivery_zones FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));
CREATE POLICY dz_delete_admin ON delivery_zones FOR DELETE
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'super_admin'));

-- Categories: public read, admin write
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_select_all ON categories FOR SELECT USING (true);
CREATE POLICY categories_insert_admin ON categories FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));
CREATE POLICY categories_update_admin ON categories FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));
CREATE POLICY categories_delete_admin ON categories FOR DELETE
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'super_admin'));

-- Menu items: public read, admin write
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY menu_select_all ON menu_items FOR SELECT USING (true);
CREATE POLICY menu_insert_admin ON menu_items FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));
CREATE POLICY menu_update_admin ON menu_items FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));
CREATE POLICY menu_delete_admin ON menu_items FOR DELETE
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'super_admin'));

-- Deals: public read, admin write
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY deals_select_all ON deals FOR SELECT USING (true);
CREATE POLICY deals_insert_admin ON deals FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));
CREATE POLICY deals_update_admin ON deals FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));
CREATE POLICY deals_delete_admin ON deals FOR DELETE
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'super_admin'));

-- Orders: user reads own, admin reads all assigned
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_select_self ON orders FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY orders_select_admin ON orders FOR SELECT
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));
CREATE POLICY orders_insert_self ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY orders_update_self ON orders FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('pending', 'confirmed'));
CREATE POLICY orders_update_admin ON orders FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));
CREATE POLICY orders_delete_admin ON orders FOR DELETE
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'super_admin'));

-- ============================================================================
-- Helper Functions (for RPC calls from api-client)
-- ============================================================================

-- Find nearest active branches within a given radius
CREATE OR REPLACE FUNCTION find_nearest_branches(
  ref_lat double precision,
  ref_lng double precision,
  radius_km double precision DEFAULT 15
)
RETURNS TABLE (
  id                  uuid,
  name                text,
  slug                text,
  address             text,
  location_json       jsonb,
  phone               text,
  opening_hours       jsonb,
  is_active           boolean,
  image_url           text,
  delivery_radius_km  numeric,
  min_order_delivery  numeric,
  min_order_pickup    numeric,
  distance_km         double precision
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    b.id, b.name, b.slug, b.address,
    ST_AsGeoJSON(b.location)::jsonb AS location_json,
    b.phone, b.opening_hours, b.is_active,
    b.image_url, b.delivery_radius_km,
    b.min_order_delivery, b.min_order_pickup,
    ST_Distance(b.location, ST_SetSRID(ST_MakePoint(ref_lng, ref_lat), 4326)::geography) / 1000 AS distance_km
  FROM branches b
  WHERE b.is_active = true
    AND ST_DWithin(
          b.location,
          ST_SetSRID(ST_MakePoint(ref_lng, ref_lat), 4326)::geography,
          radius_km * 1000
        )
  ORDER BY distance_km ASC;
$$;

-- Check if a point falls within any delivery zone for a given branch
CREATE OR REPLACE FUNCTION check_delivery_zone(
  ref_branch_id uuid,
  ref_lat double precision,
  ref_lng double precision
)
RETURNS TABLE (
  zone_id   uuid,
  zone_name text,
  fee       numeric,
  min_order numeric
)
LANGUAGE SQL STABLE
AS $$
  SELECT dz.id, dz.name, dz.fee, dz.min_order
  FROM delivery_zones dz
  WHERE dz.branch_id = ref_branch_id
    AND ST_Contains(
          dz.boundary,
          ST_SetSRID(ST_MakePoint(ref_lng, ref_lat), 4326)
        )
  LIMIT 1;
$$;
