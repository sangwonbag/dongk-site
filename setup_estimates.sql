-- ==========================================================================
-- 1. 일자별 일련번호 관리를 위한 시퀀스 테이블 (estimate_sequences)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.estimate_sequences (
  seq_date date PRIMARY KEY,
  last_seq integer NOT NULL DEFAULT 0
);

-- ==========================================================================
-- 2. 견적요청 메인 테이블 (estimates)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.estimates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_no text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status text DEFAULT '접수' NOT NULL,
  
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
  has_elevator boolean DEFAULT false,
  parking_available boolean DEFAULT false,
  
  accessory_options text[],
  extra_accessory_text text,
  request_memo text,
  admin_memo text,
  
  subtotal numeric DEFAULT 0 NOT NULL,
  vat numeric DEFAULT 0 NOT NULL,
  discount numeric DEFAULT 0 NOT NULL,
  extra_cost numeric DEFAULT 0 NOT NULL,
  total numeric DEFAULT 0 NOT NULL,
  vat_mode text DEFAULT '별도' NOT NULL
);

-- updated_at 자동 갱신 트리거 설정
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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
EXECUTE FUNCTION public.update_updated_at_column();


-- ==========================================
-- 3. 견적요청 품목 테이블 (estimate_items)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.estimate_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id uuid REFERENCES public.estimates(id) ON DELETE CASCADE NOT NULL,
  sort_order integer,
  category text,
  brand text,
  product_code text,
  product_name text NOT NULL,
  spec text,
  unit text,
  quantity numeric DEFAULT 1 NOT NULL,
  unit_price numeric DEFAULT 0 NOT NULL,
  supply_amount numeric DEFAULT 0 NOT NULL,
  memo text
);


-- ==========================================
-- 4. 견적요청 현장 사진 테이블 (estimate_photos)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.estimate_photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id uuid REFERENCES public.estimates(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  file_name text,
  created_at timestamp with time zone DEFAULT now()
);


-- ==========================================
-- 5. RLS (Row Level Security) 설정 및 보안 정책 (최소 권한 원칙)
-- ==========================================
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_photos ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (안전한 초기화)
DROP POLICY IF EXISTS "Allow public insert for estimates" ON public.estimates;
DROP POLICY IF EXISTS "Allow select for admin only" ON public.estimates;
DROP POLICY IF EXISTS "Allow write for admin only" ON public.estimates;
DROP POLICY IF EXISTS "Allow admin read/write for estimates" ON public.estimates;

DROP POLICY IF EXISTS "Allow public insert for estimate_items" ON public.estimate_items;
DROP POLICY IF EXISTS "Allow select for admin only" ON public.estimate_items;
DROP POLICY IF EXISTS "Allow write for admin only" ON public.estimate_items;
DROP POLICY IF EXISTS "Allow admin read/write for estimate_items" ON public.estimate_items;

-- 5-1. estimates 테이블 보안 정책 (일반 유저/익명 유저는 직접 쓰기/조회 차단, 오직 어드민만 가능)
CREATE POLICY "Allow admin read/write for estimates" ON public.estimates
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- 5-2. estimate_items 테이블 보안 정책
CREATE POLICY "Allow admin read/write for estimate_items" ON public.estimate_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));


-- ==========================================================================
-- 6. [Atomic Transaction RPC] 견적 정보 및 품목 일괄 저장 함수 (보안 검증 강화)
-- ==========================================================================
CREATE OR REPLACE FUNCTION public.create_estimate_with_items(
  p_customer_type text,
  p_customer_name text,
  p_phone text,
  p_email text,
  p_site_address text,
  p_site_detail_address text,
  p_preferred_date date,
  p_consultation_type text,
  p_site_type text,
  p_work_type text,
  p_area_pyeong numeric,
  p_has_elevator boolean,
  p_parking_available boolean,
  p_accessory_options text[],
  p_extra_accessory_text text,
  p_request_memo text,
  p_subtotal numeric,
  p_total numeric,
  p_items jsonb
)
RETURNS public.estimates AS $$
DECLARE
  v_estimate public.estimates;
  v_item jsonb;
  v_estimate_no text;
  month_prefix text;
  next_seq integer;
