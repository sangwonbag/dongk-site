/**
 * LX하우시스 2025 공식 카탈로그 4종 통합 데이터 모델
 * 1. 프레스티지 (PRESTG) 5.0T - 14종
 * 2. 하우스스타일 (House Style) 3.0T - 13종
 * 3. 보타닉 (BOTANIC) 3.0T - 38종
 * 4. 에디톤 스톤 (EDITONE STONE) 5.0T - 15종
 * 총 80종 완벽 지원
 */

// 1. 프레스티지 (PRESTG) 5.0T 메타데이터
export const LX_PRESTIGE_CONFIG = {
  lineupKey: 'PRESTIGE',
  brand: 'LX하우시스',
  brandEn: 'LX Hausys',
  lineupName: '프레스티지 (PRESTG)',
  catalogTitle: '2025 LX하우시스 프레스티지 카탈로그',
  thickness: '5.0T',
  thicknessMm: 5.0,
  category: '데코타일',
  materialType: 'LVT (Luxury Vinyl Tile) 프리미엄 고두께 바닥재',
  recommendedAdhesive: 'LX 권장 데코타일 전용 친환경 접착제',

  // 라인업 전체 규격 안내표
  specsComparison: [
    {
      type: '스톤 600각',
      thickness: '5.0T',
      size: '600 × 600mm',
      pcsPerBox: 5,
      areaPerBox: '1.80㎡',
      pyeongPerBox: '약 0.54평',
      desc: '공간에 웅장한 확장감을 선사하는 대형 600각 스톤 디자인 (8종)'
    },
    {
      type: '스톤 직사각',
      thickness: '5.0T',
      size: '457.2 × 914.4mm',
      pcsPerBox: 5,
      areaPerBox: '2.09㎡',
      pyeongPerBox: '약 0.63평',
      desc: '동조엠보(EIR)가 적용된 유니크한 대형 직사각 스톤 디자인 (2종)'
    },
    {
      type: '우드',
      thickness: '5.0T',
      size: '228.6 × 1523mm',
      pcsPerBox: 6,
      areaPerBox: '2.09㎡',
      pyeongPerBox: '약 0.63평',
      desc: '원목 마루의 웅장한 비례감과 EIR 질감을 구현한 와이드 롱 우드 (4종)'
    }
  ],

  // 6계층 구조
  layers: [
    {
      step: 'Layer 1',
      name: '고강도 표면처리층 (Metal Shield)',
      desc: '특수 고강도 코팅 기술(Metal Shield)을 적용하여 일상 스크래치와 마모 저항성을 극대화합니다.'
    },
    {
      step: 'Layer 2',
      name: '고내구성 EIR 표면층',
      desc: '표면 질감과 무늬를 일치시키는 동조엠보(EIR) 기술로 천연 소재의 촉감을 입체적으로 재현합니다.'
    },
    {
      step: 'Layer 3',
      name: '고해상도 디자인층',
      desc: '정밀 인쇄 공법으로 천연 석재와 원목 고유의 깊이 있는 컬러와 질감을 섬세하게 표현합니다.'
    },
    {
      step: 'Layer 4',
      name: '전사방지층',
      desc: '바닥면의 미세한 요철이나 굴곡이 제품 표면으로 올라오는 전사 현상을 억제합니다.'
    },
    {
      step: 'Layer 5',
      name: 'Base층 (5.0T Core)',
      desc: '5.0mm 고두께 코어로 우수한 보행감과 묵직한 안정감, 내구성을 보장합니다.'
    },
    {
      step: 'Layer 6',
      name: '전사방지 / Balance층',
      desc: '바닥 접착제 성분으로 인한 변색을 차단하고 수축·팽창 치수 안정성을 유지합니다.'
    }
  ],

  // 제품 특장점
  features: [
    {
      icon: '🛡️',
      title: 'Metal Shield 고강도 표면 코팅',
      desc: '스크래치 저항성을 획기적으로 개선한 제조사 표면 특화 기술 적용 (내스크래치성 연구소 자체 시험 B1 등급 조건 충족).'
    },
    {
      icon: '🧱',
      title: '바닥 전사방지 기술 (이염·굴곡 차단)',
      desc: '하부 전사방지층과 밸런스층이 바닥면 요철과 접착제 성분으로 인한 표면 드러남 및 변색을 철저히 차단합니다.'
    },
    {
      icon: '🎨',
      title: '초정밀 고해상도 디자인 인쇄',
      desc: '천연 대리석, 콘크리트, 원목 소재 본연의 무늬와 색감을 사실감 있고 우아하게 표현합니다.'
    },
    {
      icon: '🪵',
      title: '와이드 규격 우드 디자인 (228.6×1523mm)',
      desc: '일반 데코타일 대비 압도적인 1.5m 롱 와이드 규격으로 원목 마루를 능가하는 개방감을 선사합니다.'
    },
    {
      icon: '✨',
      title: 'EIR 동조엠보 (Embossed in Register)',
      desc: '인쇄 무늬와 표면 엠보싱 텍스처를 1:1로 정확하게 일치시켜 손끝에 닿는 촉감까지 사실적으로 구현했습니다.'
    },
    {
      icon: '📐',
      title: '5.0T 고두께의 뛰어난 보행감',
      desc: '상업시설, 고급 오피스, 프리미엄 주거공간에 적합한 5.0mm 두께로 소음 완화 및 안정적인 밟힘성을 제공합니다.'
    }
  ],

  // 시공 전 유의사항
  guidelines: [
    {
      num: 1,
      title: '제품코드 및 두께·규격 사전 확인',
      desc: '프레스티지 5T는 일반 3T 타일과 두께 및 박스 포장 면적이 다르므로 시공 전 자재 라벨과 실측 면적을 대조하십시오.'
    },
    {
      num: 2,
      title: '동일 공간 내 동일 LOT 번호 사용',
      desc: '동일한 디자인 코드라도 생산 배치(LOT)에 따라 미세한 톤 차이가 발생할 수 있으므로 반드시 동일 LOT로 연속 시공하십시오.'
    },
    {
      num: 3,
      title: '바탕면 평활도 및 습기 점검',
      desc: '바닥면 수분 함수율 5% 이하 건조 상태를 확인하고, 굴곡이나 균열 부위는 보수 몰탈로 평탄화 후 시공하십시오.'
    },
    {
      num: 4,
      title: '제조사 권장 전용 접착제 정량 도포',
      desc: 'LVT 전용 친환경 데코타일 접착제를 적정 오픈타임(Open Time)을 준수하여 균일하게 도포 후 압착 시공합니다.'
    },
    {
      num: 5,
      title: '실물 샘플 확인 필수',
      desc: '모니터 해상도 및 조명 환경에 따라 색상이 다르게 보일 수 있으므로 시공 전 반드시 실물 샘플을 확인하십시오.'
    }
  ]
};

