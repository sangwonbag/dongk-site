/**
 * Dongshin Polymer (동신포리마) Detail Page Specifications and Utility Helpers
 * 
 * Based on:
 * - 동신포리마 종합 샘플북 (36 pages)
 * - Group A: 동신 아트하우스 (ART HOUSE) - pp. 10~17
 * - Group B: 동신 아트타일 (ART TILE) - pp. 18~33
 * - Group C: 동신 아트에코차음 (ART ECO ACOUSTIC) - pp. 2~9
 * - Installation & Maintenance Guidelines: pp. 34~35
 */

import { getComputedBrand } from './brandUtils.js';

/**
 * Normalizes product code by removing spaces and converting to uppercase
 */
export function normalizeProductCode(code) {
  if (!code) return '';
  return String(code).trim().replace(/\s+/g, '').toUpperCase();
}

/**
 * Checks whether an item is a Dongshin residential/commercial decotile product.
 * Strictly excludes:
 * - OA Access Floor Tiles (OA series)
 * - Daejin decotile (brand: '대진')
 * - Wallpaper (brand: '개나리', category: '벽지')
 */
export function isDongshinDecoProduct(item) {
  if (!item) return false;
  
  const brand = getComputedBrand(item);
  if (brand !== '동신') return false;

  const category = (item.category || '').trim();
  if (category && category !== '데코타일') return false;

  const code = normalizeProductCode(item.code || item.product_code || item.productCode || '');
  const line = String(item.line || '').trim();

  // Strictly exclude OA tiles
  if (code.startsWith('OA') || line.includes('OA')) {
    return false;
  }

  // Check valid Dongshin decotile groups
  if (code.startsWith('CH') || code.startsWith('AH') || code.startsWith('DS') || code.startsWith('AS') || code.startsWith('AB')) {
    return true;
  }

  if (['아트하우스', '아트타일', '아트에코차음'].includes(line)) {
    return true;
  }

  return false;
}

/**
 * Returns the Dongshin product group: 'acoustic' | 'arthouse' | 'arttile'
 */
export function getDongshinProductGroup(item) {
  if (!item) return null;
  const code = normalizeProductCode(item.code || item.product_code || item.productCode || '');
  const line = String(item.line || '').trim();

  if (code.startsWith('CH') || line.includes('차음') || line.includes('에코')) {
    return 'acoustic';
  }
  if (code.startsWith('AH') || line.includes('하우스')) {
    return 'arthouse';
  }
  if (code.startsWith('DS') || code.startsWith('AS') || code.startsWith('AB') || line.includes('아트타일')) {
    return 'arttile';
  }

  return 'arttile';
}

/**
 * Catalog Room Scenes Map
 */
