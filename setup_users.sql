-- 1. users 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    username text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    company_name text,
    user_type text NOT NULL,
    address text,
    memo text,
    role text NOT NULL DEFAULT 'user'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_username_key UNIQUE (username)
);

-- 2. 테이블에 대한 RLS(Row Level Security) 설정 (원하는 경우)
-- 기본적으로 비활성화되어 있으나 권장사항입니다. 
-- 당장 자체 로그인 방식으로 프론트에서 anon key로만 제어한다면 
-- RLS를 비활성화하거나 아래처럼 모든 접속을 허용하는 정책을 추가해야 합니다.
-- 여기서는 편의를 위해 RLS를 활성화하되, 삽입과 조회를 모두 허용합니다.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 누구나 계정을 생성할 수 있도록 허용 (회원가입)
CREATE POLICY "Allow public insert" ON public.users FOR INSERT WITH CHECK (true);

-- 본인의 정보 또는 관리자 정보 조회, 혹은 단순 로그인 대조를 위해 읽기 허용 
-- (보안 상 로그인 시 password 일치 여부 확인을 위해 select 권한이 필요합니다)
CREATE POLICY "Allow public select" ON public.users FOR SELECT USING (true);

-- (선택) 업데이트는 본인만 가능하게 하거나 임시로 모두 허용
CREATE POLICY "Allow public update" ON public.users FOR UPDATE USING (true);


-- 3. 초기 관리자 계정 생성 (dongk3089)
-- 주의: 아래 password 값은 프론트엔드에서 사용하는 해시 방식(SHA-256)에 맞춰서 해시화된 값을 넣는 것을 권장합니다.
-- 아래는 단순 예시(1234 의 SHA-256 해시값: 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4)입니다.
-- 실제 비밀번호가 다르면 프론트에서 가입된 관리자의 비밀번호 해시값을 복사하여 넣어주세요.
INSERT INTO public.users (username, password, name, phone, company_name, user_type, role)
VALUES (
    'dongk3089',
    '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', -- '1234'의 SHA256 예시
    '관리자',
    '02-487-9775',
    '동경바닥재',
    '관리자',
    'admin'
)
ON CONFLICT (username) DO NOTHING;
