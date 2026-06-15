-- ==========================================
-- 동경바닥재 주문 접수 기능용 DB 스키마 셋업 스크립트
-- Supabase SQL Editor에서 실행해주시기 바랍니다.
-- ==========================================

-- 1. orders (주문 헤더) 테이블 생성
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    -- 주문번호: ORD-YYYYMMDD-XXXXX 형식으로 자동 생성 (5자리 난수)
    order_no text NOT NULL DEFAULT ('ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 100000)::text, 5, '0')),
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name text NOT NULL,
    company_name text,
    phone text NOT NULL,
    address text NOT NULL,
    address_detail text,
    delivery_request_date date,
    memo text,
    payment_method text NOT NULL, -- '무통장입금', '전화확인'
    payment_status text NOT NULL DEFAULT '미입금', -- '미입금', '입금완료', '부분입금', '환불'
    status text NOT NULL DEFAULT '접수', -- '접수', '확인', '준비중', '배송중', '시공중/시공완료', '완료', '취소'
    total_amount numeric NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT orders_order_no_key UNIQUE (order_no)
);

-- 2. order_items (주문 상품 상세) 테이블 생성
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    category text,
    brand text,
    product_name text NOT NULL,
    product_code text,
    spec text,
    unit text NOT NULL DEFAULT '평',
    quantity integer NOT NULL DEFAULT 1,
    unit_price numeric NOT NULL DEFAULT 0,
    image_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT order_items_pkey PRIMARY KEY (id)
);

-- 3. RLS(Row Level Security) 설정 및 정책 정의
-- 프론트엔드 anon key 연동을 고려하여 모든 작업에 대한 조회를 개방하거나 보안 정책을 구성합니다.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 3-1. orders 정책
CREATE POLICY "Allow public insert for orders" ON public.orders 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select for orders" ON public.orders 
    FOR SELECT USING (true);

CREATE POLICY "Allow public update for orders" ON public.orders 
    FOR UPDATE USING (true);

-- 3-2. order_items 정책
CREATE POLICY "Allow public insert for order_items" ON public.order_items 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select for order_items" ON public.order_items 
    FOR SELECT USING (true);

CREATE POLICY "Allow public update for order_items" ON public.order_items 
    FOR UPDATE USING (true);

-- (참고) RLS 보안을 좀 더 엄격하게 하려면
-- SELECT 및 UPDATE 시 auth.uid() = user_id 등 사용자 기반 매핑을 구성할 수 있으나
-- 현재 프로젝트의 커스텀 인증 방식(users 테이블에 수동 해시 비밀번호 대조하여 로그인 처리 및 localStorage 보존)에 따라 
-- 클라이언트 anon key CRUD를 허용하기 위해 public 오픈 정책으로 설정합니다.
