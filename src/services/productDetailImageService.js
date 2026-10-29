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
  'TS5531M': [
    `${TRENDY_600_BASE}/TS5531M.png`,
    `${TRENDY_600_BASE}/TS5531M_2x2.png`,
    `${TRENDY_600_BASE}/TS5531M_시공예시.jpg`
  ],
  'TS5532M': [
    `${TRENDY_600_BASE}/TS5532M.png`,
    `${TRENDY_600_BASE}/TS5532M_2x2.png`
  ],
  'TS5533M': [
    `${TRENDY_600_BASE}/TS5533M.png`,
    `${TRENDY_600_BASE}/TS5533M_2x2.png`
  ],
  'TS5534M': [
    `${TRENDY_600_BASE}/TS5534M.png`,
    `${TRENDY_600_BASE}/TS5534M_2x2.png`,
    `${TRENDY_600_BASE}/TS5534M_시공예시.jpg`
  ],
  'TS5535M': [
    `${TRENDY_600_BASE}/TS5535M.png`,
    `${TRENDY_600_BASE}/TS5535M_2x2.png`,
    `${TRENDY_600_BASE}/TS5535M_시공예시.jpg`
  ],
  'TS5536M': [
    `${TRENDY_600_BASE}/TS5536M.png`,
    `${TRENDY_600_BASE}/TS5536M_2x2.png`
  ],
  'TS5537M': [
    `${TRENDY_600_BASE}/TS5537M.png`,
    `${TRENDY_600_BASE}/TS5537M_2x2.png`
  ],
  // 우드 플랭크
  'TW5102G': [
    `${TRENDY_WOOD_BASE}/TW5102G.png`,
    `${TRENDY_WOOD_BASE}/TW5102G_확장.png`,
    `${TRENDY_WOOD_BASE}/TW5102G_사무실.jpg`
  ],
  'TW5103G': [
    `${TRENDY_WOOD_BASE}/TW5103G.png`,
    `${TRENDY_WOOD_BASE}/TW5103G_확장.png`
  ],
  'TW5104G': [
    `${TRENDY_WOOD_BASE}/TW5104G.png`,
    `${TRENDY_WOOD_BASE}/TW5104G_확장.png`,
    `${TRENDY_WOOD_BASE}/TW5104G_사무실.jpg`
  ],
  'TW5105G': [
    `${TRENDY_WOOD_BASE}/TW5105G.png`,
    `${TRENDY_WOOD_BASE}/TW5105G_확장.png`
  ],
  'TW5106G': [
    `${TRENDY_WOOD_BASE}/TW5106G.png`,
    `${TRENDY_WOOD_BASE}/TW5106G_확장.png`
  ],
  'TW5107G': [
    `${TRENDY_WOOD_BASE}/TW5107G.png`,
    `${TRENDY_WOOD_BASE}/TW5107G_확장.png`
  ],
  'TW5108G': [
    `${TRENDY_WOOD_BASE}/TW5108G.png`,
    `${TRENDY_WOOD_BASE}/TW5108G_확장.png`
  ],
  'TW5109G': [
    `${TRENDY_WOOD_BASE}/TW5109G.png`,
    `${TRENDY_WOOD_BASE}/TW5109G_확장.png`
  ],
  'TW5110G': [
    `${TRENDY_WOOD_BASE}/TW5110G.png`,
    `${TRENDY_WOOD_BASE}/TW5110G_확장.png`
  ],
  'TW5111G': [
    `${TRENDY_WOOD_BASE}/TW5111G.png`,
    `${TRENDY_WOOD_BASE}/TW5111G_확장.png`
  ],
  'TW5112G': [
    `${TRENDY_WOOD_BASE}/TW5112G.png`,
    `${TRENDY_WOOD_BASE}/TW5112G_확장.png`,
    `${TRENDY_WOOD_BASE}/TW5112G_시공예시.jpg`
  ],
  'TW5119G': [
    `${TRENDY_WOOD_BASE}/TW5119G.png`,
    `${TRENDY_WOOD_BASE}/TW5119G_사무실.jpg`
  ],
  'TW5120G': [
    `${TRENDY_WOOD_BASE}/TW5120G.png`,
    `${TRENDY_WOOD_BASE}/TW5120G_확장.png`
  ]
};

