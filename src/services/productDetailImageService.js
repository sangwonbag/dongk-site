// src/services/productDetailImageService.js
import { supabase } from '../lib/supabaseClient.js';
import { imageManifest } from '../data/materialImageManifest.generated.js';

const TRENDY_450_BASE = '/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지';
const TRENDY_600_BASE = '/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_600각_이미지';
const TRENDY_WOOD_BASE = '/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_우드_이미지';

// Fallback high-res detail images for KCC 센스타일 트랜디: 원장 -> 2x2 -> 시공
export const KCC_TRENDY_CATALOG_MAP = {
  // 450각 우븐
  'TS5502P': [
    `${TRENDY_450_BASE}/TS5502P.webp`,
    `${TRENDY_450_BASE}/TS5502P_사무실.jpg`
  ],
  'TS5503P': [
    `${TRENDY_450_BASE}/TS5503P.webp`,
    `${TRENDY_450_BASE}/TS5503P_90cross.jpg`,
    `${TRENDY_450_BASE}/TS5503P_180cross.jpg`
  ],
  // 450각 카펫
  'TS5508': [
    `${TRENDY_450_BASE}/TS5508P.webp`,
    `${TRENDY_450_BASE}/TS5508P_90cross.jpg`,
    `${TRENDY_450_BASE}/TS5508P_180cross.jpg`,
    `${TRENDY_450_BASE}/TS5508P_사무실.jpg`
  ],
  'TS5508P': [
    `${TRENDY_450_BASE}/TS5508P.webp`,
    `${TRENDY_450_BASE}/TS5508P_90cross.jpg`,
    `${TRENDY_450_BASE}/TS5508P_180cross.jpg`,
    `${TRENDY_450_BASE}/TS5508P_사무실.jpg`
  ],
  'TS5510P': [
    `${TRENDY_450_BASE}/TS5510P.webp`,
    `${TRENDY_450_BASE}/TS5510P_2x2.webp`,
    `${TRENDY_450_BASE}/TS5510P_사무실.jpg`
  ],
  'TS5511P': [
    `${TRENDY_450_BASE}/TS5511P.webp`,
    `${TRENDY_450_BASE}/TS5511P_2x2.webp`
  ],
  'TS5512P': [
    `${TRENDY_450_BASE}/TS5512P_사무실.jpg`
  ],
  'TS5551P': [
    `${TRENDY_450_BASE}/TS5551P.webp`,
    `${TRENDY_450_BASE}/TS5551P_2x2.webp`
  ],
  'TS5552P': [
    `${TRENDY_450_BASE}/TS5552P.webp`,
    `${TRENDY_450_BASE}/TS5552P_2x2.webp`
  ],
  // 450각 비앙코 & 마블
  'TS5516P': [
    `${TRENDY_450_BASE}/TS5516P.webp`,
    `${TRENDY_450_BASE}/TS5516P_2x2.webp`
  ],
  'TS5547P': [
    `${TRENDY_450_BASE}/TS5547P.webp`,
    `${TRENDY_450_BASE}/TS5547P_2x2.webp`,
    `${TRENDY_450_BASE}/TS5547P_사무실.jpg`
  ],
  // 450각 콘크리트
  'TS5518P': [
    `${TRENDY_450_BASE}/TS5518P.webp`,
    `${TRENDY_450_BASE}/TS5518P_2x2.webp`
  ],
  'TS5519P': [
    `${TRENDY_450_BASE}/TS5519P.webp`,
    `${TRENDY_450_BASE}/TS5519P_2x2.webp`
  ],
  'TS5550P': [
    `${TRENDY_450_BASE}/TS5550P.webp`,
    `${TRENDY_450_BASE}/TS5550P_2x2.webp`,
    `${TRENDY_450_BASE}/TS5550P_사무실.jpg`
  ],
  // 450각 슬레이트
  'TS5541P': [
    `${TRENDY_450_BASE}/TS5541P.webp`,
    `${TRENDY_450_BASE}/TS5541P_2x2.webp`
  ],
  'TS5542P': [
    `${TRENDY_450_BASE}/TS5542P.webp`,
    `${TRENDY_450_BASE}/TS5542P_2x2.webp`
  ],
  'TS5543P': [
    `${TRENDY_450_BASE}/TS5543P.webp`,
    `${TRENDY_450_BASE}/TS5543P_2x2.webp`,
    `${TRENDY_450_BASE}/TS5543P_사무실.jpg`
  ],
  'TS5544P': [
    `${TRENDY_450_BASE}/TS5544P.webp`,
    `${TRENDY_450_BASE}/TS5544P_2x2.webp`
  ],
  'TS5548P': [
    `${TRENDY_450_BASE}/TS5548P.webp`,
    `${TRENDY_450_BASE}/TS5548P_2x2.webp`
  ],
  'TS5549P': [
    `${TRENDY_450_BASE}/TS5549P.webp`,
    `${TRENDY_450_BASE}/TS5549P_2x2.webp`
  ],
  'TS5549M': [
    `${TRENDY_450_BASE}/TS5549P.webp`,
    `${TRENDY_450_BASE}/TS5549P_2x2.webp`
  ],
  // 450각 테라죠
  'TS5545P': [
    `${TRENDY_450_BASE}/TS5545P.webp`,
    `${TRENDY_450_BASE}/TS5545P_2x2.webp`,
    `${TRENDY_450_BASE}/TS5545P_사무실.jpg`
  ],
  'TS5546P': [
    `${TRENDY_450_BASE}/TS5546P.webp`,
    `${TRENDY_450_BASE}/TS5546P_2x2.webp`
  ],
  // 600각 어반 콘크리트
  'TS5531M': [`${TRENDY_600_BASE}/TS5531M.png`],
  'TS5532M': [`${TRENDY_600_BASE}/TS5532M.png`],
  'TS5533M': [`${TRENDY_600_BASE}/TS5533M.png`],
  'TS5534M': [`${TRENDY_600_BASE}/TS5534M.png`, `${TRENDY_450_BASE}/TS5534M_사무실.jpg`],
  'TS5535M': [`${TRENDY_600_BASE}/TS5535M.png`],
  'TS5536M': [`${TRENDY_600_BASE}/TS5536M.png`],
  'TS5537M': [`${TRENDY_600_BASE}/TS5537M.png`],
  // 우드 플랭크
  'TW5102G': [`${TRENDY_WOOD_BASE}/TW5102G.png`, `${TRENDY_WOOD_BASE}/TW5102G_사무실.jpg`],
  'TW5103G': [`${TRENDY_WOOD_BASE}/TW5103G.png`],
  'TW5104G': [`${TRENDY_WOOD_BASE}/TW5104G.png`, `${TRENDY_WOOD_BASE}/TW5104G_사무실.jpg`],
  'TW5105G': [`${TRENDY_WOOD_BASE}/TW5105G.png`],
  'TW5106G': [`${TRENDY_WOOD_BASE}/TW5106G.png`],
  'TW5107G': [`${TRENDY_WOOD_BASE}/TW5107G.png`],
  'TW5108G': [`${TRENDY_WOOD_BASE}/TW5108G.png`],
  'TW5109G': [`${TRENDY_WOOD_BASE}/TW5109G.png`],
  'TW5110G': [`${TRENDY_WOOD_BASE}/TW5110G.png`],
  'TW5111G': [`${TRENDY_WOOD_BASE}/TW5111G.png`],
  'TW5112G': [`${TRENDY_WOOD_BASE}/TW5112G.png`],
  'TW5119G': [`${TRENDY_WOOD_BASE}/TW5119G.png`, `${TRENDY_WOOD_BASE}/TW5119G_사무실.jpg`],
  'TW5120G': [`${TRENDY_WOOD_BASE}/TW5120G.png`]
};

