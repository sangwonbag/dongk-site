-- ==========================================
-- 1. 견적요청 메인 테이블 (estimates)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.estimates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_no text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status text DEFAULT '접수',
  
  customer_type text,
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  
  site_address text NOT NULL,
  site_detail_address text,
  preferred_date date,
  consultation_type text,
  
  site_type text,
  work_type text,
  area_pyeong numeric,
  has_elevator boolean,
  parking_available boolean,
  
  accessory_options text[],
  extra_accessory_text text,
  request_memo text,
  admin_memo text,
  
  subtotal numeric DEFAULT 0,
  vat numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  extra_cost numeric DEFAULT 0,
  total numeric DEFAULT 0,
  vat_mode text DEFAULT '별도'
);

-- updated_at 자동 갱신 트리거 설정
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_estimates_updated_at ON public.estimates;
CREATE TRIGGER update_estimates_updated_at
BEFORE UPDATE ON public.estimates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- 2. 견적요청 품목 테이블 (estimate_items)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.estimate_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id uuid REFERENCES public.estimates(id) ON DELETE CASCADE,
  sort_order integer,
  category text,
  brand text,
  product_code text,
  product_name text,
  spec text,
  unit text,
  quantity numeric DEFAULT 1,
  unit_price numeric DEFAULT 0,
  supply_amount numeric DEFAULT 0,
  memo text
);


-- ==========================================
-- 3. 견적요청 현장 사진 테이블 (estimate_photos)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.estimate_photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id uuid REFERENCES public.estimates(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text,
  created_at timestamp with time zone DEFAULT now()
);


-- ==========================================
-- 4. estimate_no 자동 생성 트리거 (EST-YYYYMM-0001 형식)
-- ==========================================
-- 매월 시퀀스를 초기화하기 위해 현재 월을 기준으로 Max값을 찾아 +1 하는 방식
CREATE OR REPLACE FUNCTION generate_estimate_no()
RETURNS TRIGGER AS $$
DECLARE
  month_prefix text;
  max_no text;
  next_seq integer;
BEGIN
  -- 'EST-YYYYMM-' 접두사 생성
  month_prefix := 'EST-' || to_char(now(), 'YYYYMM') || '-';
  
  -- 해당 월의 가장 큰 번호 조회
  SELECT max(estimate_no) INTO max_no 
  FROM public.estimates 
  WHERE estimate_no LIKE month_prefix || '%';
  
  IF max_no IS NULL THEN
    next_seq := 1;
  ELSE
    -- 마지막 4자리 숫자 추출 후 +1
    next_seq := cast(substring(max_no from length(max_no) - 3) as integer) + 1;
  END IF;
  
  -- 4자리 패딩하여 할당
  NEW.estimate_no := month_prefix || lpad(next_seq::text, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_estimate_no ON public.estimates;
CREATE TRIGGER set_estimate_no
BEFORE INSERT ON public.estimates
FOR EACH ROW
EXECUTE FUNCTION generate_estimate_no();


-- ==========================================
-- 5. RLS 및 정책 (접근 제어)
-- ==========================================
-- (보안 강화를 위해 필요 시 수정)
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for estimates" ON public.estimates FOR ALL USING (true);
CREATE POLICY "Enable all for estimate_items" ON public.estimate_items FOR ALL USING (true);
CREATE POLICY "Enable all for estimate_photos" ON public.estimate_photos FOR ALL USING (true);