const CATALOG_ROOM_SCENES = {
  // Group C: Eco Acoustic
  CH_5704: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5704_시공예시.jpg',
    title: '미드센추리 모던 거실 & 다이닝',
    subtitle: '동신포리마 카탈로그 공식 연출 공간',
    productCodes: 'CH 5704 (우드)',
    catalogPage: 'p. 2~3'
  },
  CH_5703: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음우드/CH5703_시공예시.jpg',
    title: '내추럴 리빙룸 & 휴게 라운지',
    subtitle: '동신포리마 카탈로그 공식 연출 공간',
    productCodes: 'CH 5703 (우드)',
    catalogPage: 'p. 4~5'
  },
  CH_6303: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6303_시공예시.jpg',
    title: '모던 스톤 미니멀 오피스 & 라운지',
    subtitle: '동신포리마 카탈로그 공식 연출 공간',
    productCodes: 'CH 6303 (사각)',
    catalogPage: 'p. 6~7'
  },
  CH_6312: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트에코차음/동신에코차음사각/CH6312_시공예시.jpg',
    title: '프리미엄 다이닝 & 쇼룸 갤러리',
    subtitle: '동신포리마 카탈로그 공식 연출 공간',
    productCodes: 'CH 6312 (사각)',
    catalogPage: 'p. 8~9'
  },

  // Group A: Art House
  AH_739_738: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH739_AH738_시공예시.jpg',
    title: '감각적인 투톤 쪽마루 우드 거실',
    subtitle: '동신포리마 카탈로그 공식 복수 혼합 시공 사례',
    productCodes: 'AH 739 / AH 738 (리빙듀오)',
    catalogPage: 'p. 10~11'
  },
  AH_735: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 우드/AH735_시공예시.jpg',
    title: '따뜻한 온돌 감성 주거 리빙룸',
    subtitle: '동신포리마 카탈로그 공식 연출 공간',
    productCodes: 'AH 735 (리빙듀오)',
    catalogPage: 'p. 12~13'
  },
  AH_6106_6107: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6106_AH6107_시공예시.jpg',
    title: '모던 그레이 마블 호텔식 거실',
    subtitle: '동신포리마 카탈로그 공식 복수 혼합 시공 사례',
    productCodes: 'AH 6106 / AH 6107 (하우스마블)',
    catalogPage: 'p. 14'
  },
  AH_6100: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6100_시공예시.jpg',
    title: '화사한 크림 마블 주거 공간',
    subtitle: '동신포리마 카탈로그 공식 연출 공간',
    productCodes: 'AH 6100 (하우스마블)',
    catalogPage: 'p. 15'
  },
  AH_6103_6108: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6103_AH6108_시공예시.jpg',
    title: '하이엔드 대리석 패턴 리빙 & 라운지',
    subtitle: '동신포리마 카탈로그 공식 복수 혼합 시공 사례',
    productCodes: 'AH 6103 / AH 6108 (하우스마블)',
    catalogPage: 'p. 16~17'
  },

  // Group B: Art Tile 600 Square
  DS_619: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS619_시공예시.jpg',
    title: '인더스트리얼 대형 쇼룸 & 로비',
    subtitle: '동신포리마 카탈로그 공식 연출 공간',
    productCodes: 'DS 619 (600 사각)',
    catalogPage: 'p. 18~19'
  },
  DS_626_627: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS626_DS627_시공예시.jpg',
    title: '모던 텍스처 오피스 업무 공간',
    subtitle: '동신포리마 카탈로그 공식 복수 혼합 시공 사례',
    productCodes: 'DS 626 / DS 627 (600 사각)',
    catalogPage: 'p. 20'
  },
  DS_623_625: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS623_DS625_시공예시.jpg',
    title: '클린 비즈니스 미팅룸 & 리셉션',
    subtitle: '동신포리마 카탈로그 공식 복수 혼합 시공 사례',
    productCodes: 'DS 623 / DS 625 (600 사각)',
    catalogPage: 'p. 21'
  },
  DS_612: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS612_시공예시.jpg',
    title: '스톤 콘크리트 상업 스튜디오',
    subtitle: '동신포리마 카탈로그 공식 연출 공간',
    productCodes: 'DS 612 (600 사각)',
    catalogPage: 'p. 22'
  },
  DS_616: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 600각/DS616_시공예시.jpg',
    title: '다크 스톤 감각적인 카페 & 매장',
    subtitle: '동신포리마 카탈로그 공식 연출 공간',
    productCodes: 'DS 616 (600 사각)',
    catalogPage: 'p. 23'
  },

  // Group B: Art Tile 457 Square
  AS_4147_4148: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4147_AS4148_시공예시.jpg',
    title: '어반 콘크리트 멀티미디어 라운지',
    subtitle: '동신포리마 카탈로그 공식 복수 혼합 시공 사례',
    productCodes: 'AS 4147 / AS 4148 (콘크리트)',
    catalogPage: 'p. 24~25'
  },
  AS_4141_4142: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4141_AS4142_시공예시.jpg',
    title: '앱스트랙 패턴 크리에이티브 공간',
    subtitle: '동신포리마 카탈로그 공식 복수 혼합 시공 사례',
    productCodes: 'AS 4141 / AS 4142 (앱스트랙)',
    catalogPage: 'p. 26'
  },
  AS_4114_4116: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS4114_AS4116_시공예시.jpg',
    title: '모던 기하학 패턴 카페테리아',
    subtitle: '동신포리마 카탈로그 공식 복수 혼합 시공 사례',
    productCodes: 'AS 4114 / AS 4116 (앱스트랙)',
    catalogPage: 'p. 27'
  },
  AS_1538_AH_6104: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트하우스/동신 하우스 사각/AH6104_AS1538_시공예시.jpg',
    title: '클래식 마블 & 대리석 리셉션',
    subtitle: '동신포리마 카탈로그 공식 복수 혼합 시공 사례',
    productCodes: 'AS 1538 / AH 6104 (마블)',
    catalogPage: 'p. 28'
  },
  AS_1531_1533: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AS1531_AS1533_시공예시.jpg',
    title: '웜 카펫 텍스처 비즈니스 라운지',
    subtitle: '동신포리마 카탈로그 공식 복수 혼합 시공 사례',
    productCodes: 'AS 1531 / AS 1533 (카펫)',
    catalogPage: 'p. 29'
  },
  AS_1922_1919: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1922_AS1919_시공예시.jpg',
    title: '오피스 워크스테이션 & 코워킹 스페이스',
    subtitle: '동신포리마 카탈로그 공식 복수 혼합 시공 사례',
    productCodes: 'AS 1922 / AS 1919 (카펫)',
    catalogPage: 'p. 30'
  },
  AS_1810_1814: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 450각/AS1810_AS1814_시공예시.jpg',
    title: '그라니트 화강암 질감 회의실',
    subtitle: '동신포리마 카탈로그 공식 복수 혼합 시공 사례',
    productCodes: 'AS 1810 / AS 1814 (그라니트)',
    catalogPage: 'p. 31'
  },

  // Group B: Art Tile Wood
  AB_6727: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6727_시공예시.jpg',
    title: '듀오라인 내추럴 원목 거실 & 서재',
    subtitle: '동신포리마 카탈로그 공식 연출 공간',
    productCodes: 'AB 6727 (듀오라인)',
    catalogPage: 'p. 32'
  },
  AB_6984: {
    image: '/images/Thumbnail_Image/materials/데코타일/동신/아트타일/동신 아트 우드/AB6984_시공예시.jpg',
    title: '앤틱 우드 빈티지 카페 & 쇼룸',
    subtitle: '동신포리마 카탈로그 공식 연출 공간',
    productCodes: 'AB 6984 (앤틱우드)',
    catalogPage: 'p. 33'
  }
};

/**
 * Resolves space scene examples for a specific Dongshin product.
 * Strictly returns ONLY scenes where the current product code is an exact match.
 */
