-- Supabase SQL Editor에서 실행하세요.

-- AI 상담 기록을 저장할 테이블 생성
CREATE TABLE public.ai_consultations (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    category TEXT,
    space_type TEXT,
    area TEXT,
    style TEXT,
    budget TEXT,
    full_transcript JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 누구나 데이터를 삽입할 수 있도록 RLS 정책 설정 (프론트엔드에서 직접 접근 시 필요)
ALTER TABLE public.ai_consultations ENABLE ROW LEVEL SECURITY;

-- 익명 사용자(anon) 및 인증 사용자(authenticated) 삽입/업데이트 허용
CREATE POLICY "Allow anonymous inserts to ai_consultations"
ON public.ai_consultations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow anonymous updates to ai_consultations based on session_id"
ON public.ai_consultations
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
