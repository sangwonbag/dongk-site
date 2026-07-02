-- =========================================================================
-- 시공사례 테이블 (construction_cases) 정렬 순서 및 노출 제어용 컬럼 패치
-- Supabase SQL Editor에서 실행해주시기 바랍니다.
-- =========================================================================

ALTER TABLE public.construction_cases
ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

ALTER TABLE public.construction_cases
ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

ALTER TABLE public.construction_cases
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 인덱스 및 트리거 생성 (기존에 없을 경우)
CREATE INDEX IF NOT EXISTS construction_cases_sort_idx ON public.construction_cases (sort_order asc, created_at desc);

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
