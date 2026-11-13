/**
 * 녹수 NOX LVT 3종 (오키드3000, 프라임1500, 에코홈2000) 상세페이지 전용 유틸리티 및 카탈로그 데이터
 * 기준: 오키드3000.pdf, 프라임1500.pdf, 에코홈2000.pdf, 사이트등록용_상품검수초안.json
 */

import { NOX_PRODUCT_DATA_109, NOX_PRODUCT_BY_CODE } from '../data/noxProductData.generated.js';

export const NOX_LINEUPS = {
  ORCHID_3000: '오키드3000',
  PRIME_1500: '프라임1500',
  ECOHOME_2000: '에코홈2000',
  SETAGRIP: '세타그립'
};

/**
 * 녹수 데코타일 제품인지 판별
 */
export function isNoxProduct(item) {
  if (!item) return false;
  const brand = String(item.brand || '').trim().toLowerCase();
  const category = String(item.category || '').trim();
  const id = String(item.id || '').toLowerCase();
  const code = String(item.code || item.product_code || '').trim().toUpperCase();

  const isBrandNox = brand.includes('녹수') || brand.includes('nox');
  const isCategoryDeco = category === '데코타일' || id.startsWith('데코타일-녹수-') || id.includes('녹수');
  const isNoxCode = NOX_PRODUCT_BY_CODE.has(code) || code.startsWith('NOW-') || code.startsWith('NOT-') || code.startsWith('NPW-') || code.startsWith('NPT-') || code.startsWith('NEH-') || code.startsWith('SGT-') || code.startsWith('SGW-');

  return (isBrandNox && isCategoryDeco) || id.startsWith('데코타일-녹수-') || isNoxCode;
}

/**
 * 녹수 라인업 반환
 */
export function getNoxLineup(item) {
  if (!item) return NOX_LINEUPS.ORCHID_3000;
  const code = String(item.code || item.product_code || '').trim().toUpperCase();
  const target = NOX_PRODUCT_BY_CODE.get(code);
  if (target) return target.lineup;

  const line = String(item.line || item.series || item.name || '').toLowerCase();
  const id = String(item.id || '').toLowerCase();

  if (line.includes('오키드') || line.includes('3000') || id.includes('오키드') || code.startsWith('NOW') || code.startsWith('NOT')) {
    return NOX_LINEUPS.ORCHID_3000;
  }
  if (line.includes('프라임') || line.includes('1500') || id.includes('프라임') || code.startsWith('NPW') || code.startsWith('NPT')) {
    return NOX_LINEUPS.PRIME_1500;
  }
  if (line.includes('에코홈') || line.includes('2000') || id.includes('에코홈') || code.startsWith('NEH')) {
    return NOX_LINEUPS.ECOHOME_2000;
  }
  if (line.includes('세타그립') || id.includes('세타그립') || code.startsWith('SG')) {
    return NOX_LINEUPS.SETAGRIP;
  }
  return NOX_LINEUPS.ORCHID_3000;
}

/**
 * 녹수 라인업별 규격 비교표 (카탈로그 공식 수치 100% 반영)
 */
