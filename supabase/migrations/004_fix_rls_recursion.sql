-- ============================================================================
-- Hen N Slice — 004: Fix RLS infinite recursion on users table
--
-- Policies using auth.uid()::text IN (SELECT id FROM users WHERE role IN (...))
-- cause infinite recursion because checking the policy requires querying
-- users, which re-triggers the same policy.
--
-- Fix: SECURITY DEFINER functions bypass RLS entirely, so the subquery
-- inside the function does not re-trigger row-level security.
-- ============================================================================

-- 1. Helper functions
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin(check_role text[])
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role = ANY(check_role)
  );
$$;

CREATE OR REPLACE FUNCTION is_admin_for_branch(branch_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()::text
      AND role = ANY(ARRAY['branch_admin', 'super_admin'])
      AND (role = 'super_admin' OR default_branch_id = branch_id)
  );
$$;

-- 2. Drop policies that use the recursive subquery pattern
-- ============================================================================

-- branches
DROP POLICY IF EXISTS branches_insert_admin ON branches;
DROP POLICY IF EXISTS branches_update_admin ON branches;
DROP POLICY IF EXISTS branches_delete_admin ON branches;

-- users
DROP POLICY IF EXISTS users_select_admin     ON users;

-- delivery_zones
DROP POLICY IF EXISTS dz_insert_admin        ON delivery_zones;
DROP POLICY IF EXISTS dz_update_admin        ON delivery_zones;
DROP POLICY IF EXISTS dz_delete_admin        ON delivery_zones;

-- categories
DROP POLICY IF EXISTS categories_insert_admin ON categories;
DROP POLICY IF EXISTS categories_update_admin ON categories;
DROP POLICY IF EXISTS categories_delete_admin ON categories;

-- menu_items
DROP POLICY IF EXISTS menu_insert_admin      ON menu_items;
DROP POLICY IF EXISTS menu_update_admin      ON menu_items;
DROP POLICY IF EXISTS menu_delete_admin      ON menu_items;

-- deals
DROP POLICY IF EXISTS deals_insert_admin     ON deals;
DROP POLICY IF EXISTS deals_update_admin     ON deals;
DROP POLICY IF EXISTS deals_delete_admin     ON deals;

-- orders
DROP POLICY IF EXISTS orders_select_admin    ON orders;
DROP POLICY IF EXISTS orders_update_admin    ON orders;
DROP POLICY IF EXISTS orders_delete_admin    ON orders;

-- drivers
DROP POLICY IF EXISTS drivers_select_admin   ON drivers;
DROP POLICY IF EXISTS drivers_update_admin   ON drivers;
DROP POLICY IF EXISTS drivers_insert_admin   ON drivers;

-- 3. Recreate policies using the SECURITY DEFINER helper
-- ============================================================================

-- branches
CREATE POLICY branches_insert_admin ON branches FOR INSERT
  WITH CHECK (is_admin(ARRAY['branch_admin', 'super_admin']));

CREATE POLICY branches_update_admin ON branches FOR UPDATE
  USING (is_admin(ARRAY['branch_admin', 'super_admin']));

CREATE POLICY branches_delete_admin ON branches FOR DELETE
  USING (is_admin(ARRAY['super_admin']));

-- users
CREATE POLICY users_select_admin ON users FOR SELECT
  USING (is_admin(ARRAY['branch_admin', 'super_admin']));

-- delivery_zones
CREATE POLICY dz_insert_admin ON delivery_zones FOR INSERT
  WITH CHECK (is_admin(ARRAY['branch_admin', 'super_admin']));

CREATE POLICY dz_update_admin ON delivery_zones FOR UPDATE
  USING (is_admin(ARRAY['branch_admin', 'super_admin']));

CREATE POLICY dz_delete_admin ON delivery_zones FOR DELETE
  USING (is_admin(ARRAY['super_admin']));

-- categories
CREATE POLICY categories_insert_admin ON categories FOR INSERT
  WITH CHECK (is_admin(ARRAY['branch_admin', 'super_admin']));

CREATE POLICY categories_update_admin ON categories FOR UPDATE
  USING (is_admin(ARRAY['branch_admin', 'super_admin']));

CREATE POLICY categories_delete_admin ON categories FOR DELETE
  USING (is_admin(ARRAY['super_admin']));

-- menu_items
CREATE POLICY menu_insert_admin ON menu_items FOR INSERT
  WITH CHECK (is_admin(ARRAY['branch_admin', 'super_admin']));

CREATE POLICY menu_update_admin ON menu_items FOR UPDATE
  USING (is_admin(ARRAY['branch_admin', 'super_admin']));

CREATE POLICY menu_delete_admin ON menu_items FOR DELETE
  USING (is_admin(ARRAY['super_admin']));

-- deals
CREATE POLICY deals_insert_admin ON deals FOR INSERT
  WITH CHECK (is_admin(ARRAY['branch_admin', 'super_admin']));

CREATE POLICY deals_update_admin ON deals FOR UPDATE
  USING (is_admin(ARRAY['branch_admin', 'super_admin']));

CREATE POLICY deals_delete_admin ON deals FOR DELETE
  USING (is_admin(ARRAY['super_admin']));

-- orders
CREATE POLICY orders_select_admin ON orders FOR SELECT
  USING (is_admin(ARRAY['branch_admin', 'super_admin']));

CREATE POLICY orders_update_admin ON orders FOR UPDATE
  USING (is_admin(ARRAY['branch_admin', 'super_admin']));

CREATE POLICY orders_delete_admin ON orders FOR DELETE
  USING (is_admin(ARRAY['super_admin']));

-- drivers
CREATE POLICY drivers_select_admin ON drivers FOR SELECT
  USING (is_admin_for_branch(drivers.branch_id));

CREATE POLICY drivers_update_admin ON drivers FOR UPDATE
  USING (is_admin_for_branch(drivers.branch_id));

CREATE POLICY drivers_insert_admin ON drivers FOR INSERT
  WITH CHECK (is_admin(ARRAY['branch_admin', 'super_admin']));