export const KCC_SENSELAY_CATALOG_MAP = {
  'B0111J': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0111J.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0111J_시공예시.jpg'
  ],
  'B0112J': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0112J.jpg'
  ],
  'B0113J': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0113J.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0113J_시공예시.jpg'
  ],
  'B0114J': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0114J.jpg'
  ],
  'B0123J': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0123J.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0123J_시공예시.jpg'
  ],
  'B0144M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0144M.jpg'
  ],
  'B0145M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0145M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0145M_시공예시.jpg'
  ],
  'B0156M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0156M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0156M_B0158M_시공예시.jpg'
  ],
  'B0157M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0157M.jpg'
  ],
  'B0158M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0158M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0156M_B0158M_시공예시.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0158M_시공예시.jpg'
  ],
  'B0195M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0195M.jpg'
  ],
  'B0196M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0196M.jpg'
  ],
  'B0197M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0197M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0197M_B0198M_시공예시.jpg'
  ],
  'B0198M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0198M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0197M_B0198M_시공예시.jpg'
  ],
  'B0199M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0199M.jpg'
  ],
  'B0271M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0271M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0271M_시공예시.jpg'
  ],
  'B0272M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0272M.jpg'
  ],
  'B0303M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0303M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0303M_시공예시.jpg'
  ],
  'B0305M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0305M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0305M_B0307M_시공예시.jpg'
  ],
  'B0307M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0307M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0305M_B0307M_시공예시.jpg'
  ],
  'B0312M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0312M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0312M_시공예시.jpg'
  ],
  'B0313M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0313M.jpg'
  ],
  'B0322M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0322M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0322M_시공예시.jpg'
  ],
  'B0323M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0323M.jpg'
  ],
  'B0324M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0324M.jpg'
  ],
  'B0325M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0325M.jpg'
  ],
  'B0331M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0331M.jpg'
  ],
  'B0332M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0332M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0332M_시공예시.jpg'
  ],
  'B0333M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0333M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0333M_시공예시.jpg'
  ],
  'B0341M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0341M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0341M_시공예시.jpg'
  ],
  'B0342M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0342M.jpg'
  ],
  'B0343M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0343M.jpg'
  ],
  'B0344M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0344M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이600각/B0344M_시공예시.jpg'
  ],
  'B0351J': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0351J.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0351J_시공예시.jpg'
  ],
  'B0353J': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0353J.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0353J_시공예시.jpg'
  ],
  'B0361M': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0361M.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0361M_시공예시.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0361M_시공예시_2.jpg'
  ],
  'B0391J': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0391J.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0391J_시공예시.jpg'
  ],
  'B0392J': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0392J.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0392J_시공예시.jpg'
  ],
  'B0393J': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0393J.jpg'
  ],
  'B0394J': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0394J.jpg'
  ],
  'B3181J': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B3181J.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B3181J_시공예시.jpg'
  ],
  'B3182J': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B3182J.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B3182J_시공예시.jpg'
  ],
  'B3183J': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B3183J.jpg'
  ],
  'B5082B': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B5082B.jpg'
  ],
  'B5083B': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이우드/B5083B.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이우드/B5083B_시공예시.jpg'
  ],
  'B5111B': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이우드/B5111B.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이우드/B5111B_시공예시.jpg'
  ],
  'B5231B': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이우드/B5231B.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이우드/B5231B_시공예시.jpg'
  ],
  'B5232B': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이우드/B5232B.jpg'
  ],
  'B5233B': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이우드/B5233B.jpg'
  ],
  'B5234B': [
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이우드/B5234B.jpg',
    '/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이우드/B5234B_시공예시.jpg'
  ],
};


/**
 * 특정 상품의 상세 이미지 목록을 불러옵니다.
 * 1. Supabase product_images 테이블 조회 (카탈로그 페이지 덤프 제외)
 * 2. materialImageManifest.generated.js 자동 매핑: 원장 -> 2x2 -> 시공
 * 3. KCC 센스타일 트랜디 및 브랜드별 기본 카탈로그 매핑 조회
 * 4. 없으면 빈 배열 [] 반환 (화면에서 해당 영역 숨김)
 */