function resolveDongshinRoomScenes(item, normCode, group) {
  const scenes = [];

  if (normCode === 'CH5704') {
    scenes.push({ ...CATALOG_ROOM_SCENES.CH_5704, isExactMatch: true, badge: '선택 제품 공식 연출' });
  } else if (normCode === 'CH5703') {
    scenes.push({ ...CATALOG_ROOM_SCENES.CH_5703, isExactMatch: true, badge: '선택 제품 공식 연출' });
  } else if (normCode === 'CH6303') {
    scenes.push({ ...CATALOG_ROOM_SCENES.CH_6303, isExactMatch: true, badge: '선택 제품 공식 연출' });
  } else if (normCode === 'CH6312') {
    scenes.push({ ...CATALOG_ROOM_SCENES.CH_6312, isExactMatch: true, badge: '선택 제품 공식 연출' });
  } else if (normCode === 'AH739' || normCode === 'AH738') {
    scenes.push({ ...CATALOG_ROOM_SCENES.AH_739_738, isExactMatch: true, badge: '선택 제품 공식 혼합시공' });
  } else if (normCode === 'AH735') {
    scenes.push({ ...CATALOG_ROOM_SCENES.AH_735, isExactMatch: true, badge: '선택 제품 공식 연출' });
  } else if (normCode === 'AH6106' || normCode === 'AH6107') {
    scenes.push({ ...CATALOG_ROOM_SCENES.AH_6106_6107, isExactMatch: true, badge: '선택 제품 공식 혼합시공' });
  } else if (normCode === 'AH6100') {
    scenes.push({ ...CATALOG_ROOM_SCENES.AH_6100, isExactMatch: true, badge: '선택 제품 공식 연출' });
  } else if (normCode === 'AH6103' || normCode === 'AH6108') {
    scenes.push({ ...CATALOG_ROOM_SCENES.AH_6103_6108, isExactMatch: true, badge: '선택 제품 공식 혼합시공' });
  } else if (normCode === 'AH6104' || normCode === 'AS1538') {
    scenes.push({ ...CATALOG_ROOM_SCENES.AS_1538_AH_6104, isExactMatch: true, badge: '선택 제품 공식 혼합시공' });
  } else if (normCode === 'DS619') {
    scenes.push({ ...CATALOG_ROOM_SCENES.DS_619, isExactMatch: true, badge: '선택 제품 공식 연출' });
  } else if (normCode === 'DS626' || normCode === 'DS627') {
    scenes.push({ ...CATALOG_ROOM_SCENES.DS_626_627, isExactMatch: true, badge: '선택 제품 공식 혼합시공' });
  } else if (normCode === 'DS623' || normCode === 'DS625') {
    scenes.push({ ...CATALOG_ROOM_SCENES.DS_623_625, isExactMatch: true, badge: '선택 제품 공식 혼합시공' });
  } else if (normCode === 'DS612') {
    scenes.push({ ...CATALOG_ROOM_SCENES.DS_612, isExactMatch: true, badge: '선택 제품 공식 연출' });
  } else if (normCode === 'DS616') {
    scenes.push({ ...CATALOG_ROOM_SCENES.DS_616, isExactMatch: true, badge: '선택 제품 공식 연출' });
  } else if (normCode === 'AS4147' || normCode === 'AS4148') {
    scenes.push({ ...CATALOG_ROOM_SCENES.AS_4147_4148, isExactMatch: true, badge: '선택 제품 공식 혼합시공' });
  } else if (normCode === 'AS4141' || normCode === 'AS4142') {
    scenes.push({ ...CATALOG_ROOM_SCENES.AS_4141_4142, isExactMatch: true, badge: '선택 제품 공식 혼합시공' });
  } else if (normCode === 'AS4114' || normCode === 'AS4116') {
    scenes.push({ ...CATALOG_ROOM_SCENES.AS_4114_4116, isExactMatch: true, badge: '선택 제품 공식 혼합시공' });
  } else if (normCode === 'AS1531' || normCode === 'AS1533') {
    scenes.push({ ...CATALOG_ROOM_SCENES.AS_1531_1533, isExactMatch: true, badge: '선택 제품 공식 혼합시공' });
  } else if (normCode === 'AS1922' || normCode === 'AS1919') {
    scenes.push({ ...CATALOG_ROOM_SCENES.AS_1922_1919, isExactMatch: true, badge: '선택 제품 공식 혼합시공' });
  } else if (normCode === 'AS1810' || normCode === 'AS1814') {
    scenes.push({ ...CATALOG_ROOM_SCENES.AS_1810_1814, isExactMatch: true, badge: '선택 제품 공식 혼합시공' });
  } else if (normCode === 'AB6727') {
    scenes.push({ ...CATALOG_ROOM_SCENES.AB_6727, isExactMatch: true, badge: '선택 제품 공식 연출' });
  } else if (normCode === 'AB6984') {
    scenes.push({ ...CATALOG_ROOM_SCENES.AB_6984, isExactMatch: true, badge: '선택 제품 공식 연출' });
  }

  return scenes;
}

/**
 * Returns complete official Dongshin Polyma Detail Specification Data
 */
