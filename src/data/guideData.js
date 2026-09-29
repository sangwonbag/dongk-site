/**
 * 동경바닥재 - 바닥재 가이드 (Flooring Guide) 데이터베이스
 * SEO/GEO(AI 검색대응), FAQ, 상품 카테고리 연동 및 가격/수량 계산 로직을 위한 구조화 데이터
 */

export const GUIDE_CATEGORIES = [
  { id: "all", name: "전체 가이드" },
  { id: "types", name: "종류·비교" },
  { id: "space", name: "공간별 추천" },
  { id: "price", name: "가격·수량" },
  { id: "thickness", name: "두께·시공" }
];

export const MAIN_FLOORING_TYPES = [
  {
    id: "jangpan",
    name: "장판 (롤 바닥재 / PVC 시트)",
    slug: "vinyl-thickness",
    category: "장판",
    tagline: "열전도율 높고 물관리가 편한 대중적 바닥재",
    features: ["우수한 이음매 수밀성 (물에 강함)", "높은 난방 효율 & 따뜻한 촉감", "가성비 뛰어난 시공비"],
    badge: "가장 인기",
    link: "/guide/vinyl-thickness",
    productCategory: "장판"
  },
  {
    id: "decotile",
    name: "데코타일 (PVC 타일)",
    slug: "decotile-quantity",
    category: "데코타일",
    tagline: "내구성이 강하고 부분 보수가 쉬운 실용적 바닥재",
    features: ["가구 찍힘·스크래치에 뛰어난 내구성", "다양한 스톤/우드 텍스처 패턴", "손상 부위 낱개 부분 교체 가능"],
    badge: "상가/사무실 필수",
    link: "/guide/decotile-quantity",
    productCategory: "데코타일"
  },
  {
    id: "gangmaru",
    name: "강마루",
    slug: "flooring-types",
    category: "강마루",
    tagline: "합판 위에 고강도 HPL을 접착하여 보행감이 뛰어난 마루",
    features: ["스크래치에 강한 HPL 표면재", "바닥 접착 방식으로 열전도성 양호", "자연스러운 고급 원목 텍스처"],
    badge: "주거 공간 추천",
    link: "/guide/flooring-types",
    productCategory: "강마루"
  },
  {
    id: "ganghwamaru",
    name: "강화마루",
    slug: "flooring-types",
    category: "강화마루",
    tagline: "HDF 목재 기재에 조립식 클릭 시공 방식의 마루",
    features: ["접착제 없는 미싱 조립 시공", "표면 강도 매우 강함", "이사 시 철거 및 재시공 용이"],
    badge: "조립식 시공",
    link: "/guide/flooring-types",
    productCategory: "마루"
  },
  {
    id: "wonmokmaru",
    name: "원목마루",
    slug: "flooring-types",
    category: "원목마루",
    tagline: "천연 원목 단판을 얹어 촉감과 질감이 독보적인 프리미엄 바닥재",
    features: ["천연 나뭇결 고유의 고급감", "질감과 발에 닿는 촉감 최고", "정기적 왁싱 및 온습도 관리 필요"],
    badge: "프리미엄",
    link: "/guide/flooring-types",
    productCategory: "마루"
  }
];

export const SPACE_RECOMMENDATIONS = [
  {
    title: "아파트 / 주택",
    slug: "apartment-flooring",
    desc: "난방 효율, 보행감, 층간소음, 청소 편의성을 고려한 최적의 바닥재 선택",
    tags: ["2.2T~4.5T 장판", "강마루", "아이/반려견 고려"],
    link: "/guide/apartment-flooring",
    bgClass: "bg-apt"
  },
  {
    title: "상가 / 매장 / 병원",
    slug: "commercial-flooring",
    desc: "신발을 신고 다니는 유동인구가 많은 보행 공간과 습기·내구성 중심 선택",
    tags: ["데코타일 3.0T", "사무실 데코타일", "부분 보수 용이"],
    link: "/guide/commercial-flooring",
    bgClass: "bg-store"
  },
  {
    title: "반려동물이 있는 집",
    slug: "pet-flooring",
    desc: "슬개골 탈구 예방 미끄럼 방지, 배변 실수 수밀성, 긁힘 방지 바닥재",
    tags: ["논슬립 엠보 장판", "고두께 시트", "배변 침투 방지"],
    link: "/guide/pet-flooring",
    bgClass: "bg-pet"
  },
  {
    title: "원룸 / 임대용 주택",
    slug: "flooring-price",
    desc: "빠른 시공과 시공 예산 절감, 원상복구가 용이한 경제적 선택",
    tags: ["1.8T 장판", "우드 데코타일", "가성비 원스톱"],
    link: "/guide/flooring-price",
    bgClass: "bg-oneroom"
  }
];

