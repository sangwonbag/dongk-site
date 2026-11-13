/**
 * 재영 Jflor 데코타일 상세페이지 전용 유틸리티 및 카탈로그 데이터
 * 기준: 재영 Jflor 2019 FLOORING COLLECTION (LVT pp. 22~24)
 */

export const JAEYOUNG_DECOTILE_GROUPS = {
  WOOD: 'wood',
  HOME_WOOD: 'homewood',
  SQUARE: 'square',
  SQUARE_600: '600square',
  ACOUSTIC_WOOD: 'acoustic_wood',
  ACOUSTIC_SQUARE: 'acoustic_square'
};

/**
 * 재영 데코타일 제품인지 판별
 */
export function isJaeyoungDecoProduct(item) {
  if (!item) return false;
  const brand = (item.brand || '').trim().toLowerCase();
  const category = (item.category || '').trim();
  const id = (item.id || '').toLowerCase();
  const name = (item.name || '').toLowerCase();

  const isBrandJaeyoung = brand === '재영' || brand.includes('재영') || brand.includes('jflor') || brand.includes('j-floor');
  const isCategoryDeco = category === '데코타일' || id.startsWith('데코타일-재영-') || name.includes('데코타일');

  return (isBrandJaeyoung && isCategoryDeco) || id.startsWith('데코타일-재영-');
}

/**
 * 라인업 및 그룹 분류
 */
export function getJaeyoungGroup(item) {
  const line = (item.line || '').toLowerCase();
  const subLine = (item.subLine || '').toLowerCase();
  const code = (item.code || item.product_code || '').toUpperCase();
  const id = (item.id || '').toLowerCase();

  if (line.includes('홈우드') || subLine.includes('홈우드') || id.includes('홈우드') || (code.startsWith('P3') && code.length === 5)) {
    return JAEYOUNG_DECOTILE_GROUPS.HOME_WOOD;
  }
  if (line.includes('차음') || id.includes('차음')) {
    if (line.includes('우드') || id.includes('우드') || code.startsWith('P')) {
      return JAEYOUNG_DECOTILE_GROUPS.ACOUSTIC_WOOD;
    }
    return JAEYOUNG_DECOTILE_GROUPS.ACOUSTIC_SQUARE;
  }
  if (line.includes('600') || subLine.includes('600') || id.includes('600') || (item.specs?.size && item.specs.size.includes('600'))) {
    return JAEYOUNG_DECOTILE_GROUPS.SQUARE_600;
  }
  if (line.includes('사각') || id.includes('사각') || code.startsWith('T')) {
    return JAEYOUNG_DECOTILE_GROUPS.SQUARE;
  }
  // 기본 우드
  return JAEYOUNG_DECOTILE_GROUPS.WOOD;
}

/**
 * 라인업별 규격 안내표 데이터
 */
export const JAEYOUNG_LINEUP_SPECS = [
  {
    group: JAEYOUNG_DECOTILE_GROUPS.WOOD,
    lineupName: 'Wood (우드)',
    thickness: '3.0T',
    size: '180 × 920mm',
    pcs: '20장',
    area: '3.312㎡ (약 1평)',
    method: 'Dry Back (접착식)',
    note: '우드·세미와일드·모던·내츄럴'
  },
  {
    group: JAEYOUNG_DECOTILE_GROUPS.HOME_WOOD,
    lineupName: 'Home Wood (홈우드)',
    thickness: '3.0T / 4.0T 확인',
    size: '180 × 920mm',
    pcs: '20장',
    area: '3.312㎡ (약 1평)',
    method: 'Dry Back (온돌 환경 보강형)',
    note: '치수 안정성 보강 특수 설계'
  },
  {
    group: JAEYOUNG_DECOTILE_GROUPS.SQUARE,
    lineupName: 'Square (457.2각)',
    thickness: '3.0T',
    size: '457.2 × 457.2mm',
    pcs: '16장',
    area: '약 3.34㎡ (약 1평)',
    method: 'Dry Back (접착식)',
    note: '마블·콘크리트·카펫·그래니트'
  },
  {
    group: JAEYOUNG_DECOTILE_GROUPS.SQUARE_600,
    lineupName: '600 Square (600각)',
    thickness: '3.0T',
    size: '600 × 600mm',
    pcs: '9장',
    area: '3.24㎡ (약 0.98평)',
    method: 'Dry Back (접착식)',
    note: '슬레이트·대형 석재 패턴'
  }
];

/**
 * 제품별 상세 정보 계산
 */
