-- ==========================================================================
-- Dongkyung Flooring (동경바닥재) - Operations Automation SQL Migration
-- ==========================================================================

-- 1. Google Calendar, Worker Assignment, and Document Snapshots on `orders`
ALTER TABLE orders ADD COLUMN IF NOT EXISTS google_calendar_event_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS google_calendar_synced_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS google_calendar_status VARCHAR(50) DEFAULT 'none';

ALTER TABLE orders ADD COLUMN IF NOT EXISTS primary_worker_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS primary_worker_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assistant_worker_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assistant_worker_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS construction_team_name VARCHAR(100);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS release_note_snapshot JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completion_cert_snapshot JSONB;

-- 2. Create `construction_workers` table for worker management
CREATE TABLE IF NOT EXISTS construction_workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    team_name VARCHAR(100),
    specialties TEXT[] DEFAULT ARRAY['데코타일', '장판']::text[],
    active BOOLEAN DEFAULT true,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for worker lookups
CREATE INDEX IF NOT EXISTS idx_construction_workers_active ON construction_workers(active);

-- Enable RLS for `construction_workers`
ALTER TABLE construction_workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access on construction_workers"
ON construction_workers
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Initial seed data for construction workers (if table is empty)
INSERT INTO construction_workers (name, phone, team_name, specialties, active)
SELECT '김철수 팀장', '010-1234-5678', 'A팀 (서울/경기)', ARRAY['데코타일', '장판', '마루']::text[], true
WHERE NOT EXISTS (SELECT 1 FROM construction_workers WHERE name = '김철수 팀장');

INSERT INTO construction_workers (name, phone, team_name, specialties, active)
SELECT '박기사 팀장', '010-9876-5432', 'B팀 (경기남부/인천)', ARRAY['장판', '벽지']::text[], true
WHERE NOT EXISTS (SELECT 1 FROM construction_workers WHERE name = '박기사 팀장');

INSERT INTO construction_workers (name, phone, team_name, specialties, active)
SELECT '이반장 기사', '010-5555-7777', 'C팀 (지방/광역)', ARRAY['데코타일', '카페트타일']::text[], true
WHERE NOT EXISTS (SELECT 1 FROM construction_workers WHERE name = '이반장 기사');
