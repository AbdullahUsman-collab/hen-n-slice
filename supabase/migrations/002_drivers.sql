-- ============================================================================
-- Hen N Slice — 002: Drivers & Assignment
-- Adds driver management and order assignment to delivery workflow.
-- ============================================================================

-- 1. Drivers table
-- ============================================================================
CREATE TABLE drivers (
  id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id         uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  full_name         text NOT NULL,
  phone             text,
  vehicle_info      text,
  is_available      boolean NOT NULL DEFAULT true,
  current_location  geography(Point, 4326),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_drivers_branch ON drivers (branch_id);
CREATE INDEX idx_drivers_available ON drivers (is_available, branch_id)
  WHERE is_available = true;
CREATE INDEX idx_drivers_location ON drivers USING GIST (current_location);

-- 2. Add driver assignment columns to orders
-- ============================================================================
ALTER TABLE orders
  ADD COLUMN driver_id          uuid REFERENCES drivers(id) ON DELETE SET NULL,
  ADD COLUMN driver_assigned_at timestamptz;

CREATE INDEX idx_orders_driver ON orders (driver_id)
  WHERE driver_id IS NOT NULL;

-- ============================================================================
-- Row-Level Security (RLS)
-- ============================================================================

-- Drivers: read/update own row, branch_admin/super_admin manage all
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY drivers_select_self ON drivers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY drivers_select_admin ON drivers FOR SELECT
  USING (auth.uid() IN (
    SELECT u.id FROM users u
    WHERE u.role IN ('branch_admin', 'super_admin')
      AND (u.role = 'super_admin' OR u.default_branch_id = drivers.branch_id)
  ));

CREATE POLICY drivers_update_self ON drivers FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY drivers_update_admin ON drivers FOR UPDATE
  USING (auth.uid() IN (
    SELECT u.id FROM users u
    WHERE u.role IN ('branch_admin', 'super_admin')
      AND (u.role = 'super_admin' OR u.default_branch_id = drivers.branch_id)
  ));

CREATE POLICY drivers_insert_admin ON drivers FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT u.id FROM users u
    WHERE u.role IN ('branch_admin', 'super_admin')
  ));

-- Orders: extend existing RLS to let drivers see/update their assigned orders
CREATE POLICY orders_select_driver ON orders FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY orders_update_driver ON orders FOR UPDATE
  USING (
    auth.uid() = driver_id
    AND status IN ('confirmed', 'preparing', 'ready')
  );