export function getDongshinDetailInfo(item) {
  if (!isDongshinDecoProduct(item)) return null;

  const group = getDongshinProductGroup(item);
  const normCode = normalizeProductCode(item.code || item.product_code || item.productCode || '');
  const line = String(item.line || '').trim();

  // 1. Group A: 동신 아트하우스 (ART HOUSE)
  if (group === 'arthouse') {
    const isWood = normCode.startsWith('AH7');
    const lineup = isWood ? '리빙듀오' : '하우스마블';
    const size = isWood ? '180 × 920 × 3.0mm' : '600 × 600 × 3.0mm';
    const pcsPerBox = isWood ? '20매' : '9매';
    const areaPerBox = isWood ? '3.31㎡' : '3.24㎡';
    const packing = `${pcsPerBox} / Box (${areaPerBox})`;
    const designPattern = isWood ? '쪽마루 우드 (Living Duo Wood)' : '대리석 & 마블 (House Marble)';

    return {
      group: 'arthouse',
      groupKey: 'arthouse',
      groupName: '동신 아트하우스',
      collection: 'ART HOUSE',
      lineupName: lineup,
      productName: item.name || normCode,
      productCode: item.code || normCode,
      catalogPages: 'p. 10~17',
      spec: {
        brand: '동신포리마 (Dongshin Polymer)',
        lineup: `아트하우스 (${lineup})`,
        thickness: '3.0T',
        size: size,
        pcs_per_box: pcsPerBox,
        area: areaPerBox,
        packing: packing,
        designType: designPattern,
        materialType: '온돌용 프리미엄 LVT (Glass Fiber 치수안정층 결합)',
        adhesive: '아크릴계(W-320E, W-300S) / 우레탄계(T-10)'
      },
      comparisonTable: [
        {
          lineup: '리빙듀오 (우드)',
          thickness: '3.0T',
          size: '180 × 920mm',
          pcsPerBox: '20매',
          areaPerBox: '3.31㎡',
          isCurrent: isWood,
          note: '온돌난방 최적화 쪽마루 패턴'
        },
        {
          lineup: '하우스마블 (사각)',
          thickness: '3.0T',
          size: '600 × 600mm',
          pcsPerBox: '9매',
          areaPerBox: '3.24㎡',
          isCurrent: !isWood,
          note: '천연 대리석 질감 600각 사각'
        }
      ],
      features: [
        {
          icon: '♨️',
          title: '온돌난방에 최적화된 바닥재',
          desc: 'Glass Fiber(유리섬유) 치수안정층이 내장되어 한국 온돌난방 환경에서 열에 의한 수축·팽창 및 들뜸을 완벽히 억제합니다.'
        },
        {
          icon: '✨',
          title: '편리한 유지관리 및 고내구성',
          desc: '고경도 UV 코팅과 투명 보호필름층이 일상 스크래치와 오염 침투를 차단하여 주거 공간에서 간편한 청소와 관리를 제공합니다.'
        },
        {
          icon: '🪵',
          title: '쪽마루 타입의 독창적인 디자인',
          desc: '원목 온돌마루를 실제 시공한 듯한 내추럴한 나뭇결 텍스처와 감각적인 비율을 정교하게 표현하여 아늑한 분위기를 연출합니다.'
        },
        {
          icon: '🏡',
          title: '안정감 있는 주거공간 연출',
          desc: '따뜻한 우드 패턴과 품격 있는 하우스 마블 디자인으로 아파트, 단독주택 등 주거 인테리어의 격을 한 단계 높여줍니다.'
        }
      ],
      layerStructure: {
        totalLayers: 7,
        diagramImage: '/images/materials/dongshin_scenes/structure_arthouse_layers.webp',
        layers: [
          { step: 'Layer 1', name: '표면처리층 (UV Coating)', desc: '스크래치와 일상 생활 오염에 강한 고경도 UV 특수 코팅층' },
          { step: 'Layer 2', name: '보호필름층 (Wear Layer)', desc: '표면 내마모성을 극대화하여 디자인을 영구 보호하는 고투명 보호 필름층' },
          { step: 'Layer 3', name: '디자인층 (Printed Layer)', desc: '천연 원목 결 및 대리석 마블 질감을 사실감 있게 인쇄한 고해상도 디자인층' },
          { step: 'Layer 4', name: '중지 (Middle Sheet)', desc: '난방열을 균일하게 전달하고 충격을 완충하여 편안한 보행감을 형성하는 중간 코어층' },
          { step: 'Layer 5', name: '치수안정층 (Glass Fiber Layer)', desc: '특수 유리섬유가 함유되어 온돌 난방 시 열신축 및 수축·팽창을 억제하는 핵심층' },
          { step: 'Layer 6', name: '하지 (Base Layer)', desc: '바닥 하중을 안정적으로 지지하고 평활도를 유지하는 고밀도 PVC 하지 베이스층' },
          { step: 'Layer 7', name: '바란스 (Balance Sheet)', desc: '상하 팽창 균형을 유지하고 접착제와의 결합력을 향상시켜 들뜸을 방지하는 밸런스층' }
        ]
      },
      adhesiveGuide: {
        type: 'standard',
        name: 'W-320E / W-300S (아크릴계) 또는 T-10 (우레탄계)',
        spreadRate: '300 ~ 330g/㎡',
        tool: '지정 고무헤라 (홈 2.5mm × 너비 3mm × 높이 2mm)',
        openTime: '약 15분 (손가락에 묻지 않고 끈적임이 형성되는 Tack 상태)',
        potLife: '약 70분 이내 부착 완료',
        temp: '상온 16 ~ 28℃ 유지 (10℃ 이하 저온 시공 절대 금지)',
        rollerPress: '50kg 핸들 롤러로 전면 충분히 압착',
        adhesivesList: [
          {
            name: 'W-320E',
            category: '아크릴계 수성 접착제',
            pack: '10kg / 14kg / 20kg',
            usage: '일반 주거 및 상온 온돌 환경, 친환경 표준 시공용'
          },
          {
            name: 'W-300S',
            category: '조강용 아크릴계 접착제',
            pack: '10kg / 20kg',
            usage: '동절기 저온 환경 또는 초기 빠른 고착이 필요한 현장'
          },
          {
            name: 'T-10',
            category: '폴리우레탄계 2액형 접착제',
            pack: '10kg (주제+경화제)',
            usage: '내수성이 요구되거나 중보행 고접착이 필수적인 바닥 현장'
          }
        ],
        notice: '※ 시공 전 바닥 수분 함유율 4.5% 이하를 필히 확인하시고, 지정 고무헤라를 사용하여 표준 도포량(300~330g/㎡)을 균일하게 도포하십시오.'
      },
      roomScenes: resolveDongshinRoomScenes(item, normCode, 'arthouse')
    };
  }

  // 2. Group C: 동신 아트에코차음 (ART ECO ACOUSTIC)
  if (group === 'acoustic') {
    const isWood = normCode.startsWith('CH57');
    const lineup = isWood ? '에코차음 우드' : '에코차음 사각';
    const size = isWood ? '250 × 1050 × 5.0mm' : '600 × 600 × 5.0mm';
    const pcsPerBox = isWood ? '12매' : '9매';
    const areaPerBox = isWood ? '3.15㎡' : '3.24㎡';
    const packing = `${pcsPerBox} / Box (${areaPerBox})`;
    const designPattern = isWood ? '광폭 차음 우드 (Acoustic Wood)' : '대형 차음 사각 (Acoustic Square)';

    return {
      group: 'acoustic',
      groupKey: 'acoustic',
      groupName: '동신 아트에코차음',
      collection: 'ART ECO ACOUSTIC',
      lineupName: lineup,
      productName: item.name || normCode,
      productCode: item.code || normCode,
      catalogPages: 'p. 2~9',
      spec: {
        brand: '동신포리마 (Dongshin Polymer)',
        lineup: `아트에코차음 (${lineup})`,
        thickness: '5.0T (고기능 차음 5.0mm)',
        size: size,
        pcs_per_box: pcsPerBox,
        area: areaPerBox,
        packing: packing,
        designType: designPattern,
        materialType: '고기능 차음 LVT (친환경 고밀도 IXPE 흡음 발포패드 일체형)',
        adhesive: '차음 전용 수성 아크릴계 CT-100A (120~150g/㎡ 롤러 도포)'
      },
      comparisonTable: [
        {
          lineup: '에코차음 우드 (CH 57xx)',
          thickness: '5.0T',
          size: '250 × 1050mm',
          pcsPerBox: '12매',
          areaPerBox: '3.15㎡',
          isCurrent: isWood,
          note: '250mm 광폭 프리미엄 흡음 우드'
        },
        {
          lineup: '에코차음 사각 (CH 63xx)',
          thickness: '5.0T',
          size: '600 × 600mm',
          pcsPerBox: '9매',
          areaPerBox: '3.24㎡',
          isCurrent: !isWood,
          note: '600각 대형 스톤 흡음 사각타일'
        }
      ],
      features: [
        {
          icon: '🔇',
          title: '소음 감소 기능 (공인 시험 통과)',
          desc: '특허받은 고탄성 IXPE Backing 패드 일체형 기술을 적용하여 보행 소음 및 경량 층간충격음을 효과적으로 저감합니다.'
        },
        {
          icon: '🦶',
          title: '편안하고 우수한 보행감',
          desc: '5.0mm 특수 두께와 고밀도 완충 발포 쿠션층이 보행 시 무릎 및 관절 피로도를 획기적으로 완화하여 장시간 쾌적합니다.'
        },
        {
          icon: '🛡️',
          title: '내오염성 최소화 고경도 UV',
          desc: '고경도 UV 특수 표면처리로 바닥 표면의 스크래치와 마모 발생을 억제하고 일상 오염 물질의 착색을 방지합니다.'
        },
        {
          icon: '🚸',
          title: '탁월한 미끄럼 방지 기능',
          desc: '보행 안전성을 강화한 엠보 표면 설계로 미끄럼 사고를 예방하여 아이, 어르신, 반려동물 모두 안전합니다.'
        }
      ],
      layerStructure: {
        totalLayers: 8,
        diagramImage: '/images/materials/dongshin_scenes/structure_acoustic_layers.webp',
        layers: [
          { step: 'Layer 1', name: '표면처리층 (UV Coating)', desc: '스크래치와 오염에 강한 고경도 UV 특수 처리 표면층' },
          { step: 'Layer 2', name: '보호필름층 (Wear Layer)', desc: '고투명 고내마모 필름으로 바닥면 마모 손상을 원천 차단하는 보호층' },
          { step: 'Layer 3', name: '디자인층 (Printed Layer)', desc: '천연 원목과 천연 석재 고유의 입체 패턴을 재현한 고해상도 인쇄층' },
          { step: 'Layer 4', name: '중지 (Middle Sheet)', desc: '상하 층간 응력을 분산하고 완충력을 보강하는 중간층' },
          { step: 'Layer 5', name: '치수안정층 (Glass Fiber Layer)', desc: '유리섬유 직조망이 내장되어 온도 및 습도 변화에 따른 수축·팽창을 억제' },
          { step: 'Layer 6', name: '하지 (Base Layer)', desc: '보행 충격을 분산하고 탄탄한 접지 지지력을 부여하는 고강도 베이스층' },
          { step: 'Layer 7', name: '바란스 (Balance Sheet)', desc: '평활도를 일정하게 유지하고 하부 쿠션층과의 견고한 접착 결합을 형성' },
          { step: 'Layer 8', name: 'IXPE 발포층 (Acoustic Backing)', desc: '특허받은 친환경 고밀도 IXPE 흡음 발포패드로 층간소음 감소와 탁월한 쿠션감 제공' }
        ]
      },
      adhesiveGuide: {
        type: 'acoustic',
        name: 'CT-100A (아트에코차음 전용 수성 아크릴계 접착제)',
        spreadRate: '120 ~ 150g/㎡ (일반 타일 헤라 도포량과 엄격히 구분)',
        tool: '페인트용 롤러 브러시 권장 (일반 톱니 헤라 사용 금지)',
        openTime: '약 15분 (Tack 형성 후 시공)',
        potLife: '약 70분 이내 부착 완료',
        temp: '상온 16 ~ 28℃ 유지 (10℃ 이하 저온 시공 절대 금지)',
        rollerPress: '50kg 핸들 롤러로 전면 충분히 압착',
        adhesivesList: [
          {
            name: 'CT-100A (지정 전용)',
            category: '수성 아크릴계 차음 전용 접착제',
            pack: '15kg 말통 또는 22.2kg 박스',
            usage: '아트에코차음 5.0T 전 제품 전용 (바닥습도 4.5% 이하 환경)'
          }
        ],
        notice: '★ [중요 경고] 아트에코차음 5.0T 제품은 반드시 전용 접착제 CT-100A를 사용해야 하며, 일반 데코타일 접착제(W-320E 등)를 사용하거나 톱니 헤라로 과다 도포(300g/㎡ 이상)할 경우 IXPE 발포층의 기능 손상 및 들뜸 하자가 발생합니다. 반드시 페인트용 롤러 브러시로 120~150g/㎡를 얇고 균일하게 도포하십시오.'
      },
      roomScenes: resolveDongshinRoomScenes(item, normCode, 'acoustic')
    };
  }

  // 3. Group B: 동신 아트타일 (ART TILE)
  const is600 = normCode.startsWith('DS');
  const isWood = normCode.startsWith('AB');
  const is457 = normCode.startsWith('AS');

  let lineup = '600 사각타일';
  let size = '600 × 600 × 3.0mm';
  let pcsPerBox = '9매';
  let areaPerBox = '3.24㎡';
  let designPattern = '스톤 & 콘크리트 대형 사각';

  if (isWood) {
    lineup = normCode.startsWith('AB69') ? '앤틱우드' : '듀오라인';
    size = '180 × 920 × 3.0mm';
    pcsPerBox = '20매';
    areaPerBox = '3.31㎡';
    designPattern = '내추럴 우드 쪽마루 타일';
  } else if (is457) {
    if (['AS4126', 'AS4127', 'AS4128', 'AS4130', 'AS4139', 'AS4147', 'AS4148', 'AS4149'].includes(normCode)) {
      lineup = '콘크리트';
      designPattern = '인더스트리얼 콘크리트 패턴';
    } else if (['AS4004', 'AS4012', 'AS4114', 'AS4116', 'AS4120', 'AS4140', 'AS4141', 'AS4142'].includes(normCode)) {
      lineup = '앱스트랙';
      designPattern = '감각적인 기하학 앱스트랙 패턴';
    } else if (['AS1001', 'AS1002', 'AS1536', 'AS1538', 'AS1539', 'AS1540', 'AS1541', 'AS1542'].includes(normCode)) {
      lineup = '마블';
      designPattern = '천연 대리석 텍스처 마블 패턴';
    } else if (['AS1301', 'AS1525', 'AS1526', 'AS1528', 'AS1531', 'AS1533', 'AS1919', 'AS1922', 'AS1923', 'AS1924', 'AS1938', 'AS1941'].includes(normCode)) {
      lineup = '카펫';
      designPattern = '소프트 패브릭 질감 카펫 패턴';
    } else if (['AS1703', 'AS1810', 'AS1814'].includes(normCode)) {
      lineup = '그라니트';
      designPattern = '천연 화강석 질감 그라니트 패턴';
    } else {
      lineup = '457 사각타일';
      designPattern = '프리미엄 457.2각 사각 패턴';
    }
    size = '457.2 × 457.2 × 3.0mm';
    pcsPerBox = '16매';
    areaPerBox = '3.34㎡';
  }

  const packing = `${pcsPerBox} / Box (${areaPerBox})`;

  return {
    group: 'arttile',
    groupKey: 'arttile',
    groupName: '동신 아트타일',
    collection: 'ART TILE',
    lineupName: lineup,
    productName: item.name || normCode,
    productCode: item.code || normCode,
    catalogPages: 'p. 18~33',
    spec: {
      brand: '동신포리마 (Dongshin Polymer)',
      lineup: `아트타일 (${lineup})`,
      thickness: '3.0T',
      size: size,
      pcs_per_box: pcsPerBox,
      area: areaPerBox,
      packing: packing,
      designType: designPattern,
      materialType: '상업용 고내구 LVT (고밀도 PVC 내마모 타일)',
      adhesive: '아크릴계(W-320E, W-300S) / 폴리우레탄계(T-10)'
    },
    comparisonTable: [
      {
        lineup: '600 사각타일 (DS)',
        thickness: '3.0T',
        size: '600 × 600mm',
        pcsPerBox: '9매',
        areaPerBox: '3.24㎡',
        isCurrent: is600,
        note: '대형 매장, 로비, 오피스 최적화'
      },
      {
        lineup: '457 사각타일 (AS)',
        thickness: '3.0T',
        size: '457.2 × 457.2mm',
        pcsPerBox: '16매',
        areaPerBox: '3.34㎡',
        isCurrent: is457,
        note: '콘크리트/앱스트랙/마블/카펫/그라니트'
      },
      {
        lineup: '우드타일 (AB)',
        thickness: '3.0T',
        size: '180 × 920mm',
        pcsPerBox: '20매',
        areaPerBox: '3.31㎡',
        isCurrent: isWood,
        note: '듀오라인 및 앤틱우드 쪽마루형'
      }
    ],
    features: [
      {
        icon: '🎨',
        title: '리얼한 소재 구현력',
        desc: '천연 콘크리트, 대리석, 직조 카펫, 원목의 고유한 텍스처와 미세한 결을 입체적으로 재현합니다.'
      },
      {
        icon: '📐',
        title: '다양한 컬러와 70여 종 패턴',
        desc: '모던 솔리드부터 인더스트리얼 석재까지 공간 테마에 맞춘 폭넓은 맞춤형 디자인을 제공합니다.'
      },
      {
        icon: '🏢',
        title: '공간에 맞는 폭넓은 라인업',
        desc: '600각 대형 사각, 457.2각 표준 사각, 우드 쪽마루 등 공간 면적에 최적화된 규격 선택이 가능합니다.'
      },
      {
        icon: '💼',
        title: '상업시설 특화 고내구성',
        desc: '사무실, 카페, 매장 등 유동인구가 많은 상업공간의 중보행 조건을 견디는 뛰어난 내마모성을 제공합니다.'
      }
    ],
    layerStructure: {
      totalLayers: 5,
      diagramImage: '/images/materials/dongshin_scenes/structure_arttile_layers.webp',
      layers: [
        { step: 'Layer 1', name: '표면처리층 (UV Coating)', desc: '스크래치와 오염에 강한 고경도 UV 특수 코팅층' },
        { step: 'Layer 2', name: '보호필름층 (Wear Layer)', desc: '유동인구 보행에 의한 마모를 방지하는 고투명 내마모 보호 필름층' },
        { step: 'Layer 3', name: '디자인층 (Printed Layer)', desc: '콘크리트, 마블, 카펫, 우드의 정밀 질감을 사실감 있게 연출하는 고해상도 인쇄층' },
        { step: 'Layer 4', name: '하지 (Base Layer)', desc: '상업공간 중보행 하중을 견고하게 지지하는 고강도 지지층' },
        { step: 'Layer 5', name: '바란스 (Balance Sheet)', desc: '바닥 접착제와의 결합력을 향상시키고 평활도를 유지하는 하부 밸런스층' }
      ]
    },
    adhesiveGuide: {
      type: 'standard',
      name: 'W-320E / W-300S (아크릴계) 또는 T-10 (우레탄계)',
      spreadRate: '300 ~ 330g/㎡',
      tool: '지정 고무헤라 (홈 2.5mm × 너비 3mm × 높이 2mm)',
      openTime: '약 15분 (손가락에 묻지 않고 끈적임이 형성되는 Tack 상태)',
      potLife: '약 70분 이내 부착 완료',
      temp: '상온 16 ~ 28℃ 유지 (10℃ 이하 저온 시공 절대 금지)',
      rollerPress: '50kg 핸들 롤러로 전면 충분히 압착',
      adhesivesList: [
        {
          name: 'W-320E',
          category: '아크릴계 수성 접착제',
          pack: '10kg / 14kg / 20kg',
          usage: '일반 상업 및 상온 바닥 환경, 친환경 표준 시공용'
        },
        {
          name: 'W-300S',
          category: '조강용 아크릴계 접착제',
          pack: '10kg / 20kg',
          usage: '동절기 저온 환경 또는 초기 빠른 보행 고착이 필요한 현장'
        },
        {
          name: 'T-10',
          category: '폴리우레탄계 2액형 접착제',
          pack: '10kg (주제+경화제)',
          usage: '내수성이 요구되거나 중보행 고하중이 가해지는 상업시설 바닥'
        }
      ],
      notice: '※ 시공 전 바닥 수분 함유율 4.5% 이하를 필히 확인하시고, 지정 고무헤라를 사용하여 표준 도포량(300~330g/㎡)을 균일하게 도포하십시오.'
    },
    roomScenes: resolveDongshinRoomScenes(item, normCode, 'arttile')
  };
}

