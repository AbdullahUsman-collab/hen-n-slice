-- ============================================================================
-- Hen N Slice — 003: Migrate from Supabase Auth to Clerk
--
-- Clerk user IDs are text strings (e.g. "user_xxx"), not UUIDs.
-- This migration changes the PK/FK types from uuid to text and removes
-- FK constraints to auth.users (which remains uuid).
-- RLS continues to work because Supabase maps the Clerk JWT "sub" claim
-- to auth.uid() when third-party auth is configured.
--
-- NOTE 1: Every RLS policy across the entire schema must be dropped before
-- ALTER COLUMN TYPE because PG forbids changing a column's type when any
-- policy references it — even indirectly via subqueries like
-- auth.uid() IN (SELECT id FROM users WHERE role IN (...)).
-- All policies are recreated verbatim after the type changes.
--
-- NOTE 2: auth.uid() returns type uuid, but all id/user_id/driver_id
-- columns are now text. Every comparison needs an explicit ::text cast.
-- ============================================================================

-- 1. Drop EVERY RLS policy across all tables
-- ============================================================================

-- branches
DROP POLICY IF EXISTS branches_select_all    ON branches;
DROP POLICY IF EXISTS branches_insert_admin   ON branches;
DROP POLICY IF EXISTS branches_update_admin   ON branches;
DROP POLICY IF EXISTS branches_delete_admin   ON branches;

-- users
DROP POLICY IF EXISTS users_select_self      ON users;
DROP POLICY IF EXISTS users_select_admin     ON users;
DROP POLICY IF EXISTS users_update_self      ON users;
DROP POLICY IF EXISTS users_insert_trigger   ON users;

-- delivery_zones
DROP POLICY IF EXISTS dz_select_all          ON delivery_zones;
DROP POLICY IF EXISTS dz_insert_admin        ON delivery_zones;
DROP POLICY IF EXISTS dz_update_admin        ON delivery_zones;
DROP POLICY IF EXISTS dz_delete_admin        ON delivery_zones;

-- categories
DROP POLICY IF EXISTS categories_select_all  ON categories;
DROP POLICY IF EXISTS categories_insert_admin ON categories;
DROP POLICY IF EXISTS categories_update_admin ON categories;
DROP POLICY IF EXISTS categories_delete_admin ON categories;

-- menu_items
DROP POLICY IF EXISTS menu_select_all        ON menu_items;
DROP POLICY IF EXISTS menu_insert_admin      ON menu_items;
DROP POLICY IF EXISTS menu_update_admin      ON menu_items;
DROP POLICY IF EXISTS menu_delete_admin      ON menu_items;

-- deals
DROP POLICY IF EXISTS deals_select_all       ON deals;
DROP POLICY IF EXISTS deals_insert_admin     ON deals;
DROP POLICY IF EXISTS deals_update_admin     ON deals;
DROP POLICY IF EXISTS deals_delete_admin     ON deals;

-- orders (from 001_initial_schema.sql)
DROP POLICY IF EXISTS orders_select_self     ON orders;
DROP POLICY IF EXISTS orders_select_admin    ON orders;
DROP POLICY IF EXISTS orders_insert_self     ON orders;
DROP POLICY IF EXISTS orders_update_self     ON orders;
DROP POLICY IF EXISTS orders_update_admin    ON orders;
DROP POLICY IF EXISTS orders_delete_admin    ON orders;

-- orders (from 002_drivers.sql)
DROP POLICY IF EXISTS orders_select_driver   ON orders;
DROP POLICY IF EXISTS orders_update_driver   ON orders;

-- drivers
DROP POLICY IF EXISTS drivers_select_self    ON drivers;
DROP POLICY IF EXISTS drivers_select_admin   ON drivers;
DROP POLICY IF EXISTS drivers_update_self    ON drivers;
DROP POLICY IF EXISTS drivers_update_admin   ON drivers;
DROP POLICY IF EXISTS drivers_insert_admin   ON drivers;

-- 2. Drop foreign keys that reference columns whose types are changing
-- ============================================================================
ALTER TABLE orders      DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders      DROP CONSTRAINT IF EXISTS orders_driver_id_fkey;
ALTER TABLE drivers     DROP CONSTRAINT IF EXISTS drivers_id_fkey;
ALTER TABLE users       DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 3. Drop the PK constraint temporarily (needed to alter the column type)
-- ============================================================================
ALTER TABLE users   DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE drivers DROP CONSTRAINT IF EXISTS drivers_pkey;

-- 4. Change column types from uuid to text
-- ============================================================================
ALTER TABLE users   ALTER COLUMN id           TYPE text;
ALTER TABLE orders  ALTER COLUMN user_id      TYPE text;
ALTER TABLE orders  ALTER COLUMN driver_id    TYPE text;
ALTER TABLE drivers ALTER COLUMN id           TYPE text;

-- 5. Restore primary keys
-- ============================================================================
ALTER TABLE users   ADD PRIMARY KEY (id);
ALTER TABLE drivers ADD PRIMARY KEY (id);

-- 6. Restore foreign keys (note: no FK back to auth.users — ids are now text)
-- ============================================================================
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE orders ADD CONSTRAINT orders_driver_id_fkey
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL;