export const ALL_GUIDE_FAQS = [
  {
    category: "기본",
    question: "바닥재 종류에는 무엇이 있나요?",
    answer: "주요 바닥재 종류에는 장판(PVC 시트), 데코타일(PVC 타일), 강마루, 강화마루, 원목마루, 카페트타일이 있습니다. 주거 공간에는 장판과 강마루가 많이 사용되며, 상가 및 사무실에는 내구성이 뛰어난 데코타일이 가장 대중적입니다.",
    linkText: "바닥재 종류 전체 비교 보기",
    linkUrl: "/guide/flooring-types"
  },
  {
    category: "기본",
    question: "장판과 마루는 무엇이 다른가요?",
    answer: "장판은 롤 형태의 PVC 소재로 이음매가 적고 물에 강하며 쿠션감이 있습니다. 마루는 목재 기재 기반의 개별 판재 형태로 나뭇결 질감이 고급스럽고 집안 인테리어 완성도가 높습니다. 장판은 열전도율이 높아 난방 시 빨리 따뜻해집니다.",
    linkText: "장판 vs 데코타일/마루 상세 비교",
    linkUrl: "/guide/vinyl-vs-decotile"
  },
  {
    category: "기본",
    question: "아파트에는 어떤 바닥재가 가장 좋은가요?",
    answer: "아파트에는 난방 효율과 청소가 용이한 2.2T~3.2T 장판이나 보행감이 고급스러운 강마루가 가장 추천됩니다. 어린 자녀나 반려동물이 있다면 쿠션감과 미끄럼 방지 엠보가 있는 3.2T 이상 고두께 장판이 우수합니다.",
    linkText: "아파트 바닥재 가이드",
    linkUrl: "/guide/apartment-flooring"
  },
  {
    category: "장판",
    question: "장판 1.8T와 2.2T의 차이는 무엇인가요?",
    answer: "1.8T는 두께 1.8mm로 임대 주택, 원룸, 베란다 등에 많이 쓰이는 알뜰형 장판입니다. 2.2T는 두께 2.2mm로 일반 가정집(아파트, 빌라)의 표준 두께이며, 1.8T 대비 보행감이 폭신하고 층간생활소음 완화 효과가 뛰어납니다.",
    linkText: "장판 두께별 차이 보기",
    linkUrl: "/guide/vinyl-thickness"
  },
  {
    category: "장판",
    question: "온돌 바닥에 장판을 사용할 수 있나요?",
    answer: "네, 한국 주택의 바닥난방(온돌) 구조에 장판은 매우 잘 맞습니다. 열전도율이 높아 난방 온도를 올렸을 때 온열 효과가 빠르게 전달되며, 바닥 변형 위험이 마루 대비 적습니다.",
    linkText: "장판 제품 보러가기",
    linkUrl: "/materials?category=장판"
  },
  {
    category: "데코타일",
    question: "데코타일 장점과 단점은 무엇인가요?",
    answer: "장점: 찍힘과 긁힘에 강하고, 다양한 스톤·타일·우드 디자인 연출이 가능하며, 손상된 조각만 낱개 교체할 수 있습니다. 단점: 롤 장판에 비해 틈새 사이로 물이 오래 방치되면 본드 수용성이 떨어질 수 있으므로 베란다 세탁실 등 항상 물이 고이는 장소에는 적합하지 않습니다.",
    linkText: "데코타일 가이드 확인",
    linkUrl: "/guide/vinyl-vs-decotile"
  },
  {
    category: "데코타일",
    question: "데코타일 한 박스는 몇 평인가요?",
    answer: "일반적으로 3mm 두께 표준 사각 데코타일(457mm x 457mm 또는 600mm x 600mm)은 1박스당 약 3.31㎡ (1평) 시공 분량입니다. 우드 데코타일 도 1박스당 1평 분량이 표준 규격입니다.",
    linkText: "데코타일 박스 수 수량 계산기",
    linkUrl: "/guide/decotile-quantity"
  },
  {
    category: "마루",
    question: "강마루와 강화마루의 차이는 무엇인가요?",
    answer: "강마루는 내수합판 기재에 바닥 전용 접착제로 시공하여 열전도율이 우수하고 변형이 적습니다. 강화마루는 HDF(고밀도 톱밥 압축) 기재에 접착제 없이 클릭 조립 시공하므로 바닥이 약간 떠 있어 난방 효율이 다소 떨어지고 습기에 부풀 수 있습니다.",
    linkText: "바닥재 전체 상세 비교",
    linkUrl: "/guide/flooring-types"
  },
  {
    category: "수량",
    question: "데코타일 몇 박스가 필요한지 어떻게 계산하나요?",
    answer: "필요 평수 + 로스율(약 5~10%)을 더해 계산합니다. 예를 들어 실평수 20평이라면 로스율 5% 포함 시 21평이 필요하므로 총 21박스를 구비하시면 안전합니다.",
    linkText: "수량 자재 계산해보기",
    linkUrl: "/guide/decotile-quantity"
  },
  {
    category: "비용",
    question: "바닥재 시공 가격은 어떻게 구성되나요?",
    answer: "전체 바닥 시공비는 [자재비] + [기본 노무/인건비] + [부자재비(본드/마감재)] + [기존 바닥 철거비(필요시)]로 산정됩니다. 동경바닥재 자동견적 서비스를 통해 실시간 부자재 포함 가격을 한눈에 확인할 수 있습니다.",
    linkText: "자동견적 계산기로 이동",
    linkUrl: "/estimate/request"
  }
];