/**
 * 특정 상품의 상세 이미지 목록을 불러옵니다.
 * 1. Supabase product_images 테이블 조회 (카탈로그 페이지 덤프 제외)
 * 2. materialImageManifest.generated.js 자동 매핑: 원장 -> 2x2 -> 시공
 * 3. KCC 센스타일 트랜디 및 브랜드별 기본 카탈로그 매핑 조회
 * 4. 없으면 빈 배열 [] 반환 (화면에서 해당 영역 숨김)
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
        // 카탈로그 PDF 덤프 페이지는 제외
        const validDbImages = data.filter(item => 
          item.image_url && 
          !item.image_url.includes('catalogs/kcc-sensetile-trendy') &&
          !item.image_url.includes('/page_') &&
          !item.image_url.endsWith('/.webp')
        );

        if (validDbImages.length > 0) {
          return validDbImages.map((item, idx) => ({
            id: item.id,
            product_id: item.product_id,
            url: item.image_url,
            sort_order: item.sort_order ?? idx,
            alt_text: item.alt_text || '',
            image_type: item.image_type || 'detail'
          }));
        }
      }
    }
  } catch (err) {
    console.warn('[productDetailImageService] Database query failed, checking fallback:', err);
  }

  const rawCode = String(productCode || product?.code || product?.product_code || product?.name || '');
  const cleanCode = rawCode.replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase();
  const baseCode = cleanCode.replace(/[^A-Z0-9]/g, '');

  // Dynamic Lookup from Auto-Generated Image Manifest (All KCC Products: Trendy, Pro, SenseRay, Jangpan)
  if (Array.isArray(imageManifest) && baseCode && baseCode.length >= 3) {
    const matchingEntries = imageManifest.filter(img => {
      if (!img.extractedCode || !img.fullPublicPath) return false;
      const imgKey = String(img.extractedCode).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (imgKey === baseCode) return true;
      if (baseCode.length >= 4) {
        // Match TS5508 <-> TS5508P, but never TS5508 <-> TS5509
        if (imgKey.startsWith(baseCode) && !/\d/.test(imgKey.slice(baseCode.length))) return true;
        if (baseCode.startsWith(imgKey) && !/\d/.test(baseCode.slice(imgKey.length))) return true;
      }
      return false;
    });

    if (matchingEntries.length > 0) {
      const IMAGE_PRIORITY = {
        material: 0,
        original: 0,
        '2x2': 1,
        pattern2x2: 1,
        '90cross': 2,
        cross: 2,
        office: 3,
        installation: 3,
        other: 4
      };
      const seenPaths = new Set();
      const uniqueMatching = [];
      for (const entry of matchingEntries) {
        let decoded = entry.fullPublicPath;
        try { decoded = decodeURI(entry.fullPublicPath); } catch {}
        if (!seenPaths.has(decoded)) {
          seenPaths.add(decoded);
          uniqueMatching.push(entry);
        }
      }

      const sorted = [...uniqueMatching].sort((a, b) => {
        const rA = IMAGE_PRIORITY[a.imageType] !== undefined ? IMAGE_PRIORITY[a.imageType] : 99;
        const rB = IMAGE_PRIORITY[b.imageType] !== undefined ? IMAGE_PRIORITY[b.imageType] : 99;
        return rA - rB;
      });

      return sorted.map((img, idx) => ({
        id: `manifest-${img.extractedCode}-${idx}`,
        url: img.fullPublicPath,
        sort_order: idx,
        alt_text: `${rawCode || img.extractedCode} ${img.imageType === 'material' || img.imageType === 'original' ? '자재 원본' : (img.imageType === '2x2' || img.imageType === 'pattern2x2') ? '2x2 패턴' : (img.imageType === '90cross' || img.imageType === 'cross') ? '90cross' : (img.imageType === 'office' || img.imageType === 'installation') ? '사무실 시공' : '상세 이미지'}`,
        image_type: img.imageType || 'detail'
      }));
    }
  }

  // Fallback 1: KCC 센스타일 트랜디 카탈로그 이미지 매핑
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