// 2. 하우스스타일 (House Style) 3.0T 메타데이터
export const LX_HOUSE_STYLE_CONFIG = {
  lineupKey: 'HOUSE_STYLE',
  brand: 'LX하우시스',
  brandEn: 'LX Hausys',
  lineupName: '하우스스타일 (House Style)',
  catalogTitle: '2025 LX하우시스 하우스스타일 카탈로그',
  thickness: '3.0T',
  thicknessMm: 3.0,
  category: '데코타일',
  materialType: '주거·상업 온돌 복합 고기능성 LVT 바닥재',
  recommendedAdhesive: '하우스풀 (LX하우시스 지정 전용 접착제)',

  // 필수 경고문
  mandatoryWarning: {
    badge: '제조사 필수 시공지침',
    strongText: '하우스스타일은 제조사 지정 전용 접착제인 [하우스풀]을 사용하여 시공해야 합니다.',
    desc: '바탕면 상태와 바닥난방 환경에 따라 제조사 시공지침을 반드시 확인하십시오. 1-DAY 덧시공은 특정 작업 조건의 사례이며 모든 현장에 일괄 보장되는 시간이 아닙니다.'
  },

  // 라인업 전체 규격 안내표
  specsComparison: [
    {
      type: '스톤 (ZOT)',
      thickness: '3.0T',
      size: '600 × 600mm',
      pcsPerBox: 9,
      areaPerBox: '3.24㎡',
      pyeongPerBox: '약 0.98평',
      desc: '모던한 스톤·콘크리트 질감의 대형 정사각 타일 (7종)'
    },
    {
      type: '우드 (ZOW)',
      thickness: '3.0T',
      size: '150 × 1200mm',
      pcsPerBox: 18,
      areaPerBox: '3.24㎡',
      pyeongPerBox: '약 0.98평',
      desc: '연속동조엠보가 적용된 프리미엄 와이드 플랭크 우드 (6종)'
    }
  ],

  // 5계층 구조
  layers: [
    {
      step: 'Layer 1',
      name: '표면처리층 (Special Surface Coating)',
      desc: '일상 생활 오염과 스크래치를 방지하고 청소 및 관리를 손쉽게 돕는 특수 표면 코팅'
    },
    {
      step: 'Layer 2',
      name: '보호 필름층 (Wear Layer)',
      desc: '우수한 내마모 필름층으로 장기간 보행에도 패턴 마모를 방지합니다.'
    },
    {
      step: 'Layer 3',
      name: '디자인층 + 연속동조엠보',
      desc: '정밀 나뭇결·석재 무늬 인쇄층과 자연스러운 입체감을 살리는 연속동조엠보 결합'
    },
    {
      step: 'Layer 4',
      name: '전사방지 Base층 (Core)',
      desc: '온돌 바닥 난방 열기에도 수축·팽창 및 들뜸을 제어하는 치수 안정 코어'
    },
    {
      step: 'Layer 5',
      name: 'Balance층 (하부 밸런스)',
      desc: '하우스풀 전용 접착제와 완벽한 밀착 결합을 형성하고 휨 현상을 억제합니다.'
    }
  ],

  // 제품 특장점
  features: [
    {
      icon: '✨',
      title: '연속동조엠보 기술',
      desc: '실제 원목 나뭇결 및 천연 석재 질감과 표면 엠보싱의 일치성을 획기적으로 높인 특화 기술입니다.'
    },
    {
      icon: '🪵',
      title: '와이드 우드 디자인 (150×1200mm)',
      desc: '150mm 폭과 1200mm 길이의 와이드 규격으로 자연스러운 천연 원목 마루의 시원한 공간감을 연출합니다.'
    },
    {
      icon: '🔨',
      title: '기존 마루 위 덧시공 가능 (조건부)',
      desc: '안정적으로 고정된 기존 합판마루·강마루 위에 철거 없이 시공할 수 있어 공사 소음과 기간을 단축합니다 (손상·부푼 바닥 제외).'
    },
    {
      icon: '🧪',
      title: '하우스풀 전용 접착제 시스템',
      desc: '바닥난방 환경에 최적화된 LX 공식 전용 접착제 하우스풀을 사용하여 열에 의한 수축·팽창 하자를 예방합니다.'
    },
    {
      icon: '💧',
      title: '우수한 내수성 및 유지관리 편의성',
      desc: '물과 습기에 강해 생활 방수가 뛰어나며 오염 물질이 침투하지 않아 관리가 편리합니다.'
    },
    {
      icon: '🔄',
      title: '손상 부위 부분 교체 용이',
      desc: '마루와 달리 국소 부위가 찍히거나 오염되었을 때 해당 타일만 간편하게 떼어내어 교체할 수 있습니다.'
    }
  ],

  // 시공 전 유의사항
  guidelines: [
    {
      num: 1,
      title: '지정 접착제 [하우스풀] 필수 사용',
      desc: '하우스스타일은 제조사 지정 온돌 전용 접착제인 하우스풀을 정량 도포하여 시공해야 열 수축 및 박리를 방지할 수 있습니다.'
    },
    {
      num: 2,
      title: '덧시공 전 바탕 바닥면 상태 검사',
      desc: '기존 바닥(합판/강마루)이 바닥면에 완전히 밀착·고정되어 있는지 확인하고 부풀거나 썩은 부위는 철거해야 합니다.'
    },
    {
      num: 3,
      title: '바닥난방 양생 및 온도 조건 준수',
      desc: '시공 전 바닥 난방을 24시간 전 차단하여 실온(18~25℃)을 유지하고, 시공 후에도 단계적으로 서서히 온도를 올려야 합니다.'
    },
    {
      num: 4,
      title: '동일 LOT 확인 및 패턴 방향성 확인',
      desc: '이색 방지를 위해 동일 공간에 동일 LOT 제품을 사용하고, 화살표 방향 및 나뭇결 흐름을 고려하여 배열하십시오.'
    },
    {
      num: 5,
      title: '실물 샘플 대조 후 최종 결정',
      desc: '모니터 및 카탈로그 인쇄 색상은 현장 조명 및 마감재 반사에 따라 차이가 있으므로 실물 샘플 확인을 권장합니다.'
    }
  ]
};

// 3. 보타닉 (BOTANIC) 3.0T 메타데이터
export const LX_BOTANIC_CONFIG = {
  lineupKey: 'BOTANIC',
  brand: 'LX하우시스',
  brandEn: 'LX Hausys',
  lineupName: '보타닉 (BOTANIC)',
  catalogTitle: '2025 LX하우시스 보타닉 카탈로그',
  thickness: '3.0T',
  thicknessMm: 3.0,
  category: '데코타일',
  materialType: '비주거용·비온돌용 상업공간 표준 LVT 바닥재',
  recommendedAdhesive: 'LX 권장 일반 상업용 데코타일 접착제',

  // 매우 중요한 시공 제한 경고문 (최우선 표시)
  prohibitionWarning: {
    badge: '★ 시공 제한 필수 경고',
    strongText: '본 제품은 비주거용·비온돌용 바닥재입니다. 바닥난방 공간에는 절대 시공하지 마십시오.',
    desc: '보타닉은 보일러 배관이 지나가는 주거용 온돌 바닥에 시공할 경우 열에 의한 수축, 변형, 들뜸이 발생할 수 있습니다. 상업시설, 오피스, 매장, 학원 등 비난방 공간에만 적용하십시오.'
  },

  // 라인업 전체 규격 안내표
  specsComparison: [
    {
      type: '600각 스톤 (DBT)',
      thickness: '3.0T',
      size: '600 × 600mm',
      pcsPerBox: 9,
      areaPerBox: '3.24㎡',
      pyeongPerBox: '약 0.98평',
      desc: '넓은 상업공간에 모던한 감각을 부여하는 대형 정사각 타일 (12종)'
    },
    {
      type: '450각 스톤 (DBT)',
      thickness: '3.0T',
      size: '450 × 450mm',
      pcsPerBox: 16,
      areaPerBox: '3.24㎡',
      pyeongPerBox: '약 0.98평',
      desc: '※ 457.2각이 아닌 정밀 450 × 450mm 표준 상업 규격 (16종)'
    },
    {
      type: '우드 플랭크 (DBW)',
      thickness: '3.0T',
      size: '180 × 920mm',
      pcsPerBox: 20,
      areaPerBox: '3.31㎡',
      pyeongPerBox: '약 1.00평',
      desc: '실용성과 내구성이 뛰어난 상업용 표준 우드 플랭크 (10종)'
    }
  ],

  // 5계층 구조
  layers: [
    {
      step: 'Layer 1',
      name: '표면 처리층 (PUR Coating)',
      desc: '상업시설 통행량에 견디는 표면 보호 코팅으로 일상 긁힘과 오염 방지'
    },
    {
      step: 'Layer 2',
      name: '보호 필름층 (Wear Layer)',
      desc: '고투명 내마모층으로 인쇄 패턴을 외부 마모로부터 견고하게 보호'
    },
    {
      step: 'Layer 3',
      name: '인쇄층 (Printed Design Layer)',
      desc: '트렌디한 콘크리트, 마블, 라임스톤 및 우드 패턴의 선명한 그래픽 표현'
    },
    {
      step: 'Layer 4',
      name: 'Base층 (Core Layer)',
      desc: '우수한 하중 지지력과 보행 충격을 분산시키는 상업용 고밀도 베이스층'
    },
    {
      step: 'Layer 5',
      name: 'Balance층 (Backing Layer)',
      desc: '바닥 접착제와 결합력을 높이고 타일의 평탄도를 유지하는 밸런스층'
    }
  ],

  // 제품 특장점
  features: [
    {
      icon: '💰',
      title: '실용적이고 경제적인 LVT 바닥재',
      desc: '우수한 내구성과 가성비를 겸비하여 상업시설 인테리어 비용을 합리적으로 절감합니다.'
    },
    {
      icon: '🏛️',
      title: '다양한 콘크리트·마블·라임스톤 디자인',
      desc: '모던 인더스트리얼부터 차분한 웜 그레이톤까지 다채로운 상업 트렌드 패턴을 갖추고 있습니다.'
    },
    {
      icon: '🏢',
      title: '일반 상업공간 최적화',
      desc: '사무실, 병원 대기실, 학원, 매장 등 유동인구가 많은 비주거 상업공간에 이상적입니다.'
    },
    {
      icon: '📏',
      title: '정밀 450각 & 600각 & 180 우드 라인업',
      desc: '공간 규모와 레이아웃에 맞춰 450각(450×450mm), 600각, 180×920mm 우드를 유연하게 선택할 수 있습니다.'
    },
    {
      icon: '🧹',
      title: '손쉬운 일상 유지관리',
      desc: '왁스코팅 및 정기적인 청소 관리가 용이하여 매장 위생과 청결 상태를 오래 유지합니다.'
    },
    {
      icon: '🚫',
      title: '비주거용·비온돌 전용 설계',
      desc: '바닥 난방이 없는 일반 상업 바닥 조건에 최적화된 원료 배합으로 시공 안정성을 높였습니다.'
    }
  ],

  // 시공 전 유의사항
  guidelines: [
    {
      num: 1,
      title: '바닥난방(온돌) 공간 시공 절대 금지',
      desc: '보타닉은 비온돌용 바닥재이므로 주거용 아파트/빌라 바닥난방 배관 위에는 절대 시공하지 마십시오.'
    },
    {
      num: 2,
      title: '450각 정밀 규격 확인 (450×450mm)',
      desc: '보타닉 450각의 정규 규격은 450 × 450mm(16장/3.24㎡)이며 타사 457.2각과 혼용할 수 없습니다.'
    },
    {
      num: 3,
      title: '바탕면 레이턴스 및 분진 제거',
      desc: '상업 바닥 콘크리트 표면의 레이턴스, 유분, 먼지를 완전히 청소하고 충분히 건조시킨 후 접착제를 도포하십시오.'
    },
    {
      num: 4,
      title: '동일 LOT 사용 및 격자/지그재그 배열',
      desc: '공간별 동일 LOT 번호를 사용하고 사각 타일은 화살표 방향을 확인하여 정방향 또는 교차 배열하십시오.'
    },
    {
      num: 5,
      title: '초기 양생 시간 준수 및 왁스코팅 권장',
      desc: '시공 후 최소 24~48시간 동안 보행을 제한하고, 통행량이 많은 상업 공간은 초기 왁스코팅 관리를 권장합니다.'
    }
  ]
};

