-- Supabase SQL Editor에서 실행하세요.

-- AI 상담 및 접수 기록을 저장할 테이블 생성
CREATE TABLE public.inquiries (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    session_id TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    address TEXT,
    area TEXT,
    material_of_interest TEXT,
    inquiry_details TEXT,
    full_transcript JSONB,
    status TEXT DEFAULT '신규', -- 신규, 상담중, 견적완료, 시공완료, 보류
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 누구나 데이터를 삽입할 수 있도록 RLS 정책 설정 (프론트엔드에서 직접 접근 시 필요)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 익명 사용자(anon) 및 인증 사용자(authenticated) 삽입 허용
CREATE POLICY "Allow anonymous inserts to inquiries"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 익명/인증 사용자 조회 및 업데이트 허용 (어드민 페이지 및 상태 업데이트용)
CREATE POLICY "Allow select to inquiries"
ON public.inquiries
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow updates to inquiries"
ON public.inquiries
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
