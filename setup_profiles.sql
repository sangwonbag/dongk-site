-- ==========================================
-- 동경바닥재 사용자 프로필용 DB 스키마 셋업 스크립트 (setup_profiles.sql)
-- Supabase SQL Editor에서 실행해주시기 바랍니다.
-- ==========================================

-- 기존 users 테이블이 있다면 삭제하고 실행하거나, 아래 쿼리를 순서대로 진행해 주세요.
-- DROP TABLE IF EXISTS public.users CASCADE;

-- 1. profiles (회원 프로필) 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    username text NOT NULL,
    password text NOT NULL, -- 해시화된 비밀번호 보관
    name text NOT NULL,
    phone text NOT NULL,
    company_name text,
    user_type text NOT NULL DEFAULT '일반', -- '일반', '사업자'
    address text,
    address_detail text,
    role text NOT NULL DEFAULT 'user'::text, -- 'user', 'admin', 'staff'
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_username_key UNIQUE (username)
);

-- 2. 테이블에 대한 RLS(Row Level Security) 설정
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2-1. 누구나 계정을 생성할 수 있도록 허용 (회원가입)
CREATE POLICY "Allow public insert" ON public.profiles FOR INSERT WITH CHECK (true);

-- 2-2. 본인의 정보 확인 및 대조를 위해 읽기 허용
CREATE POLICY "Allow public select" ON public.profiles FOR SELECT USING (true);

-- 2-3. 정보 업데이트 허용
CREATE POLICY "Allow public update" ON public.profiles FOR UPDATE USING (true);

-- 3. 초기 관리자 계정 생성 (아이디: dongk3089 / 비밀번호: 1234)
-- 아래 패스워드는 '1234'의 SHA-256 해시값입니다.
INSERT INTO public.profiles (username, password, name, phone, company_name, user_type, role)
VALUES (
    'dongk3089',
    '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', -- '1234'의 SHA256 해시
    '관리자',
    '02-487-9775',
    '동경바닥재',
    '관리자',
    'admin'
)
ON CONFLICT (username) DO NOTHING;