export const NOX_LINEUP_SPECS = [
  // --- 오키드 3000 ---
  {
    lineup: '오키드3000',
    groupName: '프리미엄 우드 (Rustic Edge)',
    thickness: '3.0T',
    size: '152.4 × 914.4mm',
    pcs: '24장',
    area: '3.34㎡ (약 1.01평)',
    method: 'Dry Back (접착식)',
    codes: ['NOW-3051', 'NOW-3052'],
    note: 'Rustic Edge 엣지 정밀 가공'
  },
  {
    lineup: '오키드3000',
    groupName: '프리미엄 내추럴 스톤 (609.6형)',
    thickness: '3.0T',
    size: '609.6 × 609.6mm',
    pcs: '9장',
    area: '3.34㎡ (약 1.01평)',
    method: 'Dry Back (접착식)',
    codes: ['NOT-3071', 'NOT-3072'],
    note: 'Built-In-Grout 일체형 줄눈 디자인 (600각 아님)'
  },
  {
    lineup: '오키드3000',
    groupName: '프리미엄 내추럴 스톤 (장방형)',
    thickness: '3.0T',
    size: '457.2 × 914.4mm',
    pcs: '8장',
    area: '3.34㎡ (약 1.01평)',
    method: 'Dry Back (접착식)',
    codes: ['NOT-3073'],
    note: 'Built-In-Grout 대형 장방형 스톤'
  },
  {
    lineup: '오키드3000',
    groupName: '프리미엄 내추럴 페블 (동조엠보)',
    thickness: '3.0T',
    size: '457.2 × 457.2mm',
    pcs: '16장',
    area: '3.34㎡ (약 1.01평)',
    method: 'Dry Back (접착식)',
    codes: ['NOT-31001', 'NOT-31002', 'NOT-31003'],
    note: '입체 동조 엠보싱(EIR) 천연 자갈 질감'
  },
  {
    lineup: '오키드3000',
    groupName: '시그니처 Big Slab (914.4각)',
    thickness: '3.0T',
    size: '914.4 × 914.4mm',
    pcs: '6장',
    area: '5.02㎡ (약 1.52평)',
    method: 'Dry Back (접착식)',
    codes: ['NOT-3991', 'NOT-3993', 'NOT-3994', 'NOT-3995'],
    note: '국내 최대형 슬랩 치수 (600각 아님)'
  },
  {
    lineup: '오키드3000',
    groupName: '시그니처 장방형 슬랩',
    thickness: '3.0T',
    size: '457.2 × 914.4mm',
    pcs: '8장',
    area: '3.34㎡ (약 1.01평)',
    method: 'Dry Back (접착식)',
    codes: ['NOT-3491', 'NOT-3493', 'NOT-3494', 'NOT-3495'],
    note: '광폭 대형 장방형 슬랩 디자인'
  },
  {
    lineup: '오키드3000',
    groupName: '파켓 우드 (Parquet Wood)',
    thickness: '3.0T',
    size: '457.2 × 457.2mm',
    pcs: '15장',
    area: '3.14㎡ (약 0.95평)',
    method: 'Dry Back (접착식)',
    codes: ['NOW-3061'],
    note: '우드 패턴 사각 파켓 규격'
  },
  {
    lineup: '오키드3000',
    groupName: '우드 150 (슬림 우드)',
    thickness: '3.0T',
    size: '152.4 × 914.4mm',
    pcs: '24장',
    area: '3.34㎡ (약 1.01평)',
    method: 'Dry Back (접착식)',
    codes: ['NOW-3062'],
    note: '정통 150폭 클래식 오크'
  },
  {
    lineup: '오키드3000',
    groupName: '우드 186 (스탠다드 우드)',
    thickness: '3.0T',
    size: '186 × 940mm',
    pcs: '18장',
    area: '3.15㎡ (약 0.95평)',
    method: 'Dry Back (접착식)',
    codes: ['NOW-3003', 'NOW-3004', 'NOW-3063', 'NOW-3064'],
    note: '186폭 안정감 있는 원목 질감'
  },
  {
    lineup: '오키드3000',
    groupName: '와이드 우드 1200',
    thickness: '3.0T',
    size: '180 × 1200mm',
    pcs: '15장',
    area: '3.24㎡ (약 0.98평)',
    method: 'Dry Back (접착식)',
    codes: ['NOW-3065', 'NOW-3066'],
    note: '1200mm 장척 와이드 플랭크'
  },
  {
    lineup: '오키드3000',
    groupName: '스퀘어 600 (정사각 600각)',
    thickness: '3.0T',
    size: '600 × 600mm',
    pcs: '9장',
    area: '3.24㎡ (약 0.98평)',
    method: 'Dry Back (접착식)',
    codes: ['NOT-3629', 'NOT-3630', 'NOT-3631', 'NOT-3634', 'NOT-3635', 'NOT-3636', 'NOT-3637', 'NOT-3638', 'NOT-3639', 'NOT-3640', 'NOT-3641', 'NOT-3642', 'NOT-3643', 'NOT-3644'],
    note: '정사각 600 대리석·콘크리트'
  },
  {
    lineup: '오키드3000',
    groupName: '스퀘어 457.2 (정사각 450각)',
    thickness: '3.0T',
    size: '457.2 × 457.2mm',
    pcs: '15장',
    area: '3.14㎡ (약 0.95평)',
    method: 'Dry Back (접착식)',
    codes: ['NOT-3021', 'NOT-3022', 'NOT-3023', 'NOT-3027', 'NOT-3028', 'NOT-3029', 'NOT-3030', 'NOT-3031', 'NOT-3032', 'NOT-3033', 'NOT-3034', 'NOT-3039', 'NOT-3040', 'NOT-3041'],
    note: '457.2각 스톤·카펫·메탈 질감'
  },

  // --- 프라임 1500 ---
  {
    lineup: '프라임1500',
    groupName: '프라임 우드 (Wood)',
    thickness: '3.0T',
    size: '184 × 950mm',
    pcs: '19장',
    area: '3.32㎡ (약 1.00평)',
    method: 'Dry Back (접착식)',
    codes: ['NPW-0839', 'NPW-0841', 'NPW-1001', 'NPW-1002', 'NPW-1003', 'NPW-1005', 'NPW-1201', 'NPW-1202', 'NPW-6141'],
    note: '184×950 다색감 트렌드 우드'
  },
  {
    lineup: '프라임1500',
    groupName: '프라임 스퀘어 457.2',
    thickness: '3.0T',
    size: '457.2 × 457.2mm',
    pcs: '16장',
    area: '3.34㎡ (약 1.01평)',
    method: 'Dry Back (접착식)',
    codes: ['NPT-0281', 'NPT-0282', 'NPT-0611', 'NPT-0612', 'NPT-0613', 'NPT-0614', 'NPT-0615', 'NPT-0616', 'NPT-0617', 'NPT-0618', 'NPT-0619', 'NPT-0801', 'NPT-0803', 'NPT-0811', 'NPT-0821', 'NPT-0824', 'NPT-1011', 'NPT-1012', 'NPT-1021', 'NPT-1027'],
    note: '16장/3.34㎡ (교차 시공 권장 패턴 확인)'
  },
  {
    lineup: '프라임1500',
    groupName: '프라임 스퀘어 600',
    thickness: '3.0T',
    size: '600 × 600mm',
    pcs: '9장',
    area: '3.24㎡ (약 0.98평)',
    method: 'Dry Back (접착식)',
    codes: ['NPT-1625', 'NPT-1626', 'NPT-1627', 'NPT-1628', 'NPT-1629', 'NPT-1630', 'NPT-1631', 'NPT-1632', 'NPT-1635', 'NPT-1636', 'NPT-1637', 'NPT-1638'],
    note: '9장/3.24㎡ 정사각 스톤'
  },

  // --- 에코홈 2000 ---
  {
    lineup: '에코홈2000',
    groupName: '에코홈 우드 (Wood)',
    thickness: '3.0T',
    size: '180 × 920mm',
    pcs: '19장',
    area: '3.15㎡ (약 0.95평)',
    method: 'Dry Back (온돌난방 적합형)',
    codes: ['NEH-2004', 'NEH-2005', 'NEH-2006', 'NEH-2008', 'NEH-2011', 'NEH-2012', 'NEH-2014', 'NEH-2015', 'NEH-2017', 'NEH-2018'],
    note: '온돌 바닥난방 치수안정 보강'
  },
  {
    lineup: '에코홈2000',
    groupName: '에코홈 스톤 600 (Stone)',
    thickness: '3.0T',
    size: '600 × 600mm',
    pcs: '9장',
    area: '3.24㎡ (약 0.98평)',
    method: 'Dry Back (온돌난방 적합형)',
    codes: ['NEH-2613', 'NEH-2614', 'NEH-2616', 'NEH-2617', 'NEH-2618', 'NEH-2619'],
    note: '600각 모던 콘크리트·스톤'
  }
];

