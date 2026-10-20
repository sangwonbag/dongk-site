// src/services/productDetailImageService.js
import { supabase } from '../lib/supabaseClient';

const TRENDY_450_BASE = '/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지';

// Fallback high-res catalog detail images for KCC 센스타일 트랜디
export const KCC_TRENDY_CATALOG_MAP = {
  // 450각 우븐
  'TS5502P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_14.webp',
    `${TRENDY_450_BASE}/TS5502P_사무실.jpg`,
    `${TRENDY_450_BASE}/TS5502P_2.jpg`,
    `${TRENDY_450_BASE}/TS5502P_3.jpg`
  ],
  'TS5503P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_14.webp',
    `${TRENDY_450_BASE}/TS5503P 우븐.jpg_90cross.jpg`,
    `${TRENDY_450_BASE}/TS5503P 우븐.jpg_180cross.jpg`
  ],
  // 450각 카펫
  'TS5508': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_12.webp',
    `${TRENDY_450_BASE}/TS5508P_사무실.jpg`,
    `${TRENDY_450_BASE}/TS5508 브러쉬 카펫.jpg_90cross.jpg`,
    `${TRENDY_450_BASE}/TS5508 브러쉬 카펫.jpg_180cross.jpg`
  ],
  'TS5510P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_13.webp',
    `${TRENDY_450_BASE}/TS5510P_2x2.png`,
    `${TRENDY_450_BASE}/TS5510P_사무실.jpg`
  ],
  'TS5511P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_13.webp',
    `${TRENDY_450_BASE}/TS5511P_2x2.png`
  ],
  'TS5551P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_13.webp',
    `${TRENDY_450_BASE}/TS5551P_2x2.png`
  ],
  'TS5552P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_13.webp',
    `${TRENDY_450_BASE}/TS5552P_2x2.png`
  ],
  // 450각 비앙코 & 마블
  'TS5516P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_11.webp',
    `${TRENDY_450_BASE}/TS5516P_2x2.png`
  ],
  'TS5547P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_11.webp',
    `${TRENDY_450_BASE}/TS5547P_2x2.png`,
    `${TRENDY_450_BASE}/TS5547P_상업공간.jpg`
  ],
  // 450각 콘크리트
  'TS5518P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_12.webp',
    `${TRENDY_450_BASE}/TS5518P_2x2.png`
  ],
  'TS5519P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_12.webp',
    `${TRENDY_450_BASE}/TS5519P_2x2.png`
  ],
  'TS5550P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_12.webp',
    `${TRENDY_450_BASE}/TS5550P_2x2.png`,
    `${TRENDY_450_BASE}/TS5550P_사무실.jpg`
  ],
  // 450각 슬레이트
  'TS5541P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_10.webp',
    `${TRENDY_450_BASE}/TS5541P_2x2.png`
  ],
  'TS5542P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_10.webp',
    `${TRENDY_450_BASE}/TS5542P_2x2.png`
  ],
  'TS5543P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_10.webp',
    `${TRENDY_450_BASE}/TS5543P_2x2.png`,
    `${TRENDY_450_BASE}/TS5543P_상업공간.jpg`
  ],
  'TS5544P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_10.webp',
    `${TRENDY_450_BASE}/TS5544P_2x2.png`
  ],
  'TS5548P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_10.webp',
    `${TRENDY_450_BASE}/TS5548P_2x2.png`
  ],
  'TS5549P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_10.webp',
    `${TRENDY_450_BASE}/TS5549P_2x2.png`
  ],
  'TS5549M': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_10.webp',
    `${TRENDY_450_BASE}/TS5549P_2x2.png`
  ],
  // 450각 테라죠
  'TS5545P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_09.webp',
    `${TRENDY_450_BASE}/TS5545P_2x2.png`,
    `${TRENDY_450_BASE}/TS5545P_상업공간.jpg`
  ],
  'TS5546P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_09.webp',
    `${TRENDY_450_BASE}/TS5546P_2x2.png`
  ],
  // 600각 어반 콘크리트
  'TS5531M': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_09.webp'],
  'TS5532M': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_08.webp'],
  'TS5533M': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_08.webp'],
  'TS5534M': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_08.webp'],
  'TS5535M': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_08.webp'],
  'TS5536M': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_08.webp'],
  'TS5537M': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_08.webp'],
  // 우드 플랭크
  'TW5102G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_05.webp'],
  'TW5103G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_05.webp'],
  'TW5104G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_06.webp'],
  'TW5105G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_05.webp'],
  'TW5106G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_05.webp'],
  'TW5107G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_06.webp'],
  'TW5108G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_06.webp'],
  'TW5109G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_06.webp'],
  'TW5110G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_06.webp'],
  'TW5111G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_07.webp'],
  'TW5112G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_07.webp'],
  'TW5119G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_07.webp'],
  'TW5120G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_07.webp']
};