export const GUIDE_ARTICLES = {
  "flooring-types": {
    slug: "flooring-types",
    categoryGroup: "types",
    title: "바닥재 종류 완벽 정리 (장판·데코타일·강마루·강화마루)",
    subtitle: "우리 집에 딱 맞는 바닥재는? 소재별 장단점, 가격대, 유지관리 방법 총정리",
    metaTitle: "바닥재 종류 완벽 비교 가이드 | 장판·데코타일·마루 특징 | 동경바닥재",
    metaDescription: "장판, 데코타일, 강마루, 강화마루, 원목마루의 소재별 특징, 시공 방식, 열전도율, 내구성 차이를 전문가 기준으로 한눈에 정리했습니다.",
    aiSummary: "주거 및 상업 공간 바닥재는 크게 장판(PVC시트), 데코타일(PVC타일), 강마루, 강화마루, 원목마루로 나뉩니다. 난방 효율과 청소 편의성은 장판이 우수하고, 스크래치 내구성과 디자인 정교함은 데코타일과 강마루가 탁월합니다. 공간 목적과 시공 예산에 맞춰 선택하는 것이 핵심입니다.",
    breadcrumb: [
      { label: "홈", link: "/" },
      { label: "바닥재 가이드", link: "/guide" },
      { label: "바닥재 종류" }
    ],
    sections: [
      {
        heading: "1. 장판 (PVC 시트)",
        content: `장판은 이음매가 최소화되는 롤 형태의 바닥재입니다. 두께(1.8T ~ 5.0T) 선택폭이 넓으며, 물이나 오염물질에 매우 강합니다.
        
한국 주택 온돌 구조에서 열전도율이 우수하여 겨울철 난방 시 방 전체가 빠르게 따뜻해지며, 3.2T 이상 고두께 장판은 층간 생활소음 완화에도 효과적입니다.`,
        bullets: ["추천 공간: 아파트, 빌라, 원룸, 아이가 있는 집", "장점: 가성비, 수밀성, 빠른 열전도", "단점: 무거운 가구 장기 배치 시 눌림 자국 발생 가능"]
      },
      {
        heading: "2. 데코타일 (PVC 타일)",
        content: `데코타일은 단단한 PVC 성분을 정교한 타일 형태로 가공한 자재입니다. 우드, 마블, 대리석, 콘크리트 등 다양한 표면 질감을 사실감 있게 표현합니다.
        
가구 찍힘이나 스크래치에 매우 강하여 신발을 신고 이동하거나 유동인구가 많은 상가, 사무실, 카페 매장에서 필수적으로 사용됩니다.`,
        bullets: ["추천 공간: 상가, 사무실, 카페, 매장, 하이엔드 오피스텔", "장점: 뛰어난 내구성, 부분 낱개 보수 용이", "단점: 수용성 본드 시공 시 지속적인 수분 노출 주의"]
      },
      {
        heading: "3. 강마루 (합판+HPL)",
        content: `내수성이 강화된 합판 기재 표면에 고강도 수지 판재(HPL)를 접착 시공하는 마루입니다.
        
원목 마루의 고급스러운 నా 나뭇결 디자인을 유지하면서도 표면 스크래치 저항성을 획기적으로 개선하여 아파트 주거 인테리어의 대세로 자리잡았습니다.`,
        bullets: ["추천 공간: 프리미엄 아파트, 주택 거실 및 침실", "장점: 고급 나뭇결 텍스처, 변형이 적음", "단점: 장판 대비 자재 및 시공 단가 높음"]
      }
    ],
    relatedCategory: "장판",
    faqs: ALL_GUIDE_FAQS.filter(f => f.category === "기본" || f.category === "마루"),
    schemaOrg: {
      type: "Article",
      headline: "바닥재 종류 완벽 비교 가이드",
      description: "장판, 데코타일, 강마루, 강화마루 차이점 및 추천"
    }
  },

  "vinyl-vs-decotile": {
    slug: "vinyl-vs-decotile",
    categoryGroup: "types",
    title: "장판 vs 데코타일 차이점 비교 (어떤 바닥재를 골라야 할까?)",
    subtitle: "가격, 내구성, 물에 대한 강도, 시공 방식, 보행감 9가지 항목 정밀 비교",
    metaTitle: "장판 vs 데코타일 차이 완벽 비교표 | 동경바닥재 가이드",
    metaDescription: "장판과 데코타일 중 우리 집에 무엇이 맞을까? 내구성, 물 수밀성, 시공비, 보수 용이성 9가지 비교표와 공간별 최적 추천을 확인하세요.",
    aiSummary: "장판은 이음매가 없어 물청소가 쉽고 온돌 난방 효율이 우수한 반면, 무거운 가구 눌림에 다소 약합니다. 반면 데코타일은 표면이 단단하여 긁힘과 눌림에 매우 강하고 손상 조각만 부분 교체가 가능합니다. 가정집 주거에는 장판, 상가 및 사무실에는 데코타일을 추천합니다.",
    breadcrumb: [
      { label: "홈", link: "/" },
      { label: "바닥재 가이드", link: "/guide" },
      { label: "장판 vs 데코타일" }
    ],
    comparisonTable: {
      headers: ["비교 항목", "장판 (PVC 시트)", "데코타일 (PVC 타일)"],
      rows: [
        ["주요 형태", "롤 형태 (폭 1.8m~2m 연속 시공)", "조각 타일 형태 (사각/우드 규격)"],
        ["내구성 / 긁힘", "보통 (무거운 가구 장기 배치 시 눌림)", "매우 강함 (가구 찍힘/스크래치 강함)"],
        ["물 / 방수성", "매우 우수 (이음매 없어 침수 방지)", "우수 (단, 틈새 오래 물 방지 시 주의)"],
        ["난방 열전도율", "최고 (온돌 난방시 빠르게 따뜻함)", "양호 (두께 3.0mm 열전도 양호)"],
        ["보행감 / 쿠션", "폭신하고 부드러움 (두께별 차이)", "단단하고 짱짱함"],
        ["부분 보수성", "어려움 (전체 교체 또는 조인트 처리)", "매우 쉬움 (해당 타일만 낱개 교체)"],
        ["추천 공간", "아파트, 주택, 원룸, 가정집", "상가, 사무실, 학원, 병원, 오피스텔"]
      ]
    },
    sections: [
      {
        heading: "언제 장판을 선택해야 할까요?",
        content: "어린 자녀가 있거나 맨발로 생활하는 주거 공간, 겨울철 난방비를 절감하고 싶을 때 장판을 선택하세요. 물을 자주 지지거나 청소가 편한 환경에 가장 이상적입니다."
      },
      {
        heading: "언제 데코타일을 선택해야 할까요?",
        content: "신발을 신거나 가구 이동이 잦은 매장, 상가, 사무실, 반려견 스크래치가 염려되는 공간에는 데코타일이 최고입니다. 나중에 오염되거나 긁힌 부분만 1~2장 손쉽게 떼어내어 새것으로 교체할 수 있습니다."
      }
    ],
    relatedCategory: "데코타일",
    faqs: ALL_GUIDE_FAQS.filter(f => f.category === "장판" || f.category === "데코타일")
  },

  "flooring-price": {
    slug: "flooring-price",
    categoryGroup: "price",
    title: "바닥재 가격은 어떻게 계산될까요? (견적 산정 구성 요소)",
    subtitle: "자재비, 필요 수량, 시공비, 부자재비, 철거비 포함 견적 원리 대공개",
    metaTitle: "바닥재 가격 계산 방식 및 평수 견적 산정 가이드 | 동경바닥재",
    metaDescription: "바닥재 평당 자재비부터 시공 인건비, 부자재(본드/마감재), 철거비 계산 법을 정리했습니다. 실시간 자동견적 계산기를 바로 이용해보세요.",
    aiSummary: "바닥 시공 전체 견적은 [자재비(평수 × 단가)] + [시공 인건비] + [부자재(전용 본드, 용착제, 마감재)] + [기존 바닥 철거비] 합산으로 구성됩니다. 현장 바닥 상태와 평수에 따라 정확한 견적이 결정됩니다.",
    breadcrumb: [
      { label: "홈", link: "/" },
      { label: "바닥재 가이드", link: "/guide" },
      { label: "가격 계산 방식" }
    ],
    calculatorType: "price",
    sections: [
      {
        heading: "1. 자재비 계산 공식",
        content: "자재비 = (전용 면적 평수 + 로스율 5~10%) × 평당 자재 단가. 각 브랜드 및 두께에 따라 평당 가격이 형성되어 있습니다."
      },
      {
        heading: "2. 시공 인건비 및 기본 부자재비",
        content: "전문 시공팀의 당일 시공 인건비와 친환경 전용 본드, 마감재(걸레받이/굽도리), 장판 용착제 등의 비용이 포함됩니다."
      },
      {
        heading: "3. 추가 현장 비용 확인사항",
        content: "기존 데코타일/마루 샌딩 철거, 짐 이동 여부, 바닥 크랙 파진 곳 보수 등 현장 조건에 따라 추가 비용이 발생할 수 있습니다."
      }
    ],
    relatedCategory: "장판",
    faqs: ALL_GUIDE_FAQS.filter(f => f.category === "비용" || f.category === "수량")
  },

  "apartment-flooring": {
    slug: "apartment-flooring",
    categoryGroup: "space",
    title: "아파트·주택을 위한 바닥재 추천 가이드",
    subtitle: "난방 효율, 보행감, 층간소음, 청소 편의성을 모두 고려한 선택법",
    metaTitle: "아파트 바닥재 추천 가이드 | 장판 vs 마루 선택 기준 | 동경바닥재",
    metaDescription: "아파트 주거 환경에 가장 적합한 2.2T~4.5T 장판과 강마루를 비교하고, 층간소음 완화 및 온돌 난방 효율을 높이는 바닥재를 추천합니다.",
    aiSummary: "아파트 주거 공간에는 난방 전달이 빠르고 청소가 편리한 2.2T~3.2T 가정용 장판이나 집안 전체의 인테리어 고급감을 올려주는 강마루가 가장 선호됩니다. 어린이가 있다면 4.5T 이상 고두께 장판이 층간 충격음 완화에 효과적입니다.",
    breadcrumb: [
      { label: "홈", link: "/" },
      { label: "바닥재 가이드", link: "/guide" },
      { label: "아파트 바닥재" }
    ],
    sections: [
      {
        heading: "가장 대중적인 아파트 조합: 2.2T ~ 3.2T 장판",
        content: "가성비와 실용성을 중시하는 아파트 주거 환경에서 2.2T 및 3.2T 장판은 유해물질 프리 친환경 소재와 풍부한 엠보 나뭇결/스톤 패턴을 갖추고 있어 최선의 선택입니다."
      },
      {
        heading: "인테리어 감성을 완성하는 선택: 강마루",
        content: "거실과 안방 인테리어에 모던함과 고급 나뭇결을 원하신다면 강마루 시공을 추천합니다. 접착식 시공으로 바닥 밀착감이 뛰어납니다."
      }
    ],
    relatedCategory: "장판",
    faqs: ALL_GUIDE_FAQS.filter(f => f.category === "기본" || f.category === "장판")
  },

  "commercial-flooring": {
    slug: "commercial-flooring",
    categoryGroup: "space",
    title: "상가·사무실·매장 내구성 최고 바닥재 추천",
    subtitle: "보행 유동인구가 많은 상업 공간을 위한 데코타일 3.0T 선택 가이드",
    metaTitle: "상가·사무실 바닥재 추천 | 데코타일 3.0T 시공 가이드 | 동경바닥재",
    metaDescription: "사무실, 카페, 매장, 병원 상가에 필수적인 데코타일 3.0T의 내구성, 스톤/우드 패턴, 낱개 보수 장점과 견적 가이드를 제공합니다.",
    aiSummary: "상가, 사무실, 병원, 학원은 신발 마모와 가구 긁힘이 빈번하므로 3.0mm 두께의 데코타일 시공이 표준입니다. 대리석느낌의 600각 스톤 데코타일이나 실용적인 우드 데코타일이 가장 인기가 높습니다.",
    breadcrumb: [
      { label: "홈", link: "/" },
      { label: "바닥재 가이드", link: "/guide" },
      { label: "상가/사무실 바닥재" }
    ],
    sections: [
      {
        heading: "상가에 데코타일 3.0T를 사용하는 이유",
        content: "두께 3.0mm 데코타일은 강력한 표면 코팅층이 형성되어 신발에 묻은 흙먼지 마찰에도 변색이 없으며, 오염 발생 시 왁스 청소 및 물걸레질이 자유롭습니다."
      },
      {
        heading: "인기 디자인 트렌드: 600각 사각 스톤 데코타일",
        content: "최근 사무실 및 매장 인테리어 트렌드는 600mm x 600mm 대형 대리석/콘크리트 느낌 스톤 데코타일입니다. 공간이 넓어 보이고 세련된 무드를 연출합니다."
      }
    ],
    relatedCategory: "데코타일",
    faqs: ALL_GUIDE_FAQS.filter(f => f.category === "데코타일" || f.category === "비용")
  },

  "pet-flooring": {
    slug: "pet-flooring",
    categoryGroup: "space",
    title: "반려동물(강아지·고양이)이 있는 집 맞춤 바닥재",
    subtitle: "슬개골 탈구 예방 미끄럼 방지 엠보 & 배변 관리 쉬운 바닥재 추천",
    metaTitle: "반려동물이 있는 집 바닥재 추천 | 슬개골 방지 장판 | 동경바닥재",
    metaDescription: "반려견 발톱 긁힘 방지, 슬개골 탈구 예방 논슬립 엠보, 배변 실수도 손쉽게 닦아내는 친환경 고두께 장판 가이드입니다.",
    aiSummary: "반려견이 있는 가정은 미끄러짐으로 인한 슬개골 탈구를 방지하고 배변 실수가 틈새로 들어가지 않도록 표면 엠보 논슬립 처리가 된 3.2T~5.0T 롤 장판이 최고입니다. 마루 틈새 침수 부풀음 현상을 원천 방지할 수 있습니다.",
    breadcrumb: [
      { label: "홈", link: "/" },
      { label: "바닥재 가이드", link: "/guide" },
      { label: "반려동물 바닥재" }
    ],
    sections: [
      {
        heading: "1. 미끄럼 방지(논슬립) 엠보 처리",
        content: "강아지가 집안에서 뛰어놀 때 미끄러져 다치지 않도록 표면에 미세한 미끄럼 방지 패턴이 각인된 특수 PVC 시트 장판을 시공하세요."
      },
      {
        heading: "2. 배변 침투 없는 연속 면 시공",
        content: "마루나 타일처럼 조각 틈새가 있는 자재는 강아지 배변 수분이 사이로 스며들어 악취를 유발할 수 있습니다. 롤 장판은 틈새가 없어 깔끔한 위생 관리가 가능합니다."
      }
    ],
    relatedCategory: "장판",
    faqs: ALL_GUIDE_FAQS.filter(f => f.category === "장판" || f.category === "기본")
  },

  "vinyl-thickness": {
    slug: "vinyl-thickness",
    categoryGroup: "thickness",
    title: "장판 두께별 차이 총정리 (1.8T vs 2.2T vs 3.2T vs 4.5T)",
    subtitle: "두께에 따른 보행감, 쿠션감, 가격, 층간소음 완화 성능 비교",
    metaTitle: "장판 두께 선택 가이드 (1.8T~5.0T 차이와 추천) | 동경바닥재",
    metaDescription: "장판 두께 1.8T, 2.2T, 3.2T, 4.5T, 5.0T의 용도별 차이와 가격 대비 성능, 쿠션감, 층간 생활소음 완화 정도를 비교해 드립니다.",
    aiSummary: "장판 두께(T=mm)는 1.8T(원룸/임대용), 2.2T(일반 가정 표준), 3.2T(보행감/쿠션 강화), 4.5T~5.0T(소음 완화/프리미엄)로 구분됩니다. 두께가 두꺼워질수록 쿠션감과 층간 충격음 완화 효과가 커집니다.",
    breadcrumb: [
      { label: "홈", link: "/" },
      { label: "바닥재 가이드", link: "/guide" },
      { label: "장판 두께 가이드" }
    ],
    sections: [
      {
        heading: "1.8T (알뜰형)",
        content: "두께 1.8mm. 임대 주택, 원룸, 상가 창고, 베란다용 가성비 1등 바닥재입니다."
      },
      {
        heading: "2.2T (표준 가정용)",
        content: "두께 2.2mm. 대한민국 대부분 아파트/빌라 거실 및 방에 시공되는 가장 대중적인 표준 장판입니다."
      },
      {
        heading: "3.2T / 4.5T / 5.0T (고두께 프리미엄)",
        content: "고탄성 쿠션층이 함유되어 무릎 관절 보호, 폭신한 발촉감, 층간 충격음 완화 효과가 뛰어난 하이엔드 장판입니다."
      }
    ],
    relatedCategory: "장판",
    faqs: ALL_GUIDE_FAQS.filter(f => f.category === "장판")
  },

  "decotile-quantity": {
    slug: "decotile-quantity",
    categoryGroup: "price",
    title: "데코타일 필요 수량 및 박스 수 계산하는 법",
    subtitle: "평수 입력으로 예상 필요 박스 수와 자재비를 1초 만에 확인하세요",
    metaTitle: "데코타일 수량 계산기 | 평수 대비 필요 박스 수 계산 | 동경바닥재",
    metaDescription: "데코타일 1박스 면적(1평=3.31㎡) 기준, 재단 로스율(5~10%)을 고려한 정확한 데코타일 박스 수 수량 계산 공식과 실시간 계산기를 제공합니다.",
    aiSummary: "표준 데코타일 1박스는 약 3.31㎡(1평) 분량입니다. 필요 박스 수 공식은 [실평수 × 1.05 ~ 1.10(로스율)] 올림 계산입니다. 20평 기준 약 21~22박스를 주문하시는 것이 재단 실패 없는 최적의 수량입니다.",
    breadcrumb: [
      { label: "홈", link: "/" },
      { label: "바닥재 가이드", link: "/guide" },
      { label: "데코타일 수량 계산" }
    ],
    calculatorType: "decotile-quantity",
    sections: [
      {
        heading: "데코타일 규격과 박스 수 원리",
        content: "데코타일은 사각(457mm 또는 600mm) 및 우드(180mm x 920mm) 규격에 관계없이 보통 1박스당 약 3.31m²(1평 분량)로 포장되어 출고됩니다."
      },
      {
        heading: "재단 로스율(Loss Rate) 설정 노하우",
        content: "방 모양이 사각형에 가까우면 로스율 5%, 코너나 기둥, 복도가 복잡한 구조면 로스율 8~10%를 더해 박스 수를 올림 계산해야 시공 도중 자재가 모자라는 현상을 방지합니다."
      }
    ],
    relatedCategory: "데코타일",
    faqs: ALL_GUIDE_FAQS.filter(f => f.category === "데코타일" || f.category === "수량")
  }
};