/**
 * 시공 전 유의사항 10개 번호 카드 (카탈로그 시공지침 수치 100% 반영)
 */
export const NOX_PRECAUTIONS = [
  {
    num: '01',
    title: '바탕면 사전 난방 및 건조',
    desc: '난방이 가능한 바탕면은 시공 7~14일 전 사전 난방을 가동하여 바닥 수분을 완전히 건조시켜야 하며, 비난방 바탕면은 충분한 양생 기간을 거쳐야 합니다.'
  },
  {
    num: '02',
    title: '바탕면 이물질 제거 및 평탄화',
    desc: '바탕면의 오염물질, 니스, 페인트, 모래가루, 요철을 완전히 제거하고, 균열이나 파손 부위는 시멘트 패치재로 평탄하게 보수해야 합니다.'
  },
  {
    num: '03',
    title: '시공 환경 온도 및 현장 적응',
    desc: '시공 장소의 온도는 최소 18°C 이상을 유지해야 하며, 타일과 접착제는 시공 현장에 24시간 이상 미리 보관하여 현장 온도에 적응시켜야 합니다.'
  },
  {
    num: '04',
    title: '동일 LOT(제조번호) 확인 시공',
    desc: '색상 차이 및 이색 현상을 방지하기 위해 동일 공간에는 반드시 동일한 LOT(제조번호)의 제품을 일괄 시공해야 합니다.'
  },
  {
    num: '05',
    title: '시공 전 바닥 난방 중지',
    desc: '바닥 난방이 가동 중인 공간은 접착제의 급격한 경화와 불완전 접착을 방지하기 위해 시공 최소 3시간 전에 난방을 중지해야 합니다.'
  },
  {
    num: '06',
    title: '조건별 지정 접착제 선택 및 도포',
    desc: '신축 건물, 바닥 난방 공간, 동절기 시공, 바닥 습도 5% 이상인 환경에는 유성 폴리우레탄(PU) 접착제를 사용하고, 일반 건조 장소에는 수성 아크릴 접착제를 사용하며 표준 도포량(1.3~1.5kg/평, 0.40~0.45kg/㎡)을 준수합니다.'
  },
  {
    num: '07',
    title: '표면 접착제 즉시 제거 및 롤러 압착',
    desc: '타일 표면에 묻은 접착제는 굳기 전에 즉시 닦아내고, 시공 직후 50kg 이상의 롤러로 전체 면적을 균일하게 전면 압착하여 들뜸을 방지합니다.'
  },
  {
    num: '08',
    title: '시공 후 48시간 난방 가동 금지',
    desc: '타일 접착제가 충분히 경화될 때까지 시공 완료 후 48시간 이내에는 바닥 난방 가동을 엄격히 금지합니다.'
  },
  {
    num: '09',
    title: '시공 후 24시간 가구 배치 금지',
    desc: '접착 안정화를 위해 시공 후 24시간 동안은 중량 가구 배치 및 과도한 통행을 제한하고 충분한 양생 시간을 확보해야 합니다.'
  },
  {
    num: '10',
    title: '중성세제 유지관리 및 수분 유입 방지',
    desc: '일상 청소 및 유지관리 시 중성세제를 사용하며, 과도한 물청소나 틈새 이음부로의 수분 유입을 주의하여 자재 변형을 방지합니다.'
  }
];