// 4. 에디톤 스톤 (EDITONE STONE) 5.0T 메타데이터
export const LX_EDITONE_CONFIG = {
  lineupKey: 'EDITONE',
  brand: 'LX하우시스',
  brandEn: 'LX Hausys',
  lineupName: '에디톤 스톤 (EDITONE STONE)',
  catalogTitle: '2025 LX하우시스 에디톤 스톤 카탈로그',
  thickness: '5.0T',
  thicknessMm: 5.0,
  category: '데코타일',
  materialType: 'NSC (New Stone Composite) 프리미엄 대형 스톤 바닥재',
  recommendedAdhesive: '에디톤 전용 접착제 (에디톤 바닥재용 풀)',

  // 바닥재 / 벽장재 구분 안내
  floorWallNotice: {
    badge: '바닥재 전용 스펙 안내',
    strongText: '본 페이지는 [에디톤 스톤 바닥재 5.0T] 전용 기술 규격 및 시공 지침입니다.',
    desc: '에디톤 월(벽장재)의 규격, 타공, 벽체 부착 지침과 혼합되지 않도록 바닥재 전용 에디톤 풀 접착제와 지침을 확인하십시오.'
  },

  // 라인업 전체 규격 안내표
  specsComparison: [
    {
      type: '기본 대형 스톤 (450×900)',
      thickness: '5.0T',
      size: '450 × 900mm',
      pcsPerBox: 4,
      areaPerBox: '1.62㎡',
      pyeongPerBox: '약 0.49평',
      desc: '시원한 대면적 비례감으로 타일 매지선이 적고 공간이 넓어 보이는 메인 규격 (전 15종)'
    },
    {
      type: '정사각 600각 옵션 (일부 컬러)',
      thickness: '5.0T',
      size: '600 × 600mm',
      pcsPerBox: '별도 확인',
      areaPerBox: '별도 확인',
      pyeongPerBox: '상담 안내',
      desc: 'EDT7724, EDT7725, EDT7732, EDT7734 4개 컬러에 제공되는 추가 규격 옵션'
    }
  ],

  // 4계층 구조
  layers: [
    {
      step: 'Layer 1',
      name: '고내구 투명층 (High Durability Wear Layer)',
      desc: '스크래치와 찍힘에 극도로 강한 프리미엄 투명 보호층으로 표면 광택과 질감을 유지합니다.'
    },
    {
      step: 'Layer 2',
      name: '고해상 디자인층 (Digital Printed Layer)',
      desc: '초정밀 디지털 인쇄 공법으로 천연 대리석의 마블 베인과 석재 텍스처를 극사실적으로 표현합니다.'
    },
    {
      step: 'Layer 3',
      name: 'NSC 코어층 (New Stone Composite Core)',
      desc: '천연 석분과 친환경 수지를 결합한 NSC 신소재 코어로 수축·팽창이 거의 없고 열전도율이 우수합니다.'
    },
    {
      step: 'Layer 4',
      name: '전용 접착 시공층 (에디톤 전용 풀)',
      desc: '에디톤 바닥재 전용 접착제를 사용하여 바닥면과의 영구적인 밀착력과 난방 안정성을 보장합니다.'
    }
  ],

  // 제품 특장점
  features: [
    {
      icon: '🏛️',
      title: '감각적인 하이엔드 스톤 디자인',
      desc: '천연 석재 및 고급 테라조, 콘크리트 무늬를 이태리 타일 수준의 하이엔드 감성으로 완성했습니다.'
    },
    {
      icon: '📐',
      title: '대면적 규격 (450×900mm) 공간 확장감',
      desc: '압도적인 450×900mm 광폭 규격으로 이음매 매지선을 최소화하여 공간이 훨씬 넓고 깔끔해 보입니다.'
    },
    {
      icon: '🖨️',
      title: '초정밀 디지털 인쇄 패턴',
      desc: '자연스러운 석재 패턴 변화와 미세한 음영을 디지털 인쇄로 살려 반복 패턴감이 적고 자연스럽습니다.'
    },
    {
      icon: '🪨',
      title: '리얼 스톤·마블 표면 텍스처',
      desc: '손으로 만졌을 때 차갑지 않으면서도 실제 천연석의 고급스러운 촉감과 매트한 광택을 유지합니다.'
    },
    {
      icon: '🧪',
      title: '제조사 지정 전용 접착제 시공 안정성',
      desc: '바닥재용 에디톤 전용 풀을 통해 바닥 난방 환경에서도 들뜸이나 수축 없이 단단하게 고정됩니다.'
    },
    {
      icon: '🔥',
      title: '우수한 열전도율과 치수 안정성',
      desc: 'NSC 코어 구조로 난방 가동 시 따뜻함이 빠르게 전달되며 열에 의한 변형 저항력이 매우 뛰어납니다.'
    }
  ],

  // 시공 전 유의사항 (PDF 21p 바닥재 기준)
  guidelines: [
    {
      num: 1,
      title: '제조사 공식 에디톤 시공지침 준수',
      desc: '에디톤 바닥재는 일반 장판이나 강마루와 시공 방식이 다르므로 반드시 공식 시방서 절차를 준수해야 합니다.'
    },
    {
      num: 2,
      title: '동일 LOT 제품 사용 및 박스 수량 확인',
      desc: '450×900 규격 기준 1박스에 4장(1.62㎡)이 포장되어 있으므로 면적 계산 시 주의하고 동일 LOT로 작업하십시오.'
    },
    {
      num: 3,
      title: '무거운 고중량 자재 취급 안전 주의',
      desc: 'NSC 고밀도 복합체로 일반 타일보다 중량이 무거우므로 운반 및 재단 시 안전사고에 각별히 유의하십시오.'
    },
    {
      num: 4,
      title: '바닥재 전용 에디톤 풀 도포 및 표면 오염 즉시 제거',
      desc: '바닥재용 지정 접착제를 사용하고, 시공 중 표면에 묻은 접착제 잔여물은 굳기 전에 즉시 전용 클리너로 닦아내십시오.'
    },
    {
      num: 5,
      title: '벽장재(에디톤 월)와 바닥재 혼용 금지',
      desc: '에디톤 월과 에디톤 스톤 바닥재는 두께와 접착제 및 부착 방식이 상이하므로 바닥 시공 용도만을 확인하십시오.'
    }
  ]
};

