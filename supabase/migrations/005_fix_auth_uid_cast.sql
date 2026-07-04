-- ============================================================================
-- Hen N Slice — 005: Replace auth.uid() with auth.jwt()->>'sub'
--
-- auth.uid() internally casts the JWT "sub" claim to uuid, which crashes
-- when Clerk user IDs (e.g. "user_2tXYZ...") are not valid UUIDs.
--
-- Fix: use auth.jwt()->>'sub' which reads the raw JWT sub claim as text,
-- bypassing the uuid cast entirely.  Since it already returns text, all
-- now-redundant ::text casts are removed.
--
-- Affected:
--   10 RLS policies from 003 that still use auth.uid()::text directly
--     → dropped and recreated
--   2 SECURITY DEFINER functions from 004 (is_admin, is_admin_for_branch)
--     → recreated with auth.jwt()->>'sub'
--   22 admin policies from 004 that call these functions
--     → automatically fixed by the function changes (no drop needed)
-- ============================================================================

-- 1. Drop the 10 policies from 003 that still directly use auth.uid()::text
-- ============================================================================

-- users
DROP POLICY IF EXISTS users_select_self      ON users;
DROP POLICY IF EXISTS users_update_self      ON users;
DROP POLICY IF EXISTS users_insert_trigger   ON users;

-- orders
DROP POLICY IF EXISTS orders_select_self     ON orders;
DROP POLICY IF EXISTS orders_insert_self     ON orders;
DROP POLICY IF EXISTS orders_update_self     ON orders;
DROP POLICY IF EXISTS orders_select_driver   ON orders;
DROP POLICY IF EXISTS orders_update_driver   ON orders;

-- drivers
DROP POLICY IF EXISTS drivers_select_self    ON drivers;
DROP POLICY IF EXISTS drivers_update_self    ON drivers;

-- 2. Recreate the SECURITY DEFINER helper functions
--    (CREATE OR REPLACE updates the body without breaking dependent policies)
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin(check_role text[])
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.jwt()->>'sub' AND role = ANY(check_role)
  );
$$;

CREATE OR REPLACE FUNCTION is_admin_for_branch(branch_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.jwt()->>'sub'
      AND role = ANY(ARRAY['branch_admin', 'super_admin'])
      AND (role = 'super_admin' OR default_branch_id = branch_id)
  );
$$;

-- 3. Recreate the 10 policies using auth.jwt()->>'sub' (no ::text needed)
-- ============================================================================

-- users
CREATE POLICY users_select_self ON users FOR SELECT
  USING (auth.jwt()->>'sub' = id);

CREATE POLICY users_update_self ON users FOR UPDATE
  USING (auth.jwt()->>'sub' = id);

CREATE POLICY users_insert_trigger ON users FOR INSERT
  WITH CHECK (auth.jwt()->>'sub' = id);

-- orders
CREATE POLICY orders_select_self ON orders FOR SELECT
  USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY orders_insert_self ON orders FOR INSERT
  WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY orders_update_self ON orders FOR UPDATE
  USING (auth.jwt()->>'sub' = user_id AND status IN ('pending', 'confirmed'));

CREATE POLICY orders_select_driver ON orders FOR SELECT
  USING (auth.jwt()->>'sub' = driver_id);

CREATE POLICY orders_update_driver ON orders FOR UPDATE
  USING (
    auth.jwt()->>'sub' = driver_id
    AND status IN ('confirmed', 'preparing', 'ready')
  );

-- drivers
CREATE POLICY drivers_select_self ON drivers FOR SELECT
  USING (auth.jwt()->>'sub' = id);

CREATE POLICY drivers_update_self ON drivers FOR UPDATE
  USING (auth.jwt()->>'sub' = id);