BEGIN
  -- 1) 입력값 검증 (길이 및 무결성 검사)
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) = 0 THEN
    RAISE EXCEPTION '고객명은 필수 입력 항목입니다.';
  END IF;
  IF length(p_customer_name) > 100 THEN
    RAISE EXCEPTION '고객명은 최대 100자까지 가능합니다.';
  END IF;

  IF p_phone IS NULL OR length(trim(p_phone)) = 0 THEN
    RAISE EXCEPTION '연락처는 필수 입력 항목입니다.';
  END IF;
  IF length(p_phone) > 30 THEN
    RAISE EXCEPTION '연락처는 최대 30자까지 가능합니다.';
  END IF;

  IF p_email IS NOT NULL AND length(p_email) > 100 THEN
    RAISE EXCEPTION '이메일 주소는 최대 100자까지 가능합니다.';
  END IF;

  IF p_site_address IS NULL OR length(trim(p_site_address)) = 0 THEN
    RAISE EXCEPTION '현장 주소는 필수 입력 항목입니다.';
  END IF;
  IF length(p_site_address) > 300 THEN
    RAISE EXCEPTION '현장 주소는 최대 300자까지 가능합니다.';
  END IF;

  IF p_site_detail_address IS NOT NULL AND length(p_site_detail_address) > 300 THEN
    RAISE EXCEPTION '상세 주소는 최대 300자까지 가능합니다.';
  END IF;

  IF p_request_memo IS NOT NULL AND length(p_request_memo) > 2000 THEN
    RAISE EXCEPTION '요청사항은 최대 2000자까지 가능합니다.';
  END IF;

  -- 2) 품목 수량 검증
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION '선택된 자재 품목이 없습니다. 최소 1개 이상의 자재를 선택해주세요.';
  END IF;
  IF jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION '한 번에 최대 50개의 자재만 견적 요청할 수 있습니다.';
  END IF;

  -- 3) 동시성 안전 일련번호 생성 (EST-YYYYMMDD-XXXX 형식)
  month_prefix := 'EST-' || to_char(now(), 'YYYYMMDD') || '-';
  
  -- 일자별 시퀀스를 안전하게 조회 및 1씩 가산 (Advisory Row Lock 효과)
  INSERT INTO public.estimate_sequences (seq_date, last_seq)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (seq_date)
  DO UPDATE SET last_seq = public.estimate_sequences.last_seq + 1
  RETURNING last_seq INTO next_seq;
  
  v_estimate_no := month_prefix || lpad(next_seq::text, 4, '0');

  -- 4) 부모 견적 헤더 테이블 삽입 (상태 및 관리자 값 강제 제어)
  INSERT INTO public.estimates (
    estimate_no,
    customer_type,
    customer_name,
    phone,
    email,
    site_address,
    site_detail_address,
    preferred_date,
    consultation_type,
    site_type,
    work_type,
    area_pyeong,
    has_elevator,
    parking_available,
    accessory_options,
    extra_accessory_text,
    request_memo,
    subtotal,
    total,
    status,
    admin_memo,
    created_at,
    updated_at
  ) VALUES (
    v_estimate_no,
    p_customer_type,
    trim(p_customer_name),
    trim(p_phone),
    trim(p_email),
    trim(p_site_address),
    trim(p_site_detail_address),
    p_preferred_date,
    p_consultation_type,
    p_site_type,
    p_work_type,
    p_area_pyeong,
    p_has_elevator === true,
    p_parking_available === true,
    p_accessory_options,
    trim(p_extra_accessory_text),
    trim(p_request_memo),
    p_subtotal,
    p_total,
    '접수',
    NULL,
    now(),
    now()
  ) RETURNING * INTO v_estimate;

  -- 5) 자재 상세 품목 테이블 순회 삽입 및 값 유효성 체크
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    -- 개별 품목 검증
    IF (v_item->>'quantity')::numeric <= 0 OR (v_item->>'quantity')::numeric > 1000 THEN
      RAISE EXCEPTION '자재 수량은 0보다 크고 1000평 이하여야 합니다. (입력값: %)', v_item->>'quantity';
    END IF;
    IF (v_item->>'unit_price')::numeric < 0 THEN
      RAISE EXCEPTION '자재 단가는 0원 이상이어야 합니다.';
    END IF;

    INSERT INTO public.estimate_items (
      estimate_id,
      sort_order,
      category,
      brand,
      product_code,
      product_name,
      spec,
      quantity,
      unit_price,
      supply_amount
    ) VALUES (
      v_estimate.id,
      (v_item->>'sort_order')::integer,
      v_item->>'category',
      v_item->>'brand',
      v_item->>'product_code',
      v_item->>'product_name',
      v_item->>'spec',
      (v_item->>'quantity')::numeric,
      (v_item->>'unit_price')::numeric,
      (v_item->>'supply_amount')::numeric
    );
  END LOOP;

  RETURN v_estimate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 7. 함수 실행 권한 제어 (익명/로그인 사용자만 허용, PUBLIC 일반 제거)
REVOKE EXECUTE ON FUNCTION public.create_estimate_with_items(
  text, text, text, text, text, text, date, text, text, text, numeric, boolean, boolean, text[], text, text, numeric, numeric, jsonb
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_estimate_with_items(
  text, text, text, text, text, text, date, text, text, text, numeric, boolean, boolean, text[], text, text, numeric, numeric, jsonb
) TO anon, authenticated;