// =======================================================================
// 전체 80개 제품코드 데이터베이스 (카탈로그 공식 코드 및 패턴 매핑)
// =======================================================================
export const LX_CATALOG_80_PRODUCTS = {
  // -------------------------------------------------------------
  // 1. 프레스티지 5T (14종)
  // -------------------------------------------------------------
  // 스톤 600각 (8종)
  'PTT6910': {
    code: 'PTT6910',
    cleanCode: 'PTT6910',
    lineup: 'PRESTIGE',
    lineupName: '프레스티지 (PRESTG)',
    name: 'LX 프레스티지 5T PTT6910 메탈',
    pattern: '메탈',
    specType: '스톤 600각',
    shape: '600각',
    thickness: '5.0T',
    size: '600 × 600mm',
    width: 600,
    length: 600,
    pcsPerBox: 5,
    areaPerBox: '1.80㎡',
    pyeongPerBox: '약 0.54평',
    eir: false,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6910_메탈.webp'
  },
  'PTT6912': {
    code: 'PTT6912',
    cleanCode: 'PTT6912',
    lineup: 'PRESTIGE',
    lineupName: '프레스티지 (PRESTG)',
    name: 'LX 프레스티지 5T PTT6912 메탈',
    pattern: '메탈',
    specType: '스톤 600각',
    shape: '600각',
    thickness: '5.0T',
    size: '600 × 600mm',
    width: 600,
    length: 600,
    pcsPerBox: 5,
    areaPerBox: '1.80㎡',
    pyeongPerBox: '약 0.54평',
    eir: false,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6912_메탈.webp'
  },
  'PTT6913': {
    code: 'PTT6913',
    cleanCode: 'PTT6913',
    lineup: 'PRESTIGE',
    lineupName: '프레스티지 (PRESTG)',
    name: 'LX 프레스티지 5T PTT6913 펄 콘크리트',
    pattern: '펄 콘크리트',
    specType: '스톤 600각',
    shape: '600각',
    thickness: '5.0T',
    size: '600 × 600mm',
    width: 600,
    length: 600,
    pcsPerBox: 5,
    areaPerBox: '1.80㎡',
    pyeongPerBox: '약 0.54평',
    eir: false,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6913_펄콘크리트.webp'
  },
  'PTT6917': {
    code: 'PTT6917',
    cleanCode: 'PTT6917',
    lineup: 'PRESTIGE',
    lineupName: '프레스티지 (PRESTG)',
    name: 'LX 프레스티지 5T PTT6917 비안코',
    pattern: '비안코',
    specType: '스톤 600각',
    shape: '600각',
    thickness: '5.0T',
    size: '600 × 600mm',
    width: 600,
    length: 600,
    pcsPerBox: 5,
    areaPerBox: '1.80㎡',
    pyeongPerBox: '약 0.54평',
    eir: false,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6917_비안코.webp'
  },
  'PTT6950': {
    code: 'PTT6950',
    cleanCode: 'PTT6950',
    lineup: 'PRESTIGE',
    lineupName: '프레스티지 (PRESTG)',
    name: 'LX 프레스티지 5T PTT6950 미스티 콘크리트',
    pattern: '미스티 콘크리트',
    specType: '스톤 600각',
    shape: '600각',
    thickness: '5.0T',
    size: '600 × 600mm',
    width: 600,
    length: 600,
    pcsPerBox: 5,
    areaPerBox: '1.80㎡',
    pyeongPerBox: '약 0.54평',
    eir: false,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6950_미스티콘크리트.webp'
  },
  'PTT6951': {
    code: 'PTT6951',
    cleanCode: 'PTT6951',
    lineup: 'PRESTIGE',
    lineupName: '프레스티지 (PRESTG)',
    name: 'LX 프레스티지 5T PTT6951 모던 그레이',
    pattern: '모던 그레이',
    specType: '스톤 600각',
    shape: '600각',
    thickness: '5.0T',
    size: '600 × 600mm',
    width: 600,
    length: 600,
    pcsPerBox: 5,
    areaPerBox: '1.80㎡',
    pyeongPerBox: '약 0.54평',
    eir: false,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6951_모던그레이.webp'
  },
  'PTT6952': {
    code: 'PTT6952',
    cleanCode: 'PTT6952',
    lineup: 'PRESTIGE',
    lineupName: '프레스티지 (PRESTG)',
    name: 'LX 프레스티지 5T PTT6952 샌드 베이지',
    pattern: '샌드 베이지',
    specType: '스톤 600각',
    shape: '600각',
    thickness: '5.0T',
    size: '600 × 600mm',
    width: 600,
    length: 600,
    pcsPerBox: 5,
    areaPerBox: '1.80㎡',
    pyeongPerBox: '약 0.54평',
    eir: false,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6952_샌드베이지.webp'
  },
  'PTT6953': {
    code: 'PTT6953',
    cleanCode: 'PTT6953',
    lineup: 'PRESTIGE',
    lineupName: '프레스티지 (PRESTG)',
    name: 'LX 프레스티지 5T PTT6953 솔리드 칩',
    pattern: '솔리드 칩',
    specType: '스톤 600각',
    shape: '600각',
    thickness: '5.0T',
    size: '600 × 600mm',
    width: 600,
    length: 600,
    pcsPerBox: 5,
    areaPerBox: '1.80㎡',
    pyeongPerBox: '약 0.54평',
    eir: false,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT6953_솔리드칩.webp'
  },

  // 스톤 직사각 (2종) - 457.2 × 914.4mm, EIR 적용
  'PTT8696': {
    code: 'PTT8696',
    cleanCode: 'PTT8696',
    lineup: 'PRESTIGE',
    lineupName: '프레스티지 (PRESTG)',
    name: 'LX 프레스티지 5T PTT8696 아이스 골드',
    pattern: '아이스 골드',
    specType: '스톤 직사각',
    shape: '장방형 스톤',
    thickness: '5.0T',
    size: '457.2 × 914.4mm',
    width: 457.2,
    length: 914.4,
    pcsPerBox: 5,
    areaPerBox: '2.09㎡',
    pyeongPerBox: '약 0.63평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT8696_아이스골드.webp'
  },
  'PTT8698': {
    code: 'PTT8698',
    cleanCode: 'PTT8698',
    lineup: 'PRESTIGE',
    lineupName: '프레스티지 (PRESTG)',
    name: 'LX 프레스티지 5T PTT8698 더스크 브론즈',
    pattern: '더스크 브론즈',
    specType: '스톤 직사각',
    shape: '장방형 스톤',
    thickness: '5.0T',
    size: '457.2 × 914.4mm',
    width: 457.2,
    length: 914.4,
    pcsPerBox: 5,
    areaPerBox: '2.09㎡',
    pyeongPerBox: '약 0.63평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTT8698_더스크브론즈.webp'
  },

  // 우드 (4종) - 228.6 × 1523mm, EIR 적용
  'PTW7902': {
    code: 'PTW7902',
    cleanCode: 'PTW7902',
    lineup: 'PRESTIGE',
    lineupName: '프레스티지 (PRESTG)',
    name: 'LX 프레스티지 5T PTW7902 솔트 오크',
    pattern: '솔트 오크',
    specType: '우드',
    shape: '우드',
    thickness: '5.0T',
    size: '228.6 × 1523mm',
    width: 228.6,
    length: 1523,
    pcsPerBox: 6,
    areaPerBox: '2.09㎡',
    pyeongPerBox: '약 0.63평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTW7902_솔트오크.webp'
  },
  'PTW7904': {
    code: 'PTW7904',
    cleanCode: 'PTW7904',
    lineup: 'PRESTIGE',
    lineupName: '프레스티지 (PRESTG)',
    name: 'LX 프레스티지 5T PTW7904 파인',
    pattern: '파인',
    specType: '우드',
    shape: '우드',
    thickness: '5.0T',
    size: '228.6 × 1523mm',
    width: 228.6,
    length: 1523,
    pcsPerBox: 6,
    areaPerBox: '2.09㎡',
    pyeongPerBox: '약 0.63평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTW7904_파인.webp'
  },
  'PTW7961': {
    code: 'PTW7961',
    cleanCode: 'PTW7961',
    lineup: 'PRESTIGE',
    lineupName: '프레스티지 (PRESTG)',
    name: 'LX 프레스티지 5T PTW7961 어반 사하라',
    pattern: '어반 사하라',
    specType: '우드',
    shape: '우드',
    thickness: '5.0T',
    size: '228.6 × 1523mm',
    width: 228.6,
    length: 1523,
    pcsPerBox: 6,
    areaPerBox: '2.09㎡',
    pyeongPerBox: '약 0.63평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTW7961_어반사하라.webp'
  },
  'PTW7964': {
    code: 'PTW7964',
    cleanCode: 'PTW7964',
    lineup: 'PRESTIGE',
    lineupName: '프레스티지 (PRESTG)',
    name: 'LX 프레스티지 5T PTW7964 아메리칸 오크',
    pattern: '아메리칸 오크',
    specType: '우드',
    shape: '우드',
    thickness: '5.0T',
    size: '228.6 × 1523mm',
    width: 228.6,
    length: 1523,
    pcsPerBox: 6,
    areaPerBox: '2.09㎡',
    pyeongPerBox: '약 0.63평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/PTW7964_아메리칸오크.webp'
  },

  // -------------------------------------------------------------
  // 2. 하우스스타일 3T (13종)
  // -------------------------------------------------------------
  // 스톤 ZOT (7종) - 600 × 600mm, 9장/3.24㎡
  'ZOT0761': {
    code: 'ZOT 0761',
    cleanCode: 'ZOT0761',
    lineup: 'HOUSE_STYLE',
    lineupName: '하우스스타일 (House Style)',
    name: 'LX 하우스스타일 ZOT 0761 (3.0T)',
    pattern: '스톤 샌드',
    specType: '스톤 (ZOT)',
    shape: '600각',
    thickness: '3.0T',
    size: '600 × 600mm',
    width: 600,
    length: 600,
    pcsPerBox: 9,
    areaPerBox: '3.24㎡',
    pyeongPerBox: '약 0.98평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일/ZOT 0761.jpg'
  },
  'ZOT0762': {
    code: 'ZOT 0762',
    cleanCode: 'ZOT0762',
    lineup: 'HOUSE_STYLE',
    lineupName: '하우스스타일 (House Style)',
    name: 'LX 하우스스타일 ZOT 0762 (3.0T)',
    pattern: '스톤 그레이',
    specType: '스톤 (ZOT)',
    shape: '600각',
    thickness: '3.0T',
    size: '600 × 600mm',
    width: 600,
    length: 600,
    pcsPerBox: 9,
    areaPerBox: '3.24㎡',
    pyeongPerBox: '약 0.98평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일/ZOT 0762.jpg'
  },
  'ZOT0767': {
    code: 'ZOT 0767',
    cleanCode: 'ZOT0767',
    lineup: 'HOUSE_STYLE',
    lineupName: '하우스스타일 (House Style)',
    name: 'LX 하우스스타일 ZOT 0767 (3.0T)',
    pattern: '트라버틴 라이트',
    specType: '스톤 (ZOT)',
    shape: '600각',
    thickness: '3.0T',
    size: '600 × 600mm',
    width: 600,
    length: 600,
    pcsPerBox: 9,
    areaPerBox: '3.24㎡',
    pyeongPerBox: '약 0.98평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일/ZOT 0767.jpg'
  },
  'ZOT0768': {
    code: 'ZOT 0768',
    cleanCode: 'ZOT0768',
    lineup: 'HOUSE_STYLE',
    lineupName: '하우스스타일 (House Style)',
    name: 'LX 하우스스타일 ZOT 0768 (3.0T)',
    pattern: '트라버틴 그레이',
    specType: '스톤 (ZOT)',
    shape: '600각',
    thickness: '3.0T',
    size: '600 × 600mm',
    width: 600,
    length: 600,
    pcsPerBox: 9,
    areaPerBox: '3.24㎡',
    pyeongPerBox: '약 0.98평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일/ZOT 0768.jpg'
  },
  'ZOT0769': {
    code: 'ZOT 0769',
    cleanCode: 'ZOT0769',
    lineup: 'HOUSE_STYLE',
    lineupName: '하우스스타일 (House Style)',
    name: 'LX 하우스스타일 ZOT 0769 (3.0T)',
    pattern: '테라조 화이트',
    specType: '스톤 (ZOT)',
    shape: '600각',
    thickness: '3.0T',
    size: '600 × 600mm',
    width: 600,
    length: 600,
    pcsPerBox: 9,
    areaPerBox: '3.24㎡',
    pyeongPerBox: '약 0.98평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일/ZOT 0769.jpg'
  },
  'ZOT0770': {
    code: 'ZOT 0770',
    cleanCode: 'ZOT0770',
    lineup: 'HOUSE_STYLE',
    lineupName: '하우스스타일 (House Style)',
    name: 'LX 하우스스타일 ZOT 0770 (3.0T)',
    pattern: '콘크리트 베이지',
    specType: '스톤 (ZOT)',
    shape: '600각',
    thickness: '3.0T',
    size: '600 × 600mm',
    width: 600,
    length: 600,
    pcsPerBox: 9,
    areaPerBox: '3.24㎡',
    pyeongPerBox: '약 0.98평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일/ZOT 0770.jpg'
  },
  'ZOT0771': {
    code: 'ZOT 0771',
    cleanCode: 'ZOT0771',
    lineup: 'HOUSE_STYLE',
    lineupName: '하우스스타일 (House Style)',
    name: 'LX 하우스스타일 ZOT 0771 (3.0T)',
    pattern: '콘크리트 다크그레이',
    specType: '스톤 (ZOT)',
    shape: '600각',
    thickness: '3.0T',
    size: '600 × 600mm',
    width: 600,
    length: 600,
    pcsPerBox: 9,
    areaPerBox: '3.24㎡',
    pyeongPerBox: '약 0.98평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일/ZOT 0771.jpg'
  },

  // 우드 ZOW (6종) - 150 × 1200mm, 18장/3.24㎡
  'ZOW0712': {
    code: 'ZOW 0712',
    cleanCode: 'ZOW0712',
    lineup: 'HOUSE_STYLE',
    lineupName: '하우스스타일 (House Style)',
    name: 'LX 하우스스타일 ZOW 0712 (3.0T)',
    pattern: '클래식 오크',
    specType: '우드 (ZOW)',
    shape: '우드',
    thickness: '3.0T',
    size: '150 × 1200mm',
    width: 150,
    length: 1200,
    pcsPerBox: 18,
    areaPerBox: '3.24㎡',
    pyeongPerBox: '약 0.98평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일/ZOW 0712.jpg'
  },
  'ZOW0714': {
    code: 'ZOW 0714',
    cleanCode: 'ZOW0714',
    lineup: 'HOUSE_STYLE',
    lineupName: '하우스스타일 (House Style)',
    name: 'LX 하우스스타일 ZOW 0714 (3.0T)',
    pattern: '내추럴 티크',
    specType: '우드 (ZOW)',
    shape: '우드',
    thickness: '3.0T',
    size: '150 × 1200mm',
    width: 150,
    length: 1200,
    pcsPerBox: 18,
    areaPerBox: '3.24㎡',
    pyeongPerBox: '약 0.98평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일/ZOW 0714.jpg'
  },
  'ZOW0717': {
    code: 'ZOW 0717',
    cleanCode: 'ZOW0717',
    lineup: 'HOUSE_STYLE',
    lineupName: '하우스스타일 (House Style)',
    name: 'LX 하우스스타일 ZOW 0717 (3.0T)',
    pattern: '소프트 애쉬',
    specType: '우드 (ZOW)',
    shape: '우드',
    thickness: '3.0T',
    size: '150 × 1200mm',
    width: 150,
    length: 1200,
    pcsPerBox: 18,
    areaPerBox: '3.24㎡',
    pyeongPerBox: '약 0.98평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일/ZOW 0717.jpg'
  },
  'ZOW0718': {
    code: 'ZOW 0718',
    cleanCode: 'ZOW0718',
    lineup: 'HOUSE_STYLE',
    lineupName: '하우스스타일 (House Style)',
    name: 'LX 하우스스타일 ZOW 0718 (3.0T)',
    pattern: '샌드 오크',
    specType: '우드 (ZOW)',
    shape: '우드',
    thickness: '3.0T',
    size: '150 × 1200mm',
    width: 150,
    length: 1200,
    pcsPerBox: 18,
    areaPerBox: '3.24㎡',
    pyeongPerBox: '약 0.98평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일/ZOW 0718.jpg'
  },
  'ZOW0719': {
    code: 'ZOW 0719',
    cleanCode: 'ZOW0719',
    lineup: 'HOUSE_STYLE',
    lineupName: '하우스스타일 (House Style)',
    name: 'LX 하우스스타일 ZOW 0719 (3.0T)',
    pattern: '모던 월넛',
    specType: '우드 (ZOW)',
    shape: '우드',
    thickness: '3.0T',
    size: '150 × 1200mm',
    width: 150,
    length: 1200,
    pcsPerBox: 18,
    areaPerBox: '3.24㎡',
    pyeongPerBox: '약 0.98평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일/ZOW 0719.jpg'
  },
  'ZOW0720': {
    code: 'ZOW 0720',
    cleanCode: 'ZOW0720',
    lineup: 'HOUSE_STYLE',
    lineupName: '하우스스타일 (House Style)',
    name: 'LX 하우스스타일 ZOW 0720 (3.0T)',
    pattern: '차콜 오크',
    specType: '우드 (ZOW)',
    shape: '우드',
    thickness: '3.0T',
    size: '150 × 1200mm',
    width: 150,
    length: 1200,
    pcsPerBox: 18,
    areaPerBox: '3.24㎡',
    pyeongPerBox: '약 0.98평',
    eir: true,
    imageFolder: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일',
    primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/LX하우스스타일/ZOW 0720.jpg'
  },

  // -------------------------------------------------------------
  // 3. 보타닉 3T (38종)
  // -------------------------------------------------------------
  // 600각 (12종) - 600 × 600mm, 9장/3.24㎡
  'DBT3080': { code: 'DBT3080', cleanCode: 'DBT3080', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3080 (3.0T)', pattern: '스톤 화이트 600', specType: '600각 스톤 (DBT)', shape: '600각', thickness: '3.0T', size: '600 × 600mm', width: 600, length: 600, pcsPerBox: 9, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3081': { code: 'DBT3081', cleanCode: 'DBT3081', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3081 (3.0T)', pattern: '스톤 베이지 600', specType: '600각 스톤 (DBT)', shape: '600각', thickness: '3.0T', size: '600 × 600mm', width: 600, length: 600, pcsPerBox: 9, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3082': { code: 'DBT3082', cleanCode: 'DBT3082', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3082 콘크리트 라이트그레이 600', pattern: '콘크리트 라이트그레이', specType: '600각 스톤 (DBT)', shape: '600각', thickness: '3.0T', size: '600 × 600mm', width: 600, length: 600, pcsPerBox: 9, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false, primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/보타닉/DBT3082 콘크리트 라이트그레이 600.jpg' },
  'DBT3083': { code: 'DBT3083', cleanCode: 'DBT3083', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3083 (3.0T)', pattern: '콘크리트 미디엄그레이 600', specType: '600각 스톤 (DBT)', shape: '600각', thickness: '3.0T', size: '600 × 600mm', width: 600, length: 600, pcsPerBox: 9, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3084': { code: 'DBT3084', cleanCode: 'DBT3084', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3084 (3.0T)', pattern: '콘크리트 다크그레이 600', specType: '600각 스톤 (DBT)', shape: '600각', thickness: '3.0T', size: '600 × 600mm', width: 600, length: 600, pcsPerBox: 9, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3085': { code: 'DBT3085', cleanCode: 'DBT3085', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3085 (3.0T)', pattern: '마블 비안코 600', specType: '600각 스톤 (DBT)', shape: '600각', thickness: '3.0T', size: '600 × 600mm', width: 600, length: 600, pcsPerBox: 9, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3086': { code: 'DBT3086', cleanCode: 'DBT3086', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3086 (3.0T)', pattern: '마블 네로 600', specType: '600각 스톤 (DBT)', shape: '600각', thickness: '3.0T', size: '600 × 600mm', width: 600, length: 600, pcsPerBox: 9, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3087': { code: 'DBT3087', cleanCode: 'DBT3087', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3087 (3.0T)', pattern: '테라조 화이트 600', specType: '600각 스톤 (DBT)', shape: '600각', thickness: '3.0T', size: '600 × 600mm', width: 600, length: 600, pcsPerBox: 9, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3088': { code: 'DBT3088', cleanCode: 'DBT3088', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3088 (3.0T)', pattern: '테라조 그레이 600', specType: '600각 스톤 (DBT)', shape: '600각', thickness: '3.0T', size: '600 × 600mm', width: 600, length: 600, pcsPerBox: 9, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3089': { code: 'DBT3089', cleanCode: 'DBT3089', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3089 (3.0T)', pattern: '샌드스톤 웜베이지 600', specType: '600각 스톤 (DBT)', shape: '600각', thickness: '3.0T', size: '600 × 600mm', width: 600, length: 600, pcsPerBox: 9, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3090': { code: 'DBT3090', cleanCode: 'DBT3090', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3090 샌드스톤 라이트그레이 600', pattern: '샌드스톤 라이트그레이', specType: '600각 스톤 (DBT)', shape: '600각', thickness: '3.0T', size: '600 × 600mm', width: 600, length: 600, pcsPerBox: 9, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false, primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/보타닉/DBT3090 샌드스톤 라이트그레이 600.jpg' },
  'DBT3091': { code: 'DBT3091', cleanCode: 'DBT3091', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3091 (3.0T)', pattern: '샌드스톤 다크그레이 600', specType: '600각 스톤 (DBT)', shape: '600각', thickness: '3.0T', size: '600 × 600mm', width: 600, length: 600, pcsPerBox: 9, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },

  // 450각 (16종) - 450 × 450mm, 16장/3.24㎡ (★457.2각 아님)
  'DBT3051': { code: 'DBT3051', cleanCode: 'DBT3051', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3051 (3.0T)', pattern: '스톤 아이보리 450', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3059': { code: 'DBT3059', cleanCode: 'DBT3059', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3059 (3.0T)', pattern: '스톤 베이지 450', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3060': { code: 'DBT3060', cleanCode: 'DBT3060', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3060 (3.0T)', pattern: '스톤 그레이 450', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3061': { code: 'DBT3061', cleanCode: 'DBT3061', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3061 (3.0T)', pattern: '스톤 다크그레이 450', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3062': { code: 'DBT3062', cleanCode: 'DBT3062', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3062 (3.0T)', pattern: '스톤 블랙 450', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3065': { code: 'DBT3065', cleanCode: 'DBT3065', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3065 (3.0T)', pattern: '카펫 베이지 450', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3066': { code: 'DBT3066', cleanCode: 'DBT3066', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3066 카펫 그레이 450', pattern: '카펫 그레이', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false, primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/보타닉/DBT3066 카펫 그레이 450.jpg' },
  'DBT3067': { code: 'DBT3067', cleanCode: 'DBT3067', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3067 스톤 그레이지 450', pattern: '스톤 그레이지', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false, primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/보타닉/DBT3067 스톤 그레이지 450.jpg' },
  'DBT3068': { code: 'DBT3068', cleanCode: 'DBT3068', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3068 (3.0T)', pattern: '스톤 쿨그레이 450', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3069': { code: 'DBT3069', cleanCode: 'DBT3069', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3069 스톤 실버 450', pattern: '스톤 실버', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false, primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/보타닉/DBT3069 스톤 실버 450.jpg' },
  'DBT3074': { code: 'DBT3074', cleanCode: 'DBT3074', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3074 라임스톤 라이트그레이 450', pattern: '라임스톤 라이트그레이', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false, primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/보타닉/DBT3074 라임스톤 라이트그레이 450.jpg' },
  'DBT3075': { code: 'DBT3075', cleanCode: 'DBT3075', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3075 라임스톤 라이트그레이 450', pattern: '라임스톤 라이트그레이', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false, primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/보타닉/DBT3075 라임스톤 라이트그레이 450.jpg' },
  'DBT3076': { code: 'DBT3076', cleanCode: 'DBT3076', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3076 (3.0T)', pattern: '라임스톤 웜그레이 450', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3077': { code: 'DBT3077', cleanCode: 'DBT3077', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3077 (3.0T)', pattern: '라임스톤 다크그레이 450', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3078': { code: 'DBT3078', cleanCode: 'DBT3078', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3078 (3.0T)', pattern: '콘크리트 라이트 450', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },
  'DBT3079': { code: 'DBT3079', cleanCode: 'DBT3079', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBT3079 (3.0T)', pattern: '콘크리트 딥그레이 450', specType: '450각 스톤 (DBT)', shape: '450각', thickness: '3.0T', size: '450 × 450mm', width: 450, length: 450, pcsPerBox: 16, areaPerBox: '3.24㎡', pyeongPerBox: '약 0.98평', eir: false },

  // 우드 (10종) - 180 × 920mm, 20장/약 3.31㎡
  'DBW3019': { code: 'DBW3019', cleanCode: 'DBW3019', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBW3019 (3.0T)', pattern: '우드 화이트 180', specType: '우드 플랭크 (DBW)', shape: '우드', thickness: '3.0T', size: '180 × 920mm', width: 180, length: 920, pcsPerBox: 20, areaPerBox: '3.31㎡', pyeongPerBox: '약 1.00평', eir: false },
  'DBW3020': { code: 'DBW3020', cleanCode: 'DBW3020', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBW3020 우드 브라운 180', pattern: '우드 브라운', specType: '우드 플랭크 (DBW)', shape: '우드', thickness: '3.0T', size: '180 × 920mm', width: 180, length: 920, pcsPerBox: 20, areaPerBox: '3.31㎡', pyeongPerBox: '약 1.00평', eir: false, primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/보타닉/DBW3020 우드 브라운 180.jpg' },
  'DBW3022': { code: 'DBW3022', cleanCode: 'DBW3022', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBW3022 우드 브라운 180', pattern: '우드 브라운', specType: '우드 플랭크 (DBW)', shape: '우드', thickness: '3.0T', size: '180 × 920mm', width: 180, length: 920, pcsPerBox: 20, areaPerBox: '3.31㎡', pyeongPerBox: '약 1.00평', eir: false, primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/보타닉/DBW3022 우드 브라운 180.jpg' },
  'DBW3029': { code: 'DBW3029', cleanCode: 'DBW3029', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBW3029 우드 라이트베이지 180', pattern: '우드 라이트베이지', specType: '우드 플랭크 (DBW)', shape: '우드', thickness: '3.0T', size: '180 × 920mm', width: 180, length: 920, pcsPerBox: 20, areaPerBox: '3.31㎡', pyeongPerBox: '약 1.00평', eir: false, primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/보타닉/DBW3029 우드 라이트베이지 180.jpg' },
  'DBW3037': { code: 'DBW3037', cleanCode: 'DBW3037', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBW3037 우드 라이트베이지 180', pattern: '우드 라이트베이지', specType: '우드 플랭크 (DBW)', shape: '우드', thickness: '3.0T', size: '180 × 920mm', width: 180, length: 920, pcsPerBox: 20, areaPerBox: '3.31㎡', pyeongPerBox: '약 1.00평', eir: false, primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/보타닉/DBW3037 우드 라이트베이지 180.jpg' },
  'DBW3038': { code: 'DBW3038', cleanCode: 'DBW3038', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBW3038 우드 베이지 180', pattern: '우드 베이지', specType: '우드 플랭크 (DBW)', shape: '우드', thickness: '3.0T', size: '180 × 920mm', width: 180, length: 920, pcsPerBox: 20, areaPerBox: '3.31㎡', pyeongPerBox: '약 1.00평', eir: false, primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/보타닉/DBW3038 우드 베이지 180.jpg' },
  'DBW3040': { code: 'DBW3040', cleanCode: 'DBW3040', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBW3040 (3.0T)', pattern: '우드 내추럴오크 180', specType: '우드 플랭크 (DBW)', shape: '우드', thickness: '3.0T', size: '180 × 920mm', width: 180, length: 920, pcsPerBox: 20, areaPerBox: '3.31㎡', pyeongPerBox: '약 1.00평', eir: false },
  'DBW3042': { code: 'DBW3042', cleanCode: 'DBW3042', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBW3042 우드 라이트브라운 180', pattern: '우드 라이트브라운', specType: '우드 플랭크 (DBW)', shape: '우드', thickness: '3.0T', size: '180 × 920mm', width: 180, length: 920, pcsPerBox: 20, areaPerBox: '3.31㎡', pyeongPerBox: '약 1.00평', eir: false, primaryImage: '/images/Thumbnail_Image/materials/데코타일/LX/보타닉/DBW3042 우드 라이트브라운 180.jpg' },
  'DBW3045': { code: 'DBW3045', cleanCode: 'DBW3045', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBW3045 (3.0T)', pattern: '우드 다크브라운 180', specType: '우드 플랭크 (DBW)', shape: '우드', thickness: '3.0T', size: '180 × 920mm', width: 180, length: 920, pcsPerBox: 20, areaPerBox: '3.31㎡', pyeongPerBox: '약 1.00평', eir: false },
  'DBW3046': { code: 'DBW3046', cleanCode: 'DBW3046', lineup: 'BOTANIC', lineupName: '보타닉 (BOTANIC)', name: 'LX 보타닉 DBW3046 (3.0T)', pattern: '우드 차콜 180', specType: '우드 플랭크 (DBW)', shape: '우드', thickness: '3.0T', size: '180 × 920mm', width: 180, length: 920, pcsPerBox: 20, areaPerBox: '3.31㎡', pyeongPerBox: '약 1.00평', eir: false },

  // -------------------------------------------------------------
  // 4. 에디톤 스톤 5T (15종)
  // 기본: 450 × 900mm (4장 / 1.62㎡)
  // 추가 600각 옵션: EDT7724, EDT7725, EDT7732, EDT7734
  // -------------------------------------------------------------
  'EDT7721': { code: 'EDT7721', cleanCode: 'EDT7721', lineup: 'EDITONE', lineupName: '에디톤 스톤 (EDITONE STONE)', name: 'LX 에디톤 스톤 EDT7721 (5.0T)', pattern: '스톤 화이트', specType: '기본 대형 스톤 (450×900)', shape: '스톤 대형', thickness: '5.0T', size: '450 × 900mm', width: 450, length: 900, pcsPerBox: 4, areaPerBox: '1.62㎡', pyeongPerBox: '약 0.49평', has600Option: false },
  'EDT7724': { code: 'EDT7724', cleanCode: 'EDT7724', lineup: 'EDITONE', lineupName: '에디톤 스톤 (EDITONE STONE)', name: 'LX 에디톤 스톤 EDT7724 솔티 애쉬 (5.0T)', pattern: '솔티 애쉬', specType: '기본 대형 스톤 (450×900)', shape: '스톤 대형', thickness: '5.0T', size: '450 × 900mm', width: 450, length: 900, pcsPerBox: 4, areaPerBox: '1.62㎡', pyeongPerBox: '약 0.49평', has600Option: true, option600Desc: '600 × 600mm 규격 선택 가능 (박스 포장 수량 별도 상담)' },
  'EDT7725': { code: 'EDT7725', cleanCode: 'EDT7725', lineup: 'EDITONE', lineupName: '에디톤 스톤 (EDITONE STONE)', name: 'LX 에디톤 스톤 EDT7725 솔티 크림 (5.0T)', pattern: '솔티 크림', specType: '기본 대형 스톤 (450×900)', shape: '스톤 대형', thickness: '5.0T', size: '450 × 900mm', width: 450, length: 900, pcsPerBox: 4, areaPerBox: '1.62㎡', pyeongPerBox: '약 0.49평', has600Option: true, option600Desc: '600 × 600mm 규격 선택 가능 (박스 포장 수량 별도 상담)' },
  'EDT7726': { code: 'EDT7726', cleanCode: 'EDT7726', lineup: 'EDITONE', lineupName: '에디톤 스톤 (EDITONE STONE)', name: 'LX 에디톤 스톤 EDT7726 (5.0T)', pattern: '솔티 그레이', specType: '기본 대형 스톤 (450×900)', shape: '스톤 대형', thickness: '5.0T', size: '450 × 900mm', width: 450, length: 900, pcsPerBox: 4, areaPerBox: '1.62㎡', pyeongPerBox: '약 0.49평', has600Option: false },
  'EDT7727': { code: 'EDT7727', cleanCode: 'EDT7727', lineup: 'EDITONE', lineupName: '에디톤 스톤 (EDITONE STONE)', name: 'LX 에디톤 스톤 EDT7727 (5.0T)', pattern: '마블 비안코', specType: '기본 대형 스톤 (450×900)', shape: '스톤 대형', thickness: '5.0T', size: '450 × 900mm', width: 450, length: 900, pcsPerBox: 4, areaPerBox: '1.62㎡', pyeongPerBox: '약 0.49평', has600Option: false },
  'EDT7729': { code: 'EDT7729', cleanCode: 'EDT7729', lineup: 'EDITONE', lineupName: '에디톤 스톤 (EDITONE STONE)', name: 'LX 에디톤 스톤 EDT7729 (5.0T)', pattern: '마블 베이지', specType: '기본 대형 스톤 (450×900)', shape: '스톤 대형', thickness: '5.0T', size: '450 × 900mm', width: 450, length: 900, pcsPerBox: 4, areaPerBox: '1.62㎡', pyeongPerBox: '약 0.49평', has600Option: false },
  'EDT7730': { code: 'EDT7730', cleanCode: 'EDT7730', lineup: 'EDITONE', lineupName: '에디톤 스톤 (EDITONE STONE)', name: 'LX 에디톤 스톤 EDT7730 (5.0T)', pattern: '테라조 베이지', specType: '기본 대형 스톤 (450×900)', shape: '스톤 대형', thickness: '5.0T', size: '450 × 900mm', width: 450, length: 900, pcsPerBox: 4, areaPerBox: '1.62㎡', pyeongPerBox: '약 0.49평', has600Option: false },
  'EDT7731': { code: 'EDT7731', cleanCode: 'EDT7731', lineup: 'EDITONE', lineupName: '에디톤 스톤 (EDITONE STONE)', name: 'LX 에디톤 스톤 EDT7731 (5.0T)', pattern: '테라조 그레이', specType: '기본 대형 스톤 (450×900)', shape: '스톤 대형', thickness: '5.0T', size: '450 × 900mm', width: 450, length: 900, pcsPerBox: 4, areaPerBox: '1.62㎡', pyeongPerBox: '약 0.49평', has600Option: false },
  'EDT7732': { code: 'EDT7732', cleanCode: 'EDT7732', lineup: 'EDITONE', lineupName: '에디톤 스톤 (EDITONE STONE)', name: 'LX 에디톤 스톤 EDT7732 라임 베이지 (5.0T)', pattern: '라임 베이지', specType: '기본 대형 스톤 (450×900)', shape: '스톤 대형', thickness: '5.0T', size: '450 × 900mm', width: 450, length: 900, pcsPerBox: 4, areaPerBox: '1.62㎡', pyeongPerBox: '약 0.49평', has600Option: true, option600Desc: '600 × 600mm 규격 선택 가능 (박스 포장 수량 별도 상담)' },
  'EDT7733': { code: 'EDT7733', cleanCode: 'EDT7733', lineup: 'EDITONE', lineupName: '에디톤 스톤 (EDITONE STONE)', name: 'LX 에디톤 스톤 EDT7733 (5.0T)', pattern: '라임 그레이', specType: '기본 대형 스톤 (450×900)', shape: '스톤 대형', thickness: '5.0T', size: '450 × 900mm', width: 450, length: 900, pcsPerBox: 4, areaPerBox: '1.62㎡', pyeongPerBox: '약 0.49평', has600Option: false },
  'EDT7734': { code: 'EDT7734', cleanCode: 'EDT7734', lineup: 'EDITONE', lineupName: '에디톤 스톤 (EDITONE STONE)', name: 'LX 에디톤 스톤 EDT7734 콘크리트 라이트 (5.0T)', pattern: '콘크리트 라이트', specType: '기본 대형 스톤 (450×900)', shape: '스톤 대형', thickness: '5.0T', size: '450 × 900mm', width: 450, length: 900, pcsPerBox: 4, areaPerBox: '1.62㎡', pyeongPerBox: '약 0.49평', has600Option: true, option600Desc: '600 × 600mm 규격 선택 가능 (박스 포장 수량 별도 상담)' },
  'EDT7735': { code: 'EDT7735', cleanCode: 'EDT7735', lineup: 'EDITONE', lineupName: '에디톤 스톤 (EDITONE STONE)', name: 'LX 에디톤 스톤 EDT7735 (5.0T)', pattern: '콘크리트 미디엄', specType: '기본 대형 스톤 (450×900)', shape: '스톤 대형', thickness: '5.0T', size: '450 × 900mm', width: 450, length: 900, pcsPerBox: 4, areaPerBox: '1.62㎡', pyeongPerBox: '약 0.49평', has600Option: false },
  'EDT7736': { code: 'EDT7736', cleanCode: 'EDT7736', lineup: 'EDITONE', lineupName: '에디톤 스톤 (EDITONE STONE)', name: 'LX 에디톤 스톤 EDT7736 (5.0T)', pattern: '콘크리트 다크', specType: '기본 대형 스톤 (450×900)', shape: '스톤 대형', thickness: '5.0T', size: '450 × 900mm', width: 450, length: 900, pcsPerBox: 4, areaPerBox: '1.62㎡', pyeongPerBox: '약 0.49평', has600Option: false },
  'EDT7737': { code: 'EDT7737', cleanCode: 'EDT7737', lineup: 'EDITONE', lineupName: '에디톤 스톤 (EDITONE STONE)', name: 'LX 에디톤 스톤 EDT7737 (5.0T)', pattern: '모던 차콜', specType: '기본 대형 스톤 (450×900)', shape: '스톤 대형', thickness: '5.0T', size: '450 × 900mm', width: 450, length: 900, pcsPerBox: 4, areaPerBox: '1.62㎡', pyeongPerBox: '약 0.49평', has600Option: false },
  'EDT7738': { code: 'EDT7738', cleanCode: 'EDT7738', lineup: 'EDITONE', lineupName: '에디톤 스톤 (EDITONE STONE)', name: 'LX 에디톤 스톤 EDT7738 (5.0T)', pattern: '샌드 스톤', specType: '기본 대형 스톤 (450×900)', shape: '스톤 대형', thickness: '5.0T', size: '450 × 900mm', width: 450, length: 900, pcsPerBox: 4, areaPerBox: '1.62㎡', pyeongPerBox: '약 0.49평', has600Option: false }
};

/**
 * 라인업별 Config 매핑 객체
 */
export const LX_LINEUP_CONFIGS = {
  PRESTIGE: LX_PRESTIGE_CONFIG,
  HOUSE_STYLE: LX_HOUSE_STYLE_CONFIG,
  BOTANIC: LX_BOTANIC_CONFIG,
  EDITONE: LX_EDITONE_CONFIG
};
