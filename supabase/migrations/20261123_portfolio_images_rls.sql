-- =========================================================================
-- Supabase Storage RLS Policy: portfolio-images (시공사례 이미지)
-- - 기존 버킷(portfolio-images) 유지 (버킷 삭제/재생성을 하지 않음)
-- - 공개 읽기(SELECT)만 허용
-- - 업로드(INSERT), 수정(UPDATE), 삭제(DELETE)는 관리자(profiles.role = 'admin')
--   또는 서버 검증(service_role signed upload)만 허용 (공개 업로드 금지)
-- =========================================================================

-- 1. 기존에 공개 업로드(anon/public INSERT/UPDATE/DELETE) 정책이 있다면 제거
DROP POLICY IF EXISTS "Allow public upload to portfolio-images" ON storage.objects;
DROP POLICY IF EXISTS "Public upload portfolio-images" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_images_public_select" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_images_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_images_admin_delete" ON storage.objects;

-- 2. 누구나 시공사례 이미지 조회(SELECT) 가능
CREATE POLICY "portfolio_images_public_select"
ON storage.objects
FOR SELECT
USING (bucket_id = 'portfolio-images');

-- 3. 인증된 관리자(profiles.role = 'admin')만 업로드(INSERT) 가능
CREATE POLICY "portfolio_images_admin_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images'
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);

-- 4. 인증된 관리자만 수정(UPDATE) 가능
CREATE POLICY "portfolio_images_admin_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-images'
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'portfolio-images'
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);

-- 5. 인증된 관리자만 삭제(DELETE) 가능
CREATE POLICY "portfolio_images_admin_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images'
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);

-- 6. construction_cases serial 시퀀스 동기화 (수동 ID 삽입 이후 PK 충돌 방지)
SELECT setval(
  pg_get_serial_sequence('public.construction_cases', 'id'),
  COALESCE((SELECT MAX(id) FROM public.construction_cases), 1),
  true
);