-- 7. Recreate ALL RLS policies with auth.uid()::text casts
-- ============================================================================

-- branches
CREATE POLICY branches_select_all ON branches FOR SELECT USING (true);

CREATE POLICY branches_insert_admin ON branches FOR INSERT
  WITH CHECK (auth.uid()::text IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));

CREATE POLICY branches_update_admin ON branches FOR UPDATE
  USING (auth.uid()::text IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));

CREATE POLICY branches_delete_admin ON branches FOR DELETE
  USING (auth.uid()::text IN (SELECT id FROM users WHERE role = 'super_admin'));

-- users
CREATE POLICY users_select_self ON users FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY users_select_admin ON users FOR SELECT
  USING (auth.uid()::text IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));

CREATE POLICY users_update_self ON users FOR UPDATE
  USING (auth.uid()::text = id);

CREATE POLICY users_insert_trigger ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id);

-- delivery_zones
CREATE POLICY dz_select_all ON delivery_zones FOR SELECT USING (true);

CREATE POLICY dz_insert_admin ON delivery_zones FOR INSERT
  WITH CHECK (auth.uid()::text IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));

CREATE POLICY dz_update_admin ON delivery_zones FOR UPDATE
  USING (auth.uid()::text IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));

CREATE POLICY dz_delete_admin ON delivery_zones FOR DELETE
  USING (auth.uid()::text IN (SELECT id FROM users WHERE role = 'super_admin'));

-- categories
CREATE POLICY categories_select_all ON categories FOR SELECT USING (true);

CREATE POLICY categories_insert_admin ON categories FOR INSERT
  WITH CHECK (auth.uid()::text IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));

CREATE POLICY categories_update_admin ON categories FOR UPDATE
  USING (auth.uid()::text IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));

CREATE POLICY categories_delete_admin ON categories FOR DELETE
  USING (auth.uid()::text IN (SELECT id FROM users WHERE role = 'super_admin'));

-- menu_items
CREATE POLICY menu_select_all ON menu_items FOR SELECT USING (true);

CREATE POLICY menu_insert_admin ON menu_items FOR INSERT
  WITH CHECK (auth.uid()::text IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));

CREATE POLICY menu_update_admin ON menu_items FOR UPDATE
  USING (auth.uid()::text IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));

CREATE POLICY menu_delete_admin ON menu_items FOR DELETE
  USING (auth.uid()::text IN (SELECT id FROM users WHERE role = 'super_admin'));

-- deals
CREATE POLICY deals_select_all ON deals FOR SELECT USING (true);

CREATE POLICY deals_insert_admin ON deals FOR INSERT
  WITH CHECK (auth.uid()::text IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));

CREATE POLICY deals_update_admin ON deals FOR UPDATE
  USING (auth.uid()::text IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));

CREATE POLICY deals_delete_admin ON deals FOR DELETE
  USING (auth.uid()::text IN (SELECT id FROM users WHERE role = 'super_admin'));

-- orders (from 001_initial_schema.sql)
CREATE POLICY orders_select_self ON orders FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY orders_select_admin ON orders FOR SELECT
  USING (auth.uid()::text IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));

CREATE POLICY orders_insert_self ON orders FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY orders_update_self ON orders FOR UPDATE
  USING (auth.uid()::text = user_id AND status IN ('pending', 'confirmed'));

CREATE POLICY orders_update_admin ON orders FOR UPDATE
  USING (auth.uid()::text IN (SELECT id FROM users WHERE role IN ('branch_admin', 'super_admin')));

CREATE POLICY orders_delete_admin ON orders FOR DELETE
  USING (auth.uid()::text IN (SELECT id FROM users WHERE role = 'super_admin'));

-- orders (from 002_drivers.sql)
CREATE POLICY orders_select_driver ON orders FOR SELECT
  USING (auth.uid()::text = driver_id);

CREATE POLICY orders_update_driver ON orders FOR UPDATE
  USING (
    auth.uid()::text = driver_id
    AND status IN ('confirmed', 'preparing', 'ready')
  );

-- drivers
CREATE POLICY drivers_select_self ON drivers FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY drivers_select_admin ON drivers FOR SELECT
  USING (auth.uid()::text IN (
    SELECT u.id FROM users u
    WHERE u.role IN ('branch_admin', 'super_admin')
      AND (u.role = 'super_admin' OR u.default_branch_id = drivers.branch_id)
  ));

CREATE POLICY drivers_update_self ON drivers FOR UPDATE
  USING (auth.uid()::text = id);

CREATE POLICY drivers_update_admin ON drivers FOR UPDATE
  USING (auth.uid()::text IN (
    SELECT u.id FROM users u
    WHERE u.role IN ('branch_admin', 'super_admin')
      AND (u.role = 'super_admin' OR u.default_branch_id = drivers.branch_id)
  ));

CREATE POLICY drivers_insert_admin ON drivers FOR INSERT
  WITH CHECK (auth.uid()::text IN (
    SELECT u.id FROM users u
    WHERE u.role IN ('branch_admin', 'super_admin')
  ));
