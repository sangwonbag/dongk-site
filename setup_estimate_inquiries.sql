-- Supabase SQL Editor에서 실행하세요.

CREATE TABLE IF NOT EXISTS public.estimate_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT,
    phone TEXT NOT NULL,
    address TEXT,
    space_type TEXT,
    area_pyeong NUMERIC,
    elevator TEXT,
    luggage TEXT,
    parking TEXT,
    selected_items JSONB,
    extra_options JSONB,
    demolition TEXT,
    desired_date DATE,
    memo TEXT,
    estimated_total NUMERIC,
    status TEXT DEFAULT '접수대기',
    admin_memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.estimate_inquiries ENABLE ROW LEVEL SECURITY;

-- 익명/인증 사용자 모든 권한 허용 (기존 estimates 테이블 정책 스타일 준수)
CREATE POLICY "Enable all for estimate_inquiries"
ON public.estimate_inquiries
FOR ALL
USING (true)
WITH CHECK (true);