export const DONGSHIN_CATALOG_MAP = {
  'OA317': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA317_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA317_1.webp'
  ],
  'OA318': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA318_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA318_1.webp'
  ],
  'OA323': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA323_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA323_1.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA323_2.webp'
  ],
  'OA328': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA328_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA328_1.webp'
  ],
  'OA329': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA329_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA329_1.webp'
  ],
  'OA331': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA331_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA331_1.webp'
  ],
  'OA334': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA334_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA334_1.webp'
  ],
  'OA335': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA335_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA335_1.webp'
  ],
  'OA336': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA336_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA336_1.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA336_2.webp'
  ],
  'OA337': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA337_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA337_1.webp'
  ],
  'OA338': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA338_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA338_1.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA338_2.webp'
  ],
  'OA339': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA339_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA339_1.webp'
  ],
  'OA340': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA340_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA340_1.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA340_2.webp'
  ],
  'OA341': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA341_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA341_1.webp'
  ],
  'OA342': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA342_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA342_1.webp'
  ],
  'OA343': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA343_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA343_1.webp'
  ],
  'OA344': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA344_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA344_1.webp'
  ],
  'OA345': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA345_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA345_1.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA345_2.webp'
  ],
  'OA346': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA346_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA346_1.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA346_2.webp'
  ],
  'OA347': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA347_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA347_1.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA347_2.webp'
  ],
  'OA348': [
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA348_0.webp',
    '/images/Thumbnail_Image/materials/데코타일/동신/동신 OA타일/OA348_1.webp'
  ],
  'CH5700': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5700.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5700_확장.png'
  ],
  'CH5701': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5701.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5701_확장.png'
  ],
  'CH5702': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5702.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5702_확장.png'
  ],
  'CH5703': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5703.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5703_확장.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5703_시공예시.jpg'
  ],
  'CH5704': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5704.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5704_확장.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5704_시공예시.jpg'
  ],
  'CH5705': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5705.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5705_확장.png'
  ],
  'CH5706': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5706.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5706_확장.png'
  ],
  'CH6300': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6300.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6300_2x2.png'
  ],
  'CH6301': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6301.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6301_2x2.png'
  ],
  'CH6302': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6302.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6302_2x2.png'
  ],
  'CH6303': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6303.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6303_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6303_시공예시.jpg'
  ],
  'CH6304': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6304.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6304_2x2.png'
  ],
  'CH6305': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6305.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6305_2x2.png'
  ],
  'CH6306': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6306.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6306_2x2.png'
  ],
  'CH6307': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6307.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6307_2x2.png'
  ],
  'CH6308': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6308.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6308_2x2.png'
  ],
  'CH6309': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6309.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6309_2x2.png'
  ],
  'CH6310': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6310.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6310_2x2.png'
  ],
  'CH6311': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6311.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6311_2x2.png'
  ],
  'CH6312': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6312.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6312_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6312_시공예시.jpg'
  ],
  'AH726': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH726.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH726_확장.png'
  ],
  'AH728': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH728.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH728_확장.png'
  ],
  'AH729': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH729.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH729_확장.png'
  ],
  'AH730': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH730.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH730_확장.png'
  ],
  'AH734': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH734.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH734_확장.png'
  ],
  'AH735': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH735.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH735_확장.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH735_시공예시.jpg'
  ],
  'AH736': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH736.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH736_확장.png'
  ],
  'AH737': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH737.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH737_확장.png'
  ],
  'AH738': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH738.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH738_확장.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH739_AH738_시공예시.jpg'
  ],
  'AH739': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH739.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH739_확장.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH739_AH738_시공예시.jpg'
  ],
  'AH6100': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6100.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6100_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6100_시공예시.jpg'
  ],
  'AH6101': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6101.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6101_2x2.png'
  ],
  'AH6102': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6102.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6102_2x2.png'
  ],
  'AH6103': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6103.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6103_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6103_AH6108_시공예시.jpg'
  ],
  'AH6104': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6104.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6104_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6104_AS1538_시공예시.jpg'
  ],
  'AH6105': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6105.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6105_2x2.png'
  ],
  'AH6106': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6106.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6106_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6106_AH6107_시공예시.jpg'
  ],
  'AH6107': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6107.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6107_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6106_AH6107_시공예시.jpg'
  ],
  'AH6108': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6108.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6108_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6103_AH6108_시공예시.jpg'
  ],
  'AH6109': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6109.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6109_2x2.png'
  ],
  'DS608': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS608.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS608_2x2.png'
  ],
  'DS611': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS611.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS611_2x2.png'
  ],
  'DS612': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS612.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS612_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS612_시공예시.jpg'
  ],
  'DS613': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS613.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS613_2x2.png'
  ],
  'DS615': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS615.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS615_2x2.png'
  ],
  'DS616': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS616.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS616_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS616_시공예시.jpg'
  ],
  'DS618': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS618.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS618_2x2.png'
  ],
  'DS619': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS619.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS619_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS619_시공예시.jpg'
  ],
  'DS620': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS620.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS620_2x2.png'
  ],
  'DS621': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS621.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS621_2x2.png'
  ],
  'DS623': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS623.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS623_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS623_DS625_시공예시.jpg'
  ],
  'DS625': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS625.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS625_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS623_DS625_시공예시.jpg'
  ],
  'DS626': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS626.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS626_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS626_DS627_시공예시.jpg'
  ],
  'DS627': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS627.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS627_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS626_DS627_시공예시.jpg'
  ],
  'DS671': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS671.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS671_2x2.png'
  ],
  'DS673': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS673.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS673_2x2.png'
  ],
  'AS4126': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4126.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4126_2x2.png'
  ],
  'AS4127': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4127.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4127_2x2.png'
  ],
  'AS4128': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4128.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4128_2x2.png'
  ],
  'AS4130': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4130.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4130_2x2.png'
  ],
  'AS4139': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4139.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4139_2x2.png'
  ],
  'AS4147': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4147.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4147_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4147_AS4148_시공예시.jpg'
  ],
  'AS4148': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4148.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4148_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4147_AS4148_시공예시.jpg'
  ],
  'AS4149': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4149.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4149_2x2.png'
  ],
  'AS4004': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4004.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4004_2x2.png'
  ],
  'AS4012': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4012.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4012_2x2.png'
  ],
  'AS4114': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4114.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4114_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4114_AS4116_시공예시.jpg'
  ],
  'AS4116': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4116.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4116_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4114_AS4116_시공예시.jpg'
  ],
  'AS4120': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4120.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4120_2x2.png'
  ],
  'AS4140': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4140.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4140_2x2.png'
  ],
  'AS4141': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4141.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4141_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4141_AS4142_시공예시.jpg'
  ],
  'AS4142': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4142.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4142_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4141_AS4142_시공예시.jpg'
  ],
  'AS1001': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1001.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1001_2x2.png'
  ],
  'AS1002': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1002.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1002_2x2.png'
  ],
  'AS1301': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1301.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1301_2x2.png'
  ],
  'AS1525': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1525.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1525_2x2.png'
  ],
  'AS1526': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1526.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1526_2x2.png'
  ],
  'AS1528': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1528.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1528_2x2.png'
  ],
  'AS1531': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1531.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1531_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AS1531_AS1533_시공예시.jpg'
  ],
  'AS1533': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1533.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1533_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AS1531_AS1533_시공예시.jpg'
  ],
  'AS1536': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1536.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1536_2x2.png'
  ],
  'AS1538': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1538.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1538_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6104_AS1538_시공예시.jpg'
  ],
  'AS1539': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1539.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1539_2x2.png'
  ],
  'AS1540': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1540.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1540_2x2.png'
  ],
  'AS1541': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1541.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1541_2x2.png'
  ],
  'AS1542': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1542.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1542_2x2.png'
  ],
  'AS1703': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1703.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1703_2x2.png'
  ],
  'AS1919': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1919.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1919_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1922_AS1919_시공예시.jpg'
  ],
  'AS1922': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1922.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1922_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1922_AS1919_시공예시.jpg'
  ],
  'AS1923': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1923.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1923_2x2.png'
  ],
  'AS1924': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1924.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1924_2x2.png'
  ],
  'AS1938': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1938.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1938_2x2.png'
  ],
  'AS1941': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1941.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1941_2x2.png'
  ],
  'AS1810': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1810.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1810_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1810_AS1814_시공예시.jpg'
  ],
  'AS1814': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1814.jpg',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1814_2x2.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1810_AS1814_시공예시.jpg'
  ],
  'AB6711': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6711.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6711_확장.png'
  ],
  'AB6712': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6712.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6712_확장.png'
  ],
  'AB6717': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6717.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6717_확장.png'
  ],
  'AB6727': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6727.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6727_확장.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6727_시공예시.jpg'
  ],
  'AB6739': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6739.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6739_확장.png'
  ],
  'AB6740': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6740.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6740_확장.png'
  ],
  'AB6741': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6741.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6741_확장.png'
  ],
  'AB6915': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6915.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6915_확장.png'
  ],
  'AB6933': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6933.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6933_확장.png'
  ],
  'AB6978': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6978.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6978_확장.png'
  ],
  'AB6981': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6981.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6981_확장.png'
  ],
  'AB6984': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6984.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6984_확장.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6984_시공예시.jpg'
  ],
  'AB6989': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6989.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6989_확장.png'
  ],
  'AB6990': [
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6990.png',
    '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6990_확장.png'
  ]
};

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

  // Priority Fallback for 동신 데코타일 카탈로그 이미지 매핑 (원장 -> 확장/2x2 -> 시공예시)
  if (DONGSHIN_CATALOG_MAP[baseCode]) {
    return DONGSHIN_CATALOG_MAP[baseCode].map((url, idx) => {
      const lower = url.toLowerCase();
      const is2x2 = lower.includes('2x2') || lower.includes('확장') || /\/oa\d+_1\.(jpe?g|png|webp)$/i.test(lower);
      const isScene = lower.includes('시공') || /\/oa\d+_2\.(jpe?g|png|webp)$/i.test(lower);
      return {
        id: `fallback-dongshin-${baseCode}-${idx}`,
        url,
        sort_order: idx,
        alt_text: `${productCode || baseCode} ${is2x2 ? '2x2 / 확장 패턴' : isScene ? '시공예시 공간' : '자재 원본'}`,
        image_type: is2x2 ? '2x2' : isScene ? 'office' : 'material'
      };
    });
  }

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
        expanded: 1,
        '확장': 1,
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
        alt_text: `${rawCode || img.extractedCode} ${img.imageType === 'material' || img.imageType === 'original' ? '자재 원본' : (img.imageType === '2x2' || img.imageType === 'pattern2x2' || img.imageType === 'expanded' || img.imageType === '확장') ? '2x2 / 패턴' : (img.imageType === '90cross' || img.imageType === 'cross') ? '90cross' : (img.imageType === 'office' || img.imageType === 'installation') ? '사무실 시공' : '상세 이미지'}`,
        image_type: img.imageType || 'detail'
      }));
    }
  }

  // Fallback 3: 동신 데코타일 카탈로그 이미지 매핑
  if (DONGSHIN_CATALOG_MAP[baseCode]) {
    return DONGSHIN_CATALOG_MAP[baseCode].map((url, idx) => {
      const lower = url.toLowerCase();
      const is2x2 = lower.includes('2x2') || lower.includes('확장') || /\/oa\d+_1\.(jpe?g|png|webp)$/i.test(lower);
      const isScene = lower.includes('시공') || /\/oa\d+_2\.(jpe?g|png|webp)$/i.test(lower);
      return {
        id: `fallback-dongshin-${baseCode}-${idx}`,
        url,
        sort_order: idx,
        alt_text: `${productCode || baseCode} ${is2x2 ? '2x2 / 확장 패턴' : isScene ? '시공예시 공간' : '자재 원본'}`,
        image_type: is2x2 ? '2x2' : isScene ? 'office' : 'material'
      };
    });
  }

  // Fallback 2: KCC 센스레이 카탈로그 이미지 매핑
  for (const [key, urls] of Object.entries(KCC_SENSELAY_CATALOG_MAP)) {
    if (cleanCode.includes(key.toUpperCase())) {
      return urls.map((url, idx) => ({
        id: `fallback-senselay-${key}-${idx}`,
        url,
        sort_order: idx,
        alt_text: `${productCode || 'KCC 센스레이'} ${idx === 0 ? '자재 원본' : '시공예시 공간'}`,
        image_type: idx === 0 ? 'material' : 'office'
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
