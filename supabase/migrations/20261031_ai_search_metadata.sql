-- =========================================================================
-- 동경바닥재 AI형 자재 검색 메타데이터 테이블 및 검색 인덱스 마이그레이션
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.product_search_metadata (
    id BIGSERIAL PRIMARY KEY,
    product_id TEXT NOT NULL UNIQUE,
    brand TEXT,
    category TEXT,
    product_name TEXT,
    product_code TEXT,
    series TEXT,
    line TEXT,
    color_family TEXT,
    color_detail TEXT,
    brightness TEXT,
    tone TEXT,
    pattern_type TEXT,
    texture TEXT,
    finish TEXT,
    style_tags TEXT[] DEFAULT '{}',
    space_tags TEXT[] DEFAULT '{}',
    usage_tags TEXT[] DEFAULT '{}',
    search_aliases TEXT[] DEFAULT '{}',
    search_keywords TEXT[] DEFAULT '{}',
    metadata_source TEXT DEFAULT 'rule_engine', -- 'catalog', 'rule_engine', 'admin'
    metadata_confidence NUMERIC(3, 2) DEFAULT 0.90,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 검색 성능 최적화를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_psm_product_code ON public.product_search_metadata (product_code);
CREATE INDEX IF NOT EXISTS idx_psm_color_family ON public.product_search_metadata (color_family);
CREATE INDEX IF NOT EXISTS idx_psm_pattern_type ON public.product_search_metadata (pattern_type);
CREATE INDEX IF NOT EXISTS idx_psm_style_tags ON public.product_search_metadata USING GIN (style_tags);
CREATE INDEX IF NOT EXISTS idx_psm_space_tags ON public.product_search_metadata USING GIN (space_tags);
CREATE INDEX IF NOT EXISTS idx_psm_search_keywords ON public.product_search_metadata USING GIN (search_keywords);

-- RLS 활성화
ALTER TABLE public.product_search_metadata ENABLE ROW LEVEL SECURITY;

-- 익명/인증 사용자 조회 허용
CREATE POLICY "Allow public read on product_search_metadata"
ON public.product_search_metadata
FOR SELECT
TO anon, authenticated
USING (true);

-- 관리자/서비스롤 수정 허용
CREATE POLICY "Allow service_role insert/update on product_search_metadata"
ON public.product_search_metadata
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

