-- =========================================================================
-- 동경바닥재 자재찾기 통합 검색 고도화 및 메타데이터 인덱스 패치
-- =========================================================================

-- 1. 제품 검색 성능 극대화를 위한 복합 텍스트 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_products_search_composite 
ON public.products (product_code, name, is_active, brand_id, category_id);

-- 2. 부분 일치 검색 및 정렬 가속 인덱스
CREATE INDEX IF NOT EXISTS idx_products_code_name_desc 
ON public.products (product_code, name, description);

-- 3. LX 벽지 라인업 (베스띠, 테라피, 디아망) 메타데이터 보완
UPDATE public.products
SET 
  description = '실크_LX_베스띠 (베스트)',
  brand = 'LX',
  category = '벽지'
WHERE description = '실크_LX_베스트';

UPDATE public.products
SET 
  brand = 'LX',
  category = '벽지'
WHERE (description ILIKE '%디아망%' OR slug ILIKE '%디아망%') AND brand IS NULL;

UPDATE public.products
SET 
  brand = 'LX',
  category = '벽지'
WHERE (description ILIKE '%테라피%' OR slug ILIKE '%테라피%') AND brand IS NULL;

-- 4. KCC 센스타일 데코타일 라인업 메타데이터 보완
UPDATE public.products
SET 
  description = 'KCC 센스타일 트랜디',
  brand = 'KCC',
  category = '데코타일'
WHERE brand_id = 1 AND category_id = 1 
  AND (product_code ILIKE 'TS%' OR product_code ILIKE 'TW%')
  AND (description IS NULL OR description NOT ILIKE '%센스타일%');

UPDATE public.products
SET 
  description = 'KCC 센스타일 프로',
  brand = 'KCC',
  category = '데코타일'
WHERE brand_id = 1 AND category_id = 1 
  AND (product_code ILIKE 'GW%' OR product_code ILIKE 'GS%' OR product_code ~ '^[0-9]{5}')
  AND (description IS NULL OR description NOT ILIKE '%센스타일%');

-- 5. 상품명이 비어있는 레코드(name = '') product_code 기반 기본 이름 부여
UPDATE public.products
SET name = product_code
WHERE (name IS NULL OR name = '') AND product_code IS NOT NULL;
