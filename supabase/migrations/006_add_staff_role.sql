-- ============================================================================
-- Hen N Slice — 006: Add 'staff' role to users table
--
-- Adds a 'staff' role to the users.role CHECK constraint so admins
-- can assign in-store staff (not drivers, who live in the drivers table).
-- ============================================================================

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check,
  ADD CONSTRAINT users_role_check
    CHECK (role IN ('customer', 'staff', 'branch_admin', 'super_admin'));
