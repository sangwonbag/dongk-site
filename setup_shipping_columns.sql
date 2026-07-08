-- setup_shipping_columns.sql
-- orders 테이블에 배송 방식 및 부자재 추천 관련 정보 컬럼 추가

ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(50) DEFAULT 'cargo';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method_label VARCHAR(100) DEFAULT '대신화물 지점 배송';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee VARCHAR(50) DEFAULT '별도 안내';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee_status VARCHAR(50) DEFAULT 'unconfirmed';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS freight_branch_name VARCHAR(200);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS freight_branch_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS freight_branch_phone VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS free_shipping_eligible BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS free_shipping_brand VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS free_shipping_area NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quick_delivery_requested BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS office_pickup_requested BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS accessory_recommendation_shown BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS accessory_recommendation_skipped BOOLEAN DEFAULT false;

-- RLS 정책 확인 (orders 테이블의 select, insert 권한을 가진 정책이 기존과 같이 모든 컬럼을 취급함)
