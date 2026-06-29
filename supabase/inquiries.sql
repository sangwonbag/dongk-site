-- =========================================================================
-- 동경바닥재 견적문의 기능용 DB 스키마 셋업 스크립트 (supabase/inquiries.sql)
-- Supabase SQL Editor에서 실행해주시기 바랍니다.
-- =========================================================================

-- 1. inquiries (견적문의) 테이블 생성
CREATE TABLE IF NOT EXISTS public.inquiries (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    customer_name text NOT NULL,
    phone text NOT NULL,
    email text,
    address text,
    space_size text,
    category text,
    brand text,
    product_name text,
    product_code text,
    request_type text DEFAULT 'estimate',
    message text,
    source_page text,
    status text DEFAULT 'new', -- new, checking, quoted, done, cancelled
    admin_memo text,
    is_read boolean DEFAULT false,
    session_id text, -- 하위 호환 및 AI 상담 세션 연동용
    CONSTRAINT inquiries_pkey PRIMARY KEY (id)
);

-- 2. 안전한 컬럼 보강 (기존 테이블 존재 시 대비)
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS space_size text;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS product_name text;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS product_code text;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS request_type text DEFAULT 'estimate';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS source_page text;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS session_id text;

-- 3. 성능 최적화를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON public.inquiries (created_at desc);
CREATE INDEX IF NOT EXISTS inquiries_is_read_idx ON public.inquiries (is_read);

-- 4. updated_at 자동 갱신 트리거 설정
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER update_inquiries_updated_at
BEFORE UPDATE ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS (Row Level Security) 설정 및 정책
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 5-1. 익명(anon) 및 인증(authenticated) 사용자 문의 접수(INSERT) 허용
DROP POLICY IF EXISTS "Allow anonymous and authenticated inserts to inquiries" ON public.inquiries;
CREATE POLICY "Allow anonymous and authenticated inserts to inquiries" 
ON public.inquiries 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 5-2. 조회(SELECT) 및 갱신(UPDATE) 정책 (기본은 authenticated 허용)
-- (주의: 운영 전 관리자 role 기반 정책으로 강화 필요)
DROP POLICY IF EXISTS "Allow select to inquiries for authenticated users" ON public.inquiries;
CREATE POLICY "Allow select to inquiries for authenticated users" 
ON public.inquiries 
FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Allow update to inquiries for authenticated users" ON public.inquiries;
CREATE POLICY "Allow update to inquiries for authenticated users" 
ON public.inquiries 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete to inquiries for authenticated users" ON public.inquiries;
CREATE POLICY "Allow delete to inquiries for authenticated users" 
ON public.inquiries 
FOR DELETE 
TO authenticated 
USING (true);
