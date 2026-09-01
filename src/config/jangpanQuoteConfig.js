/**
 * 동경바닥재 장판 자동 견적 계산기 설정 데이터 (Data & Rate Config)
 * 추후 Supabase DB 연동 또는 관리자 페이지에서 확장 가능하도록 별도 분리
 */

export const JANGPAN_PRODUCTS_CONFIG = [
  {
    id: "newcheongmaek-18",
    name: "뉴청맥",
    thickness: "1.8T",
    brand: "LX",
    category: "장판",
    materialPricePerMeter: 12000,
    installedPricePerPyeong: 31000,
    laborBaseUnitCost: 9000,
    laborBrackets: {
      upTo10: 120000,
      upTo15: 150000,
      over15: 180000
    },
    specs: "1.8mm 두께",
    description: "LX 하우시스 뉴청맥 1.8mm 실속형 모던 바닥재"
  },
  {
    id: "eunhaengmok-20",
    name: "은행목",
    thickness: "2.0T",
    brand: "LX",
    category: "장판",
    materialPricePerMeter: 18000,
    installedPricePerPyeong: 42000,
    laborBaseUnitCost: 9000,
    laborBrackets: {
      upTo10: 120000,
      upTo15: 150000,
      over15: 180000
    },
    specs: "2.0mm 두께",
    description: "LX 하우시스 은행목 2.0mm 내구성 바닥재"
  },
  {
    id: "jayeonae-22",
    name: "자연애",
    thickness: "2.2T",
    brand: "LX",
    category: "장판",
    materialPricePerMeter: 23000,
    installedPricePerPyeong: 53000,
    laborBaseUnitCost: 11000,
    laborBrackets: {
      upTo10: 150000,
      upTo15: 180000,
      over15: 220000
    },
    specs: "2.2mm 두께",
    description: "LX 하우시스 자연애 2.2mm 베스트셀러 바닥재"
  },
  {
    id: "jiasarangae-27",
    name: "지아사랑애",
    thickness: "2.7T",
    brand: "LX",
    category: "장판",
    materialPricePerMeter: 34000,
    installedPricePerPyeong: 73000,
    laborBaseUnitCost: 12000,
    laborBrackets: {
      upTo10: 160000,
      upTo15: 200000,
      over15: 240000
    },
    specs: "2.7mm 두께",
    description: "LX 하우시스 지아사랑애 2.7mm 프리미엄 친환경 바닥재"
  },
  {
    id: "jiasarangae-32",
    name: "지아사랑애",
    thickness: "3.2T",
    brand: "LX",
    category: "장판",
    materialPricePerMeter: 38000,
    installedPricePerPyeong: 81000,
    laborBaseUnitCost: 13000,
    laborBrackets: {
      upTo10: 170000,
      upTo15: 220000,
      over15: 260000
    },
    specs: "3.2mm 두께",
    description: "LX 하우시스 지아사랑애 3.2mm 쿠션감 강화 바닥재"
  },
  {
    id: "jiasorijam-45",
    name: "지아소리잠",
    thickness: "4.5T",
    brand: "LX",
    category: "장판",
    materialPricePerMeter: 47000,
    installedPricePerPyeong: 100000,
    laborBaseUnitCost: 16000,
    laborBrackets: {
      upTo10: 210000,
      upTo15: 270000,
      over15: 320000
    },
    specs: "4.5mm 두께",
    description: "LX 하우시스 지아소리잠 4.5mm 층간소음 저감 바닥재"
  },
  {
    id: "xcomfort-50",
    name: "엑스컴포트",
    thickness: "5.0T",
    brand: "LX",
    category: "장판",
    materialPricePerMeter: 53000,
    installedPricePerPyeong: 114000,
    laborBaseUnitCost: 18000,
    laborBrackets: {
      upTo10: 240000,
      upTo15: 300000,
      over15: 360000
    },
    specs: "5.0mm 두께",
    description: "LX 하우시스 엑스컴포트 5.0mm 2중 쿠션 럭셔리 바닥재"
  }
];

export const JANGPAN_ACCESSORIES_CONFIG = [
  {
    id: "acc-nonslip",
    name: "논슬립 경보",
    unit: "EA",
    materialPrice: 3000,
    installedPrice: 5000,
    description: "계단 및 턱 마감용 논슬립 경보"
  },
  {
    id: "acc-suji",
    name: "수지마감재",
    unit: "EA",
    materialPrice: 3000,
    installedPrice: 5000,
    description: "장판 몰딩/벽면 경계 수지 마감재"
  },
  {
    id: "acc-silicone",
    name: "실리콘",
    unit: "EA",
    materialPrice: 3000,
    installedPrice: 5000,
    description: "코너 및 모서리 밀봉 바이오 실리콘"
  }
];
