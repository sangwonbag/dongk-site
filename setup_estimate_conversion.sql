-- ==========================================================================
-- Dongkyung Flooring (동경바닥재)
-- Migration SQL for Consultation Inquiry -> Final Quote -> Order Conversion
-- ==========================================================================

-- 1. Add final quote & order conversion fields to public.estimates table
ALTER TABLE public.estimates 
ADD COLUMN IF NOT EXISTS accessory_cost numeric DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS labor_cost numeric DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS demolition_cost numeric DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS transport_cost numeric DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS is_quote_confirmed boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS quote_confirmed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS quote_confirmed_by text,
ADD COLUMN IF NOT EXISTS valid_until date,
ADD COLUMN IF NOT EXISTS admin_quote_memo text,
ADD COLUMN IF NOT EXISTS converted_order_id text,
ADD COLUMN IF NOT EXISTS converted_order_no text,
ADD COLUMN IF NOT EXISTS converted_at timestamp with time zone,

-- New Customer Approval & Quote Versioning Fields
ADD COLUMN IF NOT EXISTS quote_version integer DEFAULT 1 NOT NULL,
ADD COLUMN IF NOT EXISTS customer_approved boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS customer_approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS customer_response text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_amount numeric(12,2),
ADD COLUMN IF NOT EXISTS approved_quote_version integer,
ADD COLUMN IF NOT EXISTS schedule_request_note text,

-- New Construction Scheduling Fields
ADD COLUMN IF NOT EXISTS construction_date date,
ADD COLUMN IF NOT EXISTS construction_time_slot text,
ADD COLUMN IF NOT EXISTS construction_manager text,
ADD COLUMN IF NOT EXISTS construction_phone text,
ADD COLUMN IF NOT EXISTS construction_memo text;

-- 2. Add converted_from_estimate_id column to public.orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS converted_from_estimate_id text,
ADD COLUMN IF NOT EXISTS converted_from_estimate_no text;

-- 3. Create index for fast inquiry-order lookup
CREATE INDEX IF NOT EXISTS idx_estimates_converted_order_id ON public.estimates(converted_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_converted_estimate_id ON public.orders(converted_from_estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimates_customer_response ON public.estimates(customer_response);

-- Migration comments
COMMENT ON COLUMN public.estimates.is_quote_confirmed IS '관리자에 의한 최종 견적 확정 여부';
COMMENT ON COLUMN public.estimates.quote_version IS '견적 서면 버저닝 (관리자 수정 시 자동 증가)';
COMMENT ON COLUMN public.estimates.customer_response IS '고객 견적 응답 상태 (pending: 응답대기, approved: 진행요청, on_hold: 보류)';
COMMENT ON COLUMN public.estimates.converted_order_id IS '상담에서 전환 생성된 실제 주문 UUID';
COMMENT ON COLUMN public.orders.converted_from_estimate_id IS '주문이 생성된 원본 시공 상담 UUID';

