-- =========================================================================
-- 동경바닥재 관리자 기능 고도화용 SQL 셋업 스크립트 (supabase/admin_features.sql)
-- Supabase SQL Editor에서 실행해주시기 바랍니다.
-- =========================================================================

-- 1. 방문 로그 테이블 (visitor_logs) 생성
CREATE TABLE IF NOT EXISTS public.visitor_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    page_path text NOT NULL,
    referrer text,
    user_agent text,
    is_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT visitor_logs_pkey PRIMARY KEY (id)
);

-- 2. 시공사례 테이블 (construction_cases) 필드 보강
-- (이미 테이블이 존재하므로 ALTER TABLE ... ADD COLUMN IF NOT EXISTS 형식 사용)
CREATE TABLE IF NOT EXISTS public.construction_cases (
    id serial PRIMARY KEY,
    title text NOT NULL,
    slug text,
    location text,
    material_summary text,
    product_id integer,
    main_image_url text,
    description text,
    constructed_at date,
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 다중 이미지 업로드 및 정렬/카테고리 저장을 위한 컬럼 추가
ALTER TABLE public.construction_cases ADD COLUMN IF NOT EXISTS image_urls text[];
ALTER TABLE public.construction_cases ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.construction_cases ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- 3. 자재 테이블 (products) 필드 보강
-- 기존 products 테이블에 매입가, 매출가, 정렬순서 컬럼 추가
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS retail_price numeric DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- 4. 성능 최적화를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS visitor_logs_session_created_idx ON public.visitor_logs (session_id, created_at);
CREATE INDEX IF NOT EXISTS visitor_logs_created_at_idx ON public.visitor_logs (created_at desc);
CREATE INDEX IF NOT EXISTS construction_cases_sort_idx ON public.construction_cases (sort_order asc, created_at desc);
CREATE INDEX IF NOT EXISTS products_sort_idx ON public.products (sort_order asc, name asc);

-- 5. updated_at 자동 갱신 트리거 생성
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_construction_cases_updated_at
    BEFORE UPDATE ON public.construction_cases
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. RLS (Row Level Security) 설정
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 6-1. visitor_logs RLS 정책
-- 누구나 방문 로그를 적재할 수 있도록 INSERT 허용
CREATE POLICY "Allow public insert for visitor_logs" ON public.visitor_logs
    FOR INSERT WITH CHECK (true);

-- 관리자가 프론트엔드에서 통계를 불러올 수 있도록 SELECT 허용
-- (동경바닥재는 로컬스토리지 기반 커스텀 세션 관리 및 anon key 통신을 이용하므로 USING true로 허용)
CREATE POLICY "Allow public select for visitor_logs" ON public.visitor_logs
    FOR SELECT USING (true);

-- 6-2. construction_cases RLS 정책
-- 일반 사용자 노출을 위한 SELECT 허용
CREATE POLICY "Allow public select for construction_cases" ON public.construction_cases
    FOR SELECT USING (true);

-- 관리자 화면에서의 CRUD를 위해 INSERT, UPDATE, DELETE 허용
CREATE POLICY "Allow public insert for construction_cases" ON public.construction_cases
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update for construction_cases" ON public.construction_cases
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete for construction_cases" ON public.construction_cases
    FOR DELETE USING (true);

-- 6-3. products RLS 정책
-- 일반 사용자 조회를 위한 SELECT 허용
CREATE POLICY "Allow public select for products" ON public.products
    FOR SELECT USING (true);

-- 관리자 화면에서의 CRUD를 위해 INSERT, UPDATE, DELETE 허용
CREATE POLICY "Allow public insert for products" ON public.products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update for products" ON public.products
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete for products" ON public.products
    FOR DELETE USING (true);

-- =========================================================================
-- Storage Bucket 생성 및 정책 설정 가이드
-- =========================================================================
-- 1) Supabase Dashboard > Storage 메뉴 진입
-- 2) 다음 두 버킷이 없으면 생성 (Public 설정 활성화)
--    - 버킷 1: materials
--    - 버킷 2: construction-cases
-- 3) 각 버킷의 Policy(정책) 설정:
--    - SELECT: 누구나 조회 가능 (public)
--    - INSERT, UPDATE, DELETE: 누구나(anon) 수행 가능하도록 설정 
--      (프론트엔드 anon key 직접 업로드를 위해 권한 개방)
-- =========================================================================