/**
 * 제품 구조 5개 계층
 */
export const NOX_STRUCTURE_LAYERS = [
  {
    layer: 'Layer 01',
    name: '고강도 UV EPT™ Shield 코팅층',
    desc: '표면 오염 방지 및 스크래치 내구성을 대폭 강화하여 일상 관리의 편의성을 극대화합니다.'
  },
  {
    layer: 'Layer 02',
    name: '고내마모성 투명 Wear Layer',
    desc: '통행량이 많은 공간에서도 디자인 인쇄층을 오랫동안 투명하고 깨끗하게 보호합니다.'
  },
  {
    layer: 'Layer 03',
    name: '초고해상도 HD 디자인 인쇄층',
    desc: '천연 원목의 섬세한 나뭇결, 대리석 및 천연석의 입체적 질감을 정밀하게 재현합니다.'
  },
  {
    layer: 'Layer 04',
    name: '고밀도 치수안정 코어 EMT™ Core',
    desc: '열팽창 및 수축 변형을 최소화하는 특수 코어 구조로 온돌 바닥 및 상업 공간 환경에 우수한 치수안정성을 제공합니다.'
  },
  {
    layer: 'Layer 05',
    name: '밸런스 백킹층 (Balance Backing)',
    desc: '바탕면과의 접착력을 극대화하고 바닥 하중을 안정적으로 분산시켜 뒤틀림을 방지합니다.'
  }
];

