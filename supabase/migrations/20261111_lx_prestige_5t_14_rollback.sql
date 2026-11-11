-- Rollback Migration: Remove only LX Hausys Prestige 5T (PRESTG) 14 products
DELETE FROM public.products
WHERE category_id = 1
  AND brand_id = 2
  AND product_code IN (
    'PTT6952', 'PTT6953', 'PTT6950', 'PTT6913', 'PTT6910', 'PTT6912', 'PTT6951', 'PTT6917',
    'PTT8696', 'PTT8698',
    'PTW7961', 'PTW7964', 'PTW7902', 'PTW7904'
  );

