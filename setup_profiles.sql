-- ==========================================
-- 동경바닥재 사용자 프로필용 DB 스키마 셋업 스크립트 (setup_profiles.sql)
-- Supabase SQL Editor에서 실행해주시기 바랍니다.
-- ==========================================

-- [옵션 1] 기존 profiles 테이블 초기화 후 완전 재생성 (기존 데이터가 삭제됩니다)
-- 만약 기존에 Supabase 기본 템플릿 등으로 테이블이 먼저 생성되어 컬럼 누락 에러가 발생한다면
-- 아래 DROP 구문의 주석(--)을 해제하고 스크립트 전체를 실행해 주세요.
DROP TABLE IF EXISTS public.profiles CASCADE;

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
    business_number text, -- 사업자 등록번호
    marketing_agree boolean DEFAULT false, -- 마케팅 동의 여부
    marketing_agreed boolean DEFAULT false,
    terms_agreed_at timestamp with time zone, -- 이용약관 동의 일시
    privacy_agreed_at timestamp with time zone, -- 개인정보 동의 일시
    age_confirmed_at timestamp with time zone, -- 만14세 확인 일시
    memo text, -- 기타 가입 메모
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


-- ==========================================
-- [옵션 2] 기존 데이터를 보존하면서 누락된 컬럼만 패치하는 구문
-- 만약 기존 profiles 데이터를 삭제하고 싶지 않다면, 아래 ALTER TABLE 구문만 블록 지정하여 실행하세요.
-- ==========================================
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type text DEFAULT '일반';
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_detail text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_number text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_agree boolean DEFAULT false;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_agreed boolean DEFAULT false;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_agreed_at timestamp with time zone;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_agreed_at timestamp with time zone;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_confirmed_at timestamp with time zone;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS memo text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
-- ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