/**
 * 상세페이지 종합 정보 생성 함수
 */
export function getNoxDetailInfo(item) {
  if (!item) return null;
  const rawCode = String(item.code || item.product_code || '').trim().toUpperCase();
  const target = NOX_PRODUCT_BY_CODE.get(rawCode);

  const lineup = target ? target.lineup : getNoxLineup(item);
  const code = target ? target.code : rawCode;
  const pattern = target ? target.pattern : (item.pattern || '');
  const productName = target ? target.productName : (item.name || `NOX ${lineup} ${code}`);
  const group = target ? target.group : (item.line || 'LVT 데코타일');

  const thickness = target ? target.thickness : '3.0T';
  const size = target ? target.size : (item.specs?.size || '규격 확인 필요');
  const pcs_per_box = target ? `${target.pcs_per_box}장` : (item.specs?.packing ? item.specs.packing.split('(')[0] : '확인 필요');
  const packing = target ? target.packing : (item.specs?.packing || '확인 필요');
  const area = target ? target.area : '확인 필요';
  const pyeong = target ? target.pyeong : '확인 필요';

  // 권장 접착제 안내
  let adhesive = '조건별 제조사 지정 접착제 (신축/난방/동절기: PU 접착제 권장, 일반 상업공간: 수성 아크릴 접착제, 표준 도포량 1.3~1.5kg/평)';
  if (lineup === NOX_LINEUPS.ECOHOME_2000) {
    adhesive = '유성 폴리우레탄(PU) 접착제 (바닥난방/신축 건물 권장) 또는 수성 아크릴 접착제 (일반 장소, 표준 도포량 1.3~1.5kg/평)';
  }

  // 4개 특장점 카드 생성
  const features = [];
  if (lineup === NOX_LINEUPS.ORCHID_3000) {
    if (target?.isRusticEdge) {
      features.push({
        title: 'Rustic Edge 정밀 가공',
        desc: '모서리 엣지 특수 면취 가공을 통해 원목 플랭크의 자연스러운 깊이감과 공간 입체감을 구현합니다.'
      });
    } else if (target?.isBuiltInGrout) {
      features.push({
        title: 'Built-In-Grout 일체형 줄눈',
        desc: '타일 자체에 일체형 줄눈 디자인이 적용되어 별도의 줄눈 시공 없이도 정교한 석재 타일 바닥을 완성합니다.'
      });
    } else if (target?.isEir) {
      features.push({
        title: '입체 동조 엠보싱 (EIR)',
        desc: '자연 자갈 및 천연석의 디자인 패턴과 표면 엠보싱 텍스처를 1:1로 정밀 일치시켜 실물과 같은 질감을 선사합니다.'
      });
    } else if (target?.isBigSlab) {
      features.push({
        title: '시그니처 Big Slab 초대형 규격',
        desc: '914.4 × 914.4mm의 국내 최대형 규격으로 이음새를 최소화하고 웅장한 대공간 인테리어를 연출합니다.'
      });
    } else {
      features.push({
        title: '프리미엄 상업공간 컬렉션',
        desc: '백화점, 호텔, 오피스 등 보행량이 많은 고급 상업시설에 최적화된 프리미엄 LVT 컬렉션입니다.'
      });
    }

    features.push(
      {
        title: '고강도 EPT™ Shield 표면 코팅',
        desc: '오염 및 마모에 강한 고밀도 항오염 UV 코팅으로 일상적인 관리 부담을 줄이고 오랜 내구성을 제공합니다.'
      },
      {
        title: '치수안정 EMT™ Core 구조',
        desc: '온도 변화에 의한 팽창 및 수축 변형을 최소화하는 특수 다층 코어 설계로 바닥 안정성을 유지합니다.'
      },
      {
        title: '친환경 지속가능 LVT+GREEN',
        desc: '녹수 친환경 원료 배합 및 제조 공정을 적용하여 실내 쾌적성을 높인 지속가능 바닥재입니다.'
      }
    );
  } else if (lineup === NOX_LINEUPS.PRIME_1500) {
    features.push(
      {
        title: '디자인 보호층 50% 강화',
        desc: '기존 대비 50% 강화된 표면 투명 보호층으로 생활 스크래치와 마모로부터 패턴을 선명하게 보호합니다.'
      },
      {
        title: '글로벌 트렌드 다색감 디자인',
        desc: '해외 선정 트렌드 패턴과 다양한 톤의 컬러감을 조합하여 모던하고 감각적인 공간을 완성합니다.'
      },
      {
        title: target?.isCrossInstall ? '패턴 특성에 따른 교차 시공 권장' : 'EMT™ Core 고밀도 코어 기술',
        desc: target?.isCrossInstall 
          ? '해당 패턴 고유의 질감 효과를 극대화하기 위해 지그재그 교차(Brick/Quarter-turn) 시공을 권장합니다.'
          : '우수한 평탄도와 치수 안정성을 유지하는 고밀도 코어로 상업 및 업무공간에 적합합니다.'
      },
      {
        title: '간편한 유지관리 및 위생성',
        desc: 'EPT™ Shield 코팅으로 오염물이 쉽게 흡착되지 않아 일상 청소 및 위생 관리가 편리합니다.'
      }
    );
  } else {
    // 에코홈 2000
    features.push(
      {
        title: '온돌난방 환경 최적화 설계',
        desc: '국내 온돌 바닥난방 환경을 고려하여 열전도율과 치수 안정성을 동시에 만족하는 주거·상업 복합 타일입니다.'
      },
      {
        title: '치수안정 보강층 (Dimension Stabilizer)',
        desc: '난방 가동에 따른 수축 및 팽창을 억제하는 보강층을 적용하여 틈 벌어짐과 들뜸을 방지합니다.'
      },
      {
        title: '실용적인 우드 & 600 스톤 구성',
        desc: '자연스러운 180×920 우드와 모던한 600×600 스톤 패턴으로 깔끔하고 편안한 분위기를 조성합니다.'
      },
      {
        title: '합리적인 시공성과 경제성',
        desc: 'Dry Back 접착식 시공으로 빠른 작업성과 뛰어난 유지관리 편의성을 제공합니다.'
      }
    );
  }

  // 공간 적용 예시
  const spaces = [];
  if (target?.sceneImage) {
    spaces.push({
      title: '카탈로그 공간 연출 이미지',
      subtitle: `녹수 ${lineup} 카탈로그 p.${target.page} 수록 연출 이미지 (실제 완료 시공 사진이 아닌 카탈로그 인테리어 연출 공간입니다)`,
      image: target.sceneImage,
      isCatalogScene: true
    });
  }

  // 라인업 비교표 필터링 (현재 라인업의 규격들만 모아서 표시)
  const comparisonTable = NOX_LINEUP_SPECS.filter(specRow => specRow.lineup === lineup);

  return {
    code,
    lineup,
    group,
    productName,
    pattern,
    spec: {
      brand: '녹수 / NOX',
      lineup: `${lineup} (${group})`,
      productCode: code,
      designType: pattern || group,
      thickness,
      size,
      pcs_per_box,
      packing,
      area,
      pyeong,
      materialType: 'LVT 데코타일',
      method: lineup === NOX_LINEUPS.ECOHOME_2000 ? 'Dry Back (온돌난방 적합형)' : 'Dry Back (접착식)',
      adhesive
    },
    swatchImage: target?.swatchImage || null,
    existingJpg: target?.existingJpg || null,
    sceneImage: target?.sceneImage || null,
    page: target?.page || null,
    pdf: target?.pdf || null,
    features,
    layers: NOX_STRUCTURE_LAYERS,
    spaces,
    comparisonTable,
    isRusticEdge: target?.isRusticEdge || false,
    isBuiltInGrout: target?.isBuiltInGrout || false,
    isEir: target?.isEir || false,
    isBigSlab: target?.isBigSlab || false,
    isParquet: target?.isParquet || false,
    isCrossInstall: target?.isCrossInstall || false
  };
}
