-- ============================================================================
-- Hen N Slice — Seed Data
-- Run AFTER 001_initial_schema.sql in Supabase SQL Editor.
-- Provides sample data for development: 1 branch, categories, menu items,
-- deals, and a delivery zone.
-- ============================================================================

-- 1. Branch (Karachi, Pakistan — PKR currency zone)
-- ============================================================================
INSERT INTO branches (id, name, slug, address, location, phone, opening_hours, image_url, delivery_radius_km, min_order_delivery, min_order_pickup)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Hen N Slice — Gulshan-e-Maymar',
  'gulshan-e-maymar',
  'Plot 17, Main University Road, Gulshan-e-Maymar, Karachi',
  ST_SetSRID(ST_MakePoint(67.0811, 24.9210), 4326)::geography,
  '+92-21-38471234',
  '{
    "mon": {"open": "11:00", "close": "23:00"},
    "tue": {"open": "11:00", "close": "23:00"},
    "wed": {"open": "11:00", "close": "23:00"},
    "thu": {"open": "11:00", "close": "23:00"},
    "fri": {"open": "13:00", "close": "23:00"},
    "sat": {"open": "11:00", "close": "00:00"},
    "sun": {"open": "11:00", "close": "22:00"}
  }'::jsonb,
  'https://images.unsplash.com/photo-1513639776629-7b61b0ac8cb4?w=800',
  8,
  350,
  0
);

-- 2. Delivery Zone (covers Gulshan-e-Maymar area)
-- ============================================================================
INSERT INTO delivery_zones (branch_id, name, boundary, fee, min_order)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Gulshan-e-Maymar & Surroundings',
  ST_SetSRID(ST_GeomFromGeoJSON('{
    "type": "Polygon",
    "coordinates": [[
      [67.05, 24.89],
      [67.12, 24.89],
      [67.12, 24.95],
      [67.05, 24.95],
      [67.05, 24.89]
    ]]
  }'), 4326),
  80,
  500
);

-- 3. Users — SKIPPED (must sign up via Supabase Auth first)
-- ============================================================================
-- Users are created through Supabase Auth. Once a user signs up, a trigger or
-- edge function copies their auth.users entry into this users table with
-- role='customer'. To create an admin, update the role manually after signup:
--   UPDATE users SET role = 'branch_admin' WHERE email = 'admin@hennslice.com';
-- Do NOT INSERT manually — users.id REFERENCES auth.users(id) ON DELETE CASCADE,
-- so the UUID must come from auth.users, not gen_random_uuid().

-- 4. Categories (5 categories matching the screenshot)
-- ============================================================================
INSERT INTO categories (id, branch_id, name, slug, icon_url, sort_order, is_active) VALUES
-- Category 1: Broast Buckets
(
  'b0000000-0001-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Broast Buckets',
  'broast-buckets',
  'https://img.icons8.com/fluency/96/chicken.png',
  1,
  true
),
-- Category 2: Burgers
(
  'b0000000-0002-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Burgers',
  'burgers',
  'https://img.icons8.com/fluency/96/hamburger.png',
  2,
  true
),
-- Category 3: Wraps
(
  'b0000000-0003-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Wraps',
  'wraps',
  'https://img.icons8.com/fluency/96/wrap.png',
  3,
  true
),
-- Category 4: Box Meals
(
  'b0000000-0004-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Box Meals',
  'box-meals',
  'https://img.icons8.com/fluency/96/dinner.png',
  4,
  true
),
-- Category 5: Sides & Drinks
(
  'b0000000-0005-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Sides & Drinks',
  'sides-drinks',
  'https://img.icons8.com/fluency/96/french-fries.png',
  5,
  true
);