export function getJaeyoungDetailInfo(item) {
  if (!item) return null;
  const group = getJaeyoungGroup(item);
  const code = (item.code || item.product_code || '').toUpperCase();
  const subLine = item.subLine || item.line || '';

  let groupName = '재영 Jflor 데코타일';
  let lineup = 'Wood';
  let size = '180 × 920mm';
  let thickness = item.thickness || '3.0T';
  let pcs_per_box = '20장';
  let packing = '20pcs / Box';
  let area = '3.312㎡ (약 1평)';
  let designType = '우드 (Wood)';
  let method = 'Dry Back (접착식)';
  let structureImg = '/images/Thumbnail_Image/materials/데코타일/재영/catalog_assets/structure_wood.png';
  let sceneImg = '/images/Thumbnail_Image/materials/데코타일/재영/catalog_assets/catalog_scene_wood_homewood.png';

  switch (group) {
    case JAEYOUNG_DECOTILE_GROUPS.HOME_WOOD:
      groupName = '재영 Jflor 홈우드 (Home Wood)';
      lineup = 'Home Wood (홈우드)';
      size = '180 × 920mm';
      thickness = item.thickness || '3.0T';
      pcs_per_box = '20장';
      packing = '20pcs / Box';
      area = '3.312㎡ (약 1평)';
      designType = '주거용 온돌 우드 (Home Wood)';
      method = 'Dry Back (온돌 환경 보강형)';
      structureImg = '/images/Thumbnail_Image/materials/데코타일/재영/catalog_assets/structure_homewood.png';
      sceneImg = '/images/Thumbnail_Image/materials/데코타일/재영/catalog_assets/catalog_scene_wood_homewood.png';
      break;

    case JAEYOUNG_DECOTILE_GROUPS.SQUARE_600:
      groupName = '재영 Jflor 600각 (600 Square)';
      lineup = '600 Square (600각)';
      size = '600 × 600mm';
      thickness = item.thickness || '3.0T';
      pcs_per_box = '9장';
      packing = '9pcs / Box';
      area = '3.24㎡ (약 0.98평)';
      designType = subLine.includes('슬레이트') ? '슬레이트 석재 (Slate Stone)' : '대형 사각 석재 (Large Square)';
      method = 'Dry Back (접착식)';
      structureImg = '/images/Thumbnail_Image/materials/데코타일/재영/catalog_assets/structure_600square.png';
      sceneImg = '/images/Thumbnail_Image/materials/데코타일/재영/catalog_assets/catalog_scene_square.png';
      break;

    case JAEYOUNG_DECOTILE_GROUPS.SQUARE:
      groupName = '재영 Jflor 사각 (Square)';
      lineup = 'Square (457.2각)';
      size = '457.2 × 457.2mm';
      thickness = item.thickness || '3.0T';
      pcs_per_box = '16장';
      packing = '16pcs / Box';
      area = '약 3.34㎡ (약 1.01평)';
      if (subLine.includes('마블')) designType = '마블 대리석 (Marble)';
      else if (subLine.includes('콘크리트')) designType = '콘크리트 (Concrete)';
      else if (subLine.includes('카펫')) designType = '패브릭 카펫 (Carpet)';
      else if (subLine.includes('그래니트')) designType = '그래니트 화강암 (Granite)';
      else designType = '사각 스톤 (Square Stone)';
      method = 'Dry Back (접착식)';
      structureImg = '/images/Thumbnail_Image/materials/데코타일/재영/catalog_assets/structure_square.png';
      sceneImg = '/images/Thumbnail_Image/materials/데코타일/재영/catalog_assets/catalog_scene_square.png';
      break;

    case JAEYOUNG_DECOTILE_GROUPS.ACOUSTIC_WOOD:
      groupName = '재영 Jflor 차음 우드';
      lineup = '차음 우드 (Acoustic Wood)';
      size = '180 × 920mm';
      thickness = item.thickness || '4.0T 확인 필요';
      pcs_per_box = '20장';
      packing = '20pcs / Box';
      area = '3.312㎡ (약 1평)';
      designType = '고기능 차음 우드 (Acoustic Wood)';
      method = 'Loose Lay / Dry Back (사전 확인 필요)';
      structureImg = '/images/Thumbnail_Image/materials/데코타일/재영/catalog_assets/structure_wood.png';
      break;

    case JAEYOUNG_DECOTILE_GROUPS.ACOUSTIC_SQUARE:
      groupName = '재영 Jflor 차음 사각';
      lineup = '차음 사각 (Acoustic Square)';
      size = '457.2 × 457.2mm';
      thickness = item.thickness || '4.0T 확인 필요';
      pcs_per_box = '16장';
      packing = '16pcs / Box';
      area = '약 3.34㎡ (약 1.01평)';
      designType = '고기능 차음 사각 (Acoustic Square)';
      method = 'Loose Lay / Dry Back (사전 확인 필요)';
      structureImg = '/images/Thumbnail_Image/materials/데코타일/재영/catalog_assets/structure_square.png';
      break;

    default: // WOOD
      groupName = '재영 Jflor 우드 (Wood)';
      lineup = 'Wood (우드)';
      size = '180 × 920mm';
      thickness = item.thickness || '3.0T';
      pcs_per_box = '20장';
      packing = '20pcs / Box';
      area = '3.312㎡ (약 1평)';
      if (subLine.includes('세미와일드')) designType = '세미와일드 우드 (Semi-Wild Wood)';
      else if (subLine.includes('내츄럴')) designType = '내츄럴 우드 (Natural Wood)';
      else if (subLine.includes('모던')) designType = '모던 우드 (Modern Wood)';
      else if (subLine.includes('베이직')) designType = '베이직 우드 (Basic Wood)';
      else designType = '우드 플랭크 (Wood Plank)';
      method = 'Dry Back (접착식)';
      structureImg = '/images/Thumbnail_Image/materials/데코타일/재영/catalog_assets/structure_wood.png';
      sceneImg = '/images/Thumbnail_Image/materials/데코타일/재영/catalog_assets/catalog_scene_wood_homewood.png';
      break;
  }

  // 층별 구조 설명 (카탈로그 공식 LVT Structure 기준)
  const isHomeWood = group === JAEYOUNG_DECOTILE_GROUPS.HOME_WOOD;
  const layers = [
    {
      layer: 'Layer 1',
      title: '특수 표면 처리 코팅층 (Special UV / Surface Coating)',
      desc: '일상적인 스크래치 및 오염 침투를 억제하여 바닥재의 청소와 일상 관리를 편리하게 돕는 보호층입니다.'
    },
    {
      layer: 'Layer 2',
      title: '고투명 내마모층 (Clear Transparent Wear Layer)',
      desc: '보행 빈도가 높은 공간에서도 하부 인쇄 무늬를 오랫동안 보호하고 내구성을 유지해 주는 투명 마모층입니다.'
    },
    {
      layer: 'Layer 3',
      title: '고해상도 자연 디자인층 (High Definition Print Layer)',
      desc: isHomeWood || group === JAEYOUNG_DECOTILE_GROUPS.WOOD
        ? '천연 원목의 나뭇결과 옹이의 입체감을 자연스럽고 풍부하게 구현한 프리미엄 인쇄층입니다.'
        : '대리석, 콘크리트, 카펫, 석재 고유의 깊이 있는 질감과 색채를 사실적으로 재현한 고해상도 디자인층입니다.'
    },
    {
      layer: 'Layer 4',
      title: isHomeWood
        ? '치수 안정 보강 코어층 (Dimension Stabilizer Layer)'
        : '안정 지지 중간층 (Middle Base Layer)',
      desc: isHomeWood
        ? '온돌 난방 환경을 고려하여 특수 설계된 층으로, 열에 의한 수축 및 팽창을 최소화하도록 보강되었습니다.'
        : '보행 충격을 흡수하고 상부 디자인층을 균일하게 지지하는 중간 베이스층입니다.'
    },
    {
      layer: 'Layer 5',
      title: '하부 밸런스 백킹층 (Balance Bottom Backing Layer)',
      desc: '바닥 바탕면 접착제와의 결합력을 높이고 타일 전체의 평활도와 치수 안정성을 유지하는 최하부 밸런스층입니다.'
    }
  ];

  // 특장점 카드 4종
  const features = [
    {
      title: '다양한 자연 질감 디자인',
      desc: '우드, 석재, 콘크리트 등 자연 소재를 사실적으로 표현한 디자인으로 주거 및 상업 실내 공간에 폭넓게 활용할 수 있습니다.'
    },
    {
      title: '표면 관리 편의성',
      desc: '카탈로그에서 안내하는 표면 처리 기술을 기반으로 오염을 방지하고 일상적인 유지관리가 편리하도록 구성된 바닥재입니다.'
    },
    {
      title: '공간에 맞는 제품 선택',
      desc: 'Wood, Home Wood, 457.2 Square, 600 Square 등 공간의 용도와 인테리어 컨셉에 맞추어 최적의 규격을 선택할 수 있습니다.'
    },
    {
      title: '우수한 시공성 및 경제성',
      desc: '재영 Jflor 공식 카탈로그 기준 우수한 시공 편의성과 합리적인 경제성을 갖춘 LVT 바닥재 라인업입니다.'
    }
  ];

  // 공간 적용 예시
  const isWoodType = group === JAEYOUNG_DECOTILE_GROUPS.WOOD || group === JAEYOUNG_DECOTILE_GROUPS.HOME_WOOD || group === JAEYOUNG_DECOTILE_GROUPS.ACOUSTIC_WOOD;
  const spaces = isWoodType
    ? [
        { title: '거실 적용 예시', desc: '아늑하고 자연스러운 원목 질감으로 편안한 주거 공간 연출', tag: '주거 / 거실' },
        { title: '침실 적용 예시', desc: '정갈하고 따뜻한 색감으로 안정감을 주는 침실 인테리어', tag: '주거 / 침실' },
        { title: '사무실 적용 예시', desc: '세련되고 차분한 우드 톤으로 완성하는 업무 공간', tag: '오피스 / 서재' }
      ]
    : [
        { title: '상업공간 적용 예시', desc: '모던한 스톤·콘크리트 질감으로 고급스러운 매장 연출', tag: '상업 / 쇼룸' },
        { title: '사무실 적용 예시', desc: '대형 타일의 시원한 개방감과 세련된 오피스 환경 구성', tag: '업무 / 오피스' },
        { title: '카페 및 매장 적용 예시', desc: '트렌디한 대리석·슬레이트 패턴의 감각적인 상업 인테리어', tag: '상업 / 카페' }
      ];

  return {
    group,
    groupName,
    lineup,
    productName: item.name || `재영 Jflor ${lineup} ${code}`,
    productCode: code,
    spec: {
      brand: '재영 / Jflor',
      lineup,
      thickness,
      size,
      pcs_per_box,
      packing,
      area,
      designType,
      materialType: 'LVT 데코타일 (Luxury Vinyl Tile)',
      method,
      adhesive: '재영 권장 친환경 데코타일 전용 접착제 (공식 시방 확인 필요)',
      source: '재영 Jflor 2019 카탈로그 기준'
    },
    structureImg,
    sceneImg,
    layers,
    features,
    spaces,
    comparisonTable: JAEYOUNG_LINEUP_SPECS
  };
}