/**
 * Common Manufacturer Precautions (PDF pp. 34~35)
 */
export const DONGSHIN_COMMON_PRECAUTIONS = {
  preCheck: [
    { title: '시공 전 제품 파손 및 변형 확인', desc: '자재 인수 즉시 박스 개봉 후 모서리 파손, 휨, 표면 스크래치 유무를 육안 검수합니다.' },
    { title: '제품코드 및 LOT 번호 전수 확인', desc: '동일 공간에는 반드시 동일한 색상 및 LOT 번호 제품만 사용해야 이색을 방지할 수 있습니다.' },
    { title: '바닥 평활도 및 균열 확인', desc: '바닥 요철은 3m 당 3mm 이하로 유지되어야 하며, 균열 및 파인 곳은 전용 보수 몰탈로 메워야 합니다.' },
    { title: '먼지·기름·수분·이물질 완전 제거', desc: '바탕면의 페인트 잔여물, 기름때, 왁스, 모래 등을 완벽히 청소하여 접착 불량을 예방합니다.' },
    { title: '바닥 절대습도 4.5% 이하 확인', desc: '콘크리트 바닥의 수분 함유율이 4.5% 이하로 완전히 건조된 상태에서만 시공을 진행합니다.' },
    { title: '바닥재와 시공 장소의 상온 적응 (Acclimation)', desc: '자재를 시공 최소 2일(48시간) 전부터 현장 실내 온도(18~22℃)에 적응시켜 온도 충격을 방지합니다.' },
    { title: '난방 시설 사전 가동 및 3시간 전 중단', desc: '난방 공간은 시공 7~14일 전부터 난방을 실시해 바닥 수분을 배출하고, 시공 약 3시간 전 난방을 중단합니다.' },
    { title: '직사광선에 따른 변형 및 변색 방지', desc: '시공 중 창가 직사광선이 내리쬐는 곳은 블라인드나 커튼으로 차단하여 급격한 열팽창을 막습니다.' }
  ],
  warnings: [
    {
      type: 'danger',
      title: '바닥 수분 잔류 시 시공 금지',
      desc: '바닥 절대습도가 4.5%를 초과하는 신축 콘크리트 및 미건조 바닥에 시공 시 증기압으로 인해 자재 들뜸 및 변형 하자가 발생합니다.'
    },
    {
      type: 'danger',
      title: '심한 균열이나 요철 방치 금지',
      desc: '바닥 평탄화 작업을 생략하고 불량 바닥 위에 그대로 시공할 경우 시간이 지나면서 타일 표면으로 균열과 굴곡이 그대로 드러납니다.'
    },
    {
      type: 'warn',
      title: '접착제와 바닥재 비호환 사용 금지',
      desc: '아트에코차음 5.0T에는 전용 CT-100A(120~150g/㎡)를 사용해야 하며, 일반 타일 본드를 임의 적용하거나 과다 도포하지 마십시오.'
    },
    {
      type: 'warn',
      title: '급격한 난방 온도 변경 금지',
      desc: '시공 직후 난방 온도를 급격히 올리면 접착제 양생 불량 및 자재 수축이 발생하므로 서서히 2~3℃씩 단계적으로 승온하십시오.'
    },
    {
      type: 'warn',
      title: '서로 다른 LOT 번호 혼합 시공 금지',
      desc: '미세한 톤 차이로 인해 시공 후 이색이 발생할 수 있으므로 동일한 시공 면적에는 반드시 동일 LOT 자재를 배치하십시오.'
    }
  ],
  duringInstallation: [
    { step: '01', title: '기준선 설정 및 가배열', desc: '실내 중심점을 기준으로 십자 먹줄을 놓고 타일을 가배열하여 벽면 가장자리 절단 폭이 최소 1/3 이상 남도록 조정합니다.' },
    { step: '02', title: '지정 접착제 적정량 도포', desc: '제품군별 전용 접착제를 헤라(일반) 또는 롤러(차음)를 사용하여 규정 도포량에 맞추어 균일하게 펴 바릅니다.' },
    { step: '03', title: '오픈타임 및 가사시간 준수', desc: '도포 후 약 15분간 오픈타임을 가져 손에 묻어나지 않는 Tack 상태를 확인한 후, 가사시간(70분) 내에 타일을 부착합니다.' },
    { step: '04', title: '타일 뒷면 방향 화살표 확인', desc: '타일 뒷면에 인쇄된 화살표 방향을 확인하여 일정한 방향(또는 패턴 지정 방식)으로 순차 시공합니다.' },
    { step: '05', title: '50kg 롤러로 전면 압착', desc: '타일 부착 즉시 50kg 핸들 롤러를 이용해 중앙에서 바깥쪽으로 밀어 기포를 완전히 빼내고 밀착시킵니다.' },
    { step: '06', title: '표면 접착제 즉시 제거', desc: '시공 중 타일 표면에 묻은 접착제는 경화되기 전 즉시 깨끗한 물걸레나 전용 용제로 닦아냅니다.' }
  ],
  postMaintenance: [
    { title: '시공 후 48시간 적정 실온 유지', desc: '시공 후 48시간 동안은 실내 온도 18~22℃를 안정적으로 유지하여 접착제가 완전히 경화되도록 합니다.' },
    { title: '24시간 초기 보행 및 중량물 제한', desc: '시공 후 최소 24시간 동안은 보행을 제한하며, 피아노·냉장고 등 고하중 물품 이동 시 바닥 보호판을 깔아야 합니다.' },
    { title: '주기적인 왁스 코팅 관리', desc: '상업공간 및 보행이 잦은 장소는 내구성 증진과 스크래치 방지를 위해 전용 왁스로 정기적인 코팅 관리를 권장합니다.' },
    { title: '이음새 물 침투 및 강한 용제 금지', desc: '타일 이음매 사이로 다량의 물이 고이지 않도록 즉시 닦아내며, 락스나 강산성 세제, 시너 등 화학 용제 사용을 금합니다.' },
    { title: '가구 다리 보호 패드 부착', desc: '의자나 테이블 다리 하단에 펠트 보호 패드를 부착하여 바닥재 표면의 긁힘과 찍힘을 예방하십시오.' }
  ],
  disclaimer: '본 시공 안내는 동신포리마 제조사 카탈로그 기준입니다. 실제 현장 조건에 따라 시공방법과 접착제 선정이 달라질 수 있으며, 시공 전 최신 제조사 시방서를 확인하시기 바랍니다.'
};