-- 5. Menu Items (8 items — 2 featured, 2 popular)
-- ============================================================================
INSERT INTO menu_items (id, category_id, branch_id, name, description, price, discount_price, image_url, is_available, is_featured, is_popular, sort_order, modifier_groups) VALUES
-- Broast Buckets (2 items)
(
  'c0000000-0001-0000-0000-000000000001',
  'b0000000-0001-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  '6pc Broast Bucket',
  '6 pieces of our signature crispy broast chicken, served with garlic mayo and a fresh naan.',
  890,
  NULL,
  'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600',
  true,
  true,
  true,
  1,
  '[{"name": "Extra Dip", "options": [{"name": "Garlic Mayo", "price_adjustment": 0}, {"name": "BBQ Sauce", "price_adjustment": 0}, {"name": "Chili Garlic", "price_adjustment": 0}], "max": 2}]'::jsonb
),
(
  'c0000000-0002-0000-0000-000000000001',
  'b0000000-0001-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  '9pc Broast Bucket',
  '9 pieces of crispy broast chicken — perfect for sharing! Comes with 2 naans and a large dip.',
  1290,
  1190,
  'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600',
  true,
  true,
  true,
  2,
  '[{"name": "Extra Dip", "options": [{"name": "Garlic Mayo", "price_adjustment": 0}, {"name": "BBQ Sauce", "price_adjustment": 0}, {"name": "Chili Garlic", "price_adjustment": 0}], "max": 3}]'::jsonb
),
-- Burgers (2 items)
(
  'c0000000-0003-0000-0000-000000000001',
  'b0000000-0002-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Zinger Burger',
  'Crispy chicken fillet, lettuce, mayo, and our secret spice blend in a toasted bun.',
  350,
  NULL,
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
  true,
  false,
  true,
  1,
  '[{"name": "Add Cheese", "options": [{"name": "Cheddar Slice", "price_adjustment": 50}], "max": 1}]'::jsonb
),
(
  'c0000000-0004-0000-0000-000000000001',
  'b0000000-0002-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Grilled Chicken Burger',
  'Grilled chicken patty with fresh lettuce, tomatoes, and tangy yogurt sauce.',
  380,
  NULL,
  'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600',
  true,
  false,
  false,
  2,
  '[{"name": "Add Cheese", "options": [{"name": "Cheddar Slice", "price_adjustment": 50}], "max": 1}]'::jsonb
),
-- Wraps (1 item)
(
  'c0000000-0005-0000-0000-000000000001',
  'b0000000-0003-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Crispy Chicken Wrap',
  'Crispy chicken strips, fresh salad, and garlic mayo wrapped in a soft tortilla.',
  320,
  NULL,
  'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600',
  true,
  false,
  false,
  1,
  '[]'::jsonb
),
-- Box Meals (1 item)
(
  'c0000000-0006-0000-0000-000000000001',
  'b0000000-0004-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Mini Crispy Box',
  '2 pieces of broast chicken, small fries, coleslaw, and a drink. Perfect lunch box!',
  450,
  NULL,
  'https://images.unsplash.com/photo-1625225233840-695456021cde?w=600',
  true,
  false,
  false,
  1,
  '[{"name": "Drink Choice", "options": [{"name": "Pepsi", "price_adjustment": 0}, {"name": "7UP", "price_adjustment": 0}, {"name": "Water", "price_adjustment": 0}], "max": 1}]'::jsonb
),
-- Sides (1 item)
(
  'c0000000-0007-0000-0000-000000000001',
  'b0000000-0005-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Crispy Chicken Tenders (4pc)',
  '4 golden crispy chicken tenders served with your choice of dipping sauce.',
  290,
  250,
  'https://images.unsplash.com/photo-1562967914-608f82629710?w=600',
  true,
  false,
  false,
  1,
  '[{"name": "Dip", "options": [{"name": "Garlic Mayo", "price_adjustment": 0}, {"name": "BBQ Sauce", "price_adjustment": 0}, {"name": "Sweet Chili", "price_adjustment": 0}], "max": 1}]'::jsonb
),
-- Drinks (1 item)
(
  'c0000000-0008-0000-0000-000000000001',
  'b0000000-0005-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Large Fries + Drink Combo',
  'Large crispy fries with a chilled 500ml Pepsi or 7UP.',
  250,
  NULL,
  'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600',
  true,
  false,
  true,
  2,
  '[{"name": "Drink Choice", "options": [{"name": "Pepsi", "price_adjustment": 0}, {"name": "7UP", "price_adjustment": 0}], "max": 1}]'::jsonb
);

-- 6. Deals (3 deals for the homepage carousel)
-- ============================================================================
INSERT INTO deals (id, branch_id, title, description, image_url, discount_percent, discount_price, applicable_item_ids, valid_from, valid_until, is_active, sort_order) VALUES
(
  'd0000000-0001-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Bucket Deal — Buy 9pc Get 2pc Free!',
  'Order a 9pc Broast Bucket and get 2 extra pieces free. Use code BUCKET9.',
  'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=1200',
  22,
  NULL,
  ARRAY['c0000000-0002-0000-0000-000000000001'],
  '2025-01-01T00:00:00+05:00',
  '2027-12-31T23:59:59+05:00',
  true,
  1
),
(
  'd0000000-0002-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Lunch Special — Any Box Meal at Rs 399',
  'Grab our Mini Crispy Box or any box meal for just Rs 399 between 12 PM – 4 PM.',
  'https://images.unsplash.com/photo-1625225233840-695456021cde?w=1200',
  NULL,
  399,
  ARRAY['c0000000-0006-0000-0000-000000000001'],
  '2025-01-01T00:00:00+05:00',
  '2027-12-31T23:59:59+05:00',
  true,
  2
),
(
  'd0000000-0003-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Free Delivery on Orders Above Rs 500',
  'Order any items totalling Rs 500 or more and get free delivery anywhere in our zone.',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200',
  NULL,
  NULL,
  NULL,
  '2025-01-01T00:00:00+05:00',
  '2027-12-31T23:59:59+05:00',
  true,
  3
);