/**
 * 시공 전 유의사항 7종
 */
export const JAEYOUNG_PRECAUTIONS = [
  {
    num: '01',
    title: '제품 및 시공 방식 확인',
    desc: '시공 전 주문하신 제품코드, 두께, 가로세로 규격 및 시공 방식(Dry Back 등)이 발주 내역과 일치하는지 확인합니다.'
  },
  {
    num: '02',
    title: '시공 바탕면 상태 확인',
    desc: '바닥면의 평활도, 습기, 크랙, 유분 및 이물질 상태를 사전에 점검하고 필요한 바탕면 청소 및 보수 처리를 진행합니다.'
  },
  {
    num: '03',
    title: '접착제 및 부자재 확인',
    desc: '해당 제품군에 적합한 친환경 데코타일 전용 접착제와 부자재를 제조사 시방 지침에 맞추어 선택하여 시공합니다.'
  },
  {
    num: '04',
    title: '시공 전 색상 및 패턴 확인',
    desc: '박스별 로트(Lot) 번호를 확인하고, 타일 이음매의 자연스러운 무늬 연결을 위해 시공 전 가배열 후 시공을 시작합니다.'
  },
  {
    num: '05',
    title: '제품별 시공 환경 조건 확인',
    desc: '시공 현장의 실내 적정 온도를 유지하고, 시공 24시간 전 현장에 자재를 입고하여 현장 환경에 적응시킨 후 시공합니다.'
  },
  {
    num: '06',
    title: '온돌 및 바닥 난방 환경 확인',
    desc: '바닥 난방이 적용되는 현장에서는 사전에 난방을 가동해 습기를 배출하고, 시공 전후 권장 온도 기준을 반드시 준수합니다.'
  },
  {
    num: '07',
    title: '시공 후 양생 및 관리',
    desc: '접착제가 충분히 양생될 때까지 무거운 하중 이동을 피하고, 일상 청소 시 물기를 최소화하여 바닥재를 안전하게 관리합니다.'
  }
];

