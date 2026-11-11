-- Migration: Register LX Hausys Prestige 5T (PRESTG) 14 products
-- Category: 데코타일 (category_id = 1), Brand: LX (brand_id = 2)
-- Safety: Idempotent insert only (never updates or deletes existing rows)

INSERT INTO public.products (
  category_id, brand_id, name, slug, product_code, thickness, size_text, unit,
  price, sale_price, description, image_url, is_active, is_featured, sort_order
)
SELECT
  1, 2, v.name, v.slug, v.product_code, v.thickness, v.size_text, v.unit,
  0, 0, v.description, v.image_url, true, false, v.sort_order
FROM (VALUES
  ('LX 프레스티지 5T PTT6952 샌드 베이지', 'decotile-lx-prestige-600각-ptt6952-샌드베이지', 'PTT6952', '5.0T', '600×600mm', '5매 / BOX (1.80㎡)', '프레스티지 5T (PRESTG)', '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6952_샌드베이지.webp', 1),
  ('LX 프레스티지 5T PTT6953 솔리드 칩', 'decotile-lx-prestige-600각-ptt6953-솔리드칩', 'PTT6953', '5.0T', '600×600mm', '5매 / BOX (1.80㎡)', '프레스티지 5T (PRESTG)', '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6953_솔리드칩.webp', 2),
  ('LX 프레스티지 5T PTT6950 미스티 콘크리트', 'decotile-lx-prestige-600각-ptt6950-미스티콘크리트', 'PTT6950', '5.0T', '600×600mm', '5매 / BOX (1.80㎡)', '프레스티지 5T (PRESTG)', '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6950_미스티콘크리트.webp', 3),
  ('LX 프레스티지 5T PTT6913 펄 콘크리트', 'decotile-lx-prestige-600각-ptt6913-펄콘크리트', 'PTT6913', '5.0T', '600×600mm', '5매 / BOX (1.80㎡)', '프레스티지 5T (PRESTG)', '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6913_펄콘크리트.webp', 4),
  ('LX 프레스티지 5T PTT6910 메탈', 'decotile-lx-prestige-600각-ptt6910-메탈', 'PTT6910', '5.0T', '600×600mm', '5매 / BOX (1.80㎡)', '프레스티지 5T (PRESTG)', '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6910_메탈.webp', 5),
  ('LX 프레스티지 5T PTT6912 메탈', 'decotile-lx-prestige-600각-ptt6912-메탈', 'PTT6912', '5.0T', '600×600mm', '5매 / BOX (1.80㎡)', '프레스티지 5T (PRESTG)', '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6912_메탈.webp', 6),
  ('LX 프레스티지 5T PTT6951 모던 그레이', 'decotile-lx-prestige-600각-ptt6951-모던그레이', 'PTT6951', '5.0T', '600×600mm', '5매 / BOX (1.80㎡)', '프레스티지 5T (PRESTG)', '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6951_모던그레이.webp', 7),
  ('LX 프레스티지 5T PTT6917 비안코', 'decotile-lx-prestige-600각-ptt6917-비안코', 'PTT6917', '5.0T', '600×600mm', '5매 / BOX (1.80㎡)', '프레스티지 5T (PRESTG)', '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6917_비안코.webp', 8),
  ('LX 프레스티지 5T PTT8696 아이스 골드', 'decotile-lx-prestige-stone-rect-ptt8696-아이스골드', 'PTT8696', '5.0T', '457.2×914.4mm', '5매 / BOX (2.09㎡)', '프레스티지 5T (PRESTG) · 동조엠보(EIR)', '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT8696_아이스골드.webp', 9),
  ('LX 프레스티지 5T PTT8698 더스크 브론즈', 'decotile-lx-prestige-stone-rect-ptt8698-더스크브론즈', 'PTT8698', '5.0T', '457.2×914.4mm', '5매 / BOX (2.09㎡)', '프레스티지 5T (PRESTG) · 동조엠보(EIR)', '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT8698_더스크브론즈.webp', 10),
  ('LX 프레스티지 5T PTW7961 어반 사하라', 'decotile-lx-prestige-우드-ptw7961-어반사하라', 'PTW7961', '5.0T', '228.6×1523mm', '6매 / BOX (2.09㎡)', '프레스티지 5T (PRESTG) · 동조엠보(EIR)', '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTW7961_어반사하라.webp', 11),
  ('LX 프레스티지 5T PTW7964 아메리칸 오크', 'decotile-lx-prestige-우드-ptw7964-아메리칸오크', 'PTW7964', '5.0T', '228.6×1523mm', '6매 / BOX (2.09㎡)', '프레스티지 5T (PRESTG) · 동조엠보(EIR)', '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTW7964_아메리칸오크.webp', 12),
  ('LX 프레스티지 5T PTW7902 솔트 오크', 'decotile-lx-prestige-우드-ptw7902-솔트오크', 'PTW7902', '5.0T', '228.6×1523mm', '6매 / BOX (2.09㎡)', '프레스티지 5T (PRESTG) · 동조엠보(EIR)', '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTW7902_솔트오크.webp', 13),
  ('LX 프레스티지 5T PTW7904 파인', 'decotile-lx-prestige-우드-ptw7904-파인', 'PTW7904', '5.0T', '228.6×1523mm', '6매 / BOX (2.09㎡)', '프레스티지 5T (PRESTG) · 동조엠보(EIR)', '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTW7904_파인.webp', 14)
) AS v(name, slug, product_code, thickness, size_text, unit, description, image_url, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.products p
  WHERE p.brand_id = 2 AND p.category_id = 1 AND (p.product_code = v.product_code OR p.slug = v.slug)
);

