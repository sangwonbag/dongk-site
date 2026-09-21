-- ==========================================================================
-- Dongkyung Flooring (동경바닥재) - Construction Operations & Billing Migration
-- ==========================================================================

-- 1. Add Construction, Shipment, and Billing Adjustment columns to `orders`
ALTER TABLE orders ADD COLUMN IF NOT EXISTS construction_status VARCHAR(50) DEFAULT '일정 미정';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS construction_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS construction_time_slot VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS construction_manager VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS construction_phone VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS construction_memo TEXT;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_status VARCHAR(50) DEFAULT '대기';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_prepared_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_prepared_by VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_checklist JSONB DEFAULT '[]'::jsonb;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS construction_started_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS construction_completed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_confirmed_at TIMESTAMPTZ;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_completion_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_construction_area NUMERIC(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS extra_tasks_desc TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS extra_materials_desc TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS site_notes TEXT;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS approved_amount NUMERIC(12, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS extra_charge_amount NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS extra_charge_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS extra_discount_amount NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS final_billing_amount NUMERIC(12, 2);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_paid_amount NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS outstanding_balance NUMERIC(12, 2) DEFAULT 0;

-- 2. Create `order_payments` table for payment history logs
CREATE TABLE IF NOT EXISTS order_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL DEFAULT '계좌이체',
    paid_at TIMESTAMPTZ DEFAULT now(),
    memo TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for payment lookups by order
CREATE INDEX IF NOT EXISTS idx_order_payments_order_id ON order_payments(order_id);

-- 3. RLS for `order_payments`
ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;

-- Policy: Admin full access
CREATE POLICY "Admins full access on order_payments"
ON order_payments
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);
