-- ============================================================================
-- Hen N Slice — Storage Buckets Setup
-- Run after 001_initial_schema.sql in Supabase SQL Editor.
-- Creates buckets for menu, branch, and deal images with public-read /
-- authenticated-write policies.
-- Folder convention: {bucket}/{branch_id}/{uuid}-{filename}
-- ============================================================================

-- 1. Create buckets
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES
  ('menu-images', 'menu-images', true, false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('branch-images', 'branch-images', true, false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('deal-images', 'deal-images', true, false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. Public read policies (anyone can view)
-- ============================================================================
CREATE POLICY "public_read_menu_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-images');

CREATE POLICY "public_read_branch_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'branch-images');

CREATE POLICY "public_read_deal_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'deal-images');

-- 3. Authenticated-write policies (logged-in users can upload)
-- ============================================================================
CREATE POLICY "authenticated_write_menu_images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'menu-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "authenticated_write_branch_images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'branch-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "authenticated_write_deal_images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'deal-images'
    AND auth.role() = 'authenticated'
  );

-- 4. Authenticated update/delete (owner or admin)
-- ============================================================================
CREATE POLICY "authenticated_update_menu_images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "authenticated_update_branch_images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'branch-images' AND auth.role() = 'authenticated');

CREATE POLICY "authenticated_update_deal_images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'deal-images' AND auth.role() = 'authenticated');

CREATE POLICY "authenticated_delete_menu_images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "authenticated_delete_branch_images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'branch-images' AND auth.role() = 'authenticated');

CREATE POLICY "authenticated_delete_deal_images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'deal-images' AND auth.role() = 'authenticated');