/**
 * 특정 상품의 상세 이미지 목록을 불러옵니다.
 * 1. Supabase product_images 테이블 조회
 * 2. 없으면 KCC 센스타일 트랜디 및 브랜드별 기본 카탈로그 매핑 조회
 * 3. 없으면 빈 배열 [] 반환 (화면에서 해당 영역 숨김)
 */
export async function getProductDetailImages(productId, productCode = '', product = null) {
  try {
    if (productId && supabase) {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', Number(productId))
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((item, idx) => ({
          id: item.id,
          product_id: item.product_id,
          url: item.image_url,
          sort_order: item.sort_order ?? idx,
          alt_text: item.alt_text || '',
          image_type: item.image_type || 'detail'
        }));
      }
    }
  } catch (err) {
    console.warn('[productDetailImageService] Database query failed, checking fallback:', err);
  }

  // Fallback 1: KCC 센스타일 트랜디 카탈로그 이미지 매핑
  const cleanCode = String(productCode || product?.code || product?.product_code || product?.name || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  for (const [key, urls] of Object.entries(KCC_TRENDY_CATALOG_MAP)) {
    if (cleanCode.includes(key.toUpperCase())) {
      return urls.map((url, idx) => ({
        id: `fallback-${key}-${idx}`,
        url,
        sort_order: idx,
        alt_text: `${productCode || 'KCC 센스타일 트랜디'} 상세 이미지 ${idx + 1}`
      }));
    }
  }

  // Fallback 2: 동신 데코타일
  const brandName = (product?.brand || product?.brands?.name || '').trim();
  if (brandName === '동신') {
    return [{
      id: 'fallback-dongshin-0',
      url: '/images/dongshin_tile_detail.jpg',
      sort_order: 0,
      alt_text: '동신 데코타일 상세 정보'
    }];
  }

  return [];
}

/**
 * 관리자용: 상품의 상세 이미지 목록 저장
 */
export async function saveProductDetailImages(productId, images) {
  if (!productId) throw new Error('상품 ID가 지정되지 않았습니다.');

  const res = await fetch('/api/detail-images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: Number(productId),
      images: (images || []).map((img, idx) => ({
        id: img.id,
        image_url: img.url || img.image_url,
        sort_order: idx,
        alt_text: img.alt_text || '',
        image_type: 'detail',
        is_active: true
      }))
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || '상세 이미지 저장에 실패했습니다.');
  }

  return await res.json();
}

/**
 * 관리자용: 상세 이미지 단일/다중 파일 업로드
 */
export async function uploadDetailImageFile(file, productId) {
  if (!file) throw new Error('업로드할 파일이 없습니다.');

  // 브라우저 직접 업로드 (materials 버킷)
  if (supabase) {
    const fileExt = file.name.split('.').pop();
    const cleanExt = fileExt ? fileExt.toLowerCase() : 'webp';
    const fileName = `detail_${Date.now()}_${Math.random().toString(36).substring(7)}.${cleanExt}`;
    const filePath = `detail-images/${productId || 'misc'}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath);

      return publicUrl;
    }
    console.warn('[Direct Storage Upload Failed, trying API fallback]:', uploadError);
  }

  // Base64 fallback through API
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        const res = await fetch('/api/detail-images/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            fileName: file.name,
            fileData: base64Data
          })
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || '업로드 실패');
        }

        const data = await res.json();
        resolve(data.publicUrl);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기 오류'));
    reader.readAsDataURL(file);
  });
}
