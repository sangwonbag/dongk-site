// scripts/buildProductSearchMetadata.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

// 보조 데이터 로드
let lxNames = {};
try {
  lxNames = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'lx_names.json'), 'utf8'));
} catch {}

// 1. 색상 분류 사전 (요구사항 2-A 완벽 지원)
export const COLOR_TAXONOMY = {
  beige: {
    family: '베이지',
    keywords: ['베이지', '아이보리', '크림', '샌드', '웜베이지', '미색', '오트밀', '바닐라', '린넨베이지', '라떼', '비스크', '토프', '오트', '밀크티', '클라우드크림'],
    tone: '웜톤',
    brightness: '밝음'
  },
  white: {
    family: '화이트',
    keywords: ['화이트', '백색', '순백', '오프화이트', '밀크화이트', '스노우화이트', '스노우', '올화이트', '화이트펄', '크리스탈', '블랑', '비앙코'],
    tone: '뉴트럴',
    brightness: '밝음'
  },
  gray: {
    family: '그레이',
    keywords: ['그레이', '회색', '라이트그레이', '다크그레이', '애쉬', '쿨그레이', '웜그레이', '차콜', '스톤그레이', '시멘트그레이', '어반그레이', '실버', '텐더그레이', '유로그레이', '미드그레이'],
    tone: '쿨톤',
    brightness: '중간'
  },
  black: {
    family: '블랙',
    keywords: ['블랙', '검정', '딥블랙', '차콜블랙', '매트블랙', '흑색', '미드나잇', '다크블랙', '오닉스'],
    tone: '다크',
    brightness: '어두움'
  },
  brown: {
    family: '브라운',
    keywords: ['브라운', '갈색', '초코', '월넛', '모카', '다크브라운', '체스넛', '마호가니', '커피', '시나몬', '카멜'],
    tone: '웜톤',
    brightness: '어두움'
  },
  wood: {
    family: '우드',
    keywords: ['우드', '오크', '화이트오크', '내추럴오크', '티크', '원목', '나뭇결', '메이플', '비치', '체리', '아카시아', '버치', '엘름', '쪽마루'],
    tone: '내추럴',
    brightness: '중간'
  },
  green: {
    family: '그린',
    keywords: ['그린', '녹색', '초록', '올리브', '세이지', '민트', '포레스트', '카키', '에메랄드', '세이지그린'],
    tone: '내추럴',
    brightness: '중간'
  },
  lime: {
    family: '라임',
    keywords: ['라임', '라임그린', '연두', '라이트그린', '옐로우그린'],
    tone: '소프트',
    brightness: '밝음'
  },
  blue: {
    family: '블루',
    keywords: ['블루', '파랑', '네이비', '스카이블루', '딥블루', '인디고', '오션', '청색', '소프트블루'],
    tone: '쿨톤',
    brightness: '중간'
  },
  pink: {
    family: '핑크',
    keywords: ['핑크', '분홍', '로즈', '연핑크', '베이비핑크', '코랄', '피치', '살구', '로즈골드', '인디핑크'],
    tone: '웜톤',
    brightness: '밝음'
  },
  yellow: {
    family: '옐로우',
    keywords: ['옐로우', '노랑', '머스타드', '레몬', '골드', '버터'],
    tone: '웜톤',
    brightness: '밝음'
  }
};

// 2. 질감 및 패턴 사전 (요구사항 2-B 완벽 지원)
export const PATTERN_TAXONOMY = {
  concrete: {
    type: '콘크리트',
    keywords: ['콘크리트', '시멘트', '노출콘크리트', '몰탈', '레진', '인더스트리얼', '텍스처콘크리트', '시멘트스톤', '포틀랜드']
  },
  stone: {
    type: '스톤/대리석',
    keywords: ['스톤', '대리석', '마블', '석재', '비앙코', '슬레이트', '트래버틴', '화강암', '쿼츠', '화산석', '그라니트', '그래니트', '세라믹', '회벽', '스톤그레이', '마일드스톤']
  },
  terrazzo: {
    type: '테라조',
    keywords: ['테라조', '칩', '칩패턴', '그란데 테라조', '그란데테라조', '도트스톤', '테라조타일', '내추럴테라조']
  },
  wood: {
    type: '우드',
    keywords: ['우드', '원목', '나뭇결', '플랭크', '쪽마루', '판재', '오크패턴', '나무', '오크', '월넛', '티크', '애쉬', '엘름', '강마루']
  },
  herringbone: {
    type: '헤링본',
    keywords: ['헤링본', '쉐브론', '지그재그']
  },
  fabric: {
    type: '패브릭',
    keywords: ['패브릭', '직물', '린넨', '위빙', '캔버스', '카페트', '카펫질감', '우븐', '카펫', '텍스타일', '브러쉬카펫', '타일카페트']
  },
  solid: {
    type: '솔리드/무지',
    keywords: ['솔리드', '무지', '단색', '플레인', '페인트', '페인팅', '모노톤']
  },
  vintage: {
    type: '빈티지',
    keywords: ['빈티지', '러스틱', '앤틱', '에이징', '고재', '앤틱우드']
  },
  geometric: {
    type: '기하학/체크',
    keywords: ['체크', '격자', '기하학', '도트', '모자이크', '패치워크']
  }
};

// 3. 표면 마감
export const FINISH_TAXONOMY = {
  matte: {
    finish: '무광',
    keywords: ['무광', '매트', '소프트매트', '자연광', '딥매트']
  },
  satin: {
    finish: '반광',
    keywords: ['은은한 광택', '반광', '새틴', '소프트새틴']
  },
  gloss: {
    finish: '유광',
    keywords: ['유광', '고광택', '하이글로시', '광택']
  }
};

// 4. 공간 및 용도 태그 (요구사항 2-C 완벽 지원)
export const SPACE_USAGE_RULES = [
  {
    tag: '사무실',
    keywords: ['사무실', '오피스', '업무시설', '회의실', '상업공간', 'oa', '사무실바닥', '오피스텔', '빌딩', '상업용'],
    categoryBonus: ['데코타일', '카페트타일', '디럭스타일']
  },
  {
    tag: '카페',
    keywords: ['카페', '매장', '식당', '상가', '쇼룸', '상업용', '카페인테리어', '상업공간', '상업용바닥재', '트렌디'],
    categoryBonus: ['데코타일', '마루']
  },
  {
    tag: '거실',
    keywords: ['거실', '주거용', '아파트', '빌라', '침실', '가정용', '거실바닥', '주택', '방', '안방'],
    categoryBonus: ['장판', '마루', '벽지']
  },
  {
    tag: '헬스장',
    keywords: ['헬스장', '피트니스', '체육관', '스포츠', '충격흡수', '중보행', '헬스장바닥', '체육시설', '웨이트'],
    categoryBonus: ['러버타일']
  },
  {
    tag: '학원/교육시설',
    keywords: ['학원', '어린이집', '유치원', '학교', '강의실', '차음', '소음저감', '학원바닥', '교실'],
    categoryBonus: ['장판', '데코타일']
  },
  {
    tag: '병원/의료시설',
    keywords: ['병원', '의원', '클리닉', '요양원', '항균', '병원바닥', '의료시설', '청결'],
    categoryBonus: ['장판', '데코타일']
  }
];

// 5. 분위기 및 스타일 태그 (요구사항 2-C)
export const STYLE_MOOD_RULES = [
  {
    tag: '따뜻한 분위기',
    conditions: { colors: ['베이지', '브라운', '우드', '핑크'], tone: '웜톤' },
    keywords: ['따뜻한', '아늑한', '포근한', '편안한', '온화한', '따스한', '웜톤']
  },
  {
    tag: '차가운 분위기',
    conditions: { colors: ['그레이', '블랙', '블루'], tone: '쿨톤' },
    keywords: ['차가운', '시크한', '도시적인', '쿨', '도회적', '쿨톤']
  },
  {
    tag: '모던한',
    conditions: { patterns: ['콘크리트', '스톤/대리석', '솔리드/무지'] },
    keywords: ['모던', '현대적인', '세련된', '심플한', '도시적']
  },
  {
    tag: '미니멀한',
    conditions: { colors: ['화이트', '그레이'], patterns: ['솔리드/무지', '콘크리트'] },
    keywords: ['미니멀', '간결한', '깔끔한', '단정한']
  },
  {
    tag: '내추럴한',
    conditions: { patterns: ['우드', '패브릭'], colors: ['우드', '베이지', '그린'] },
    keywords: ['내추럴', '자연스러운', '자연친화', '원목느낌', '자연']
  },
  {
    tag: '고급스러운',
    conditions: { patterns: ['스톤/대리석', '테라조'], keywords: ['고급', '프리미엄', '럭셔리', '대리석', '호텔'] },
    keywords: ['고급스러운', '프리미엄', '호텔', '럭셔리', '중후한']
  },
  {
    tag: '밝고 화사한',
    conditions: { brightness: '밝음', colors: ['화이트', '베이지', '옐로우', '핑크', '라임'] },
    keywords: ['밝은', '화사한', '산뜻한', '환한', '쾌적한']
  },
  {
    tag: '차분한',
    conditions: { brightness: '어두움', colors: ['그레이', '블랙', '브라운'] },
    keywords: ['차분한', '정돈된', '안정감', '묵직한', '깊이있는']
  }
];

export function extractProductMetadata(product) {
  const code = String(product.code || product.product_code || '').trim();
  const rawName = String(product.name || product.product_name || product.productName || '').trim();
  const brand = String(product.brand || '').trim();
  const category = String(product.category || '').trim();
  const line = String(product.line || product.subLine || product.series || '').trim();
  const desc = String(product.description || '').trim();
  const usage = String(product.specs?.usage || '').trim();
  const size = String(product.size_text || product.specs?.size || product.shape || '').trim();

  // LX 장판 코드 카탈로그 보완 (예: CM24731 -> 뉴청맥 내추럴 화이트)
  let enrichedName = rawName;
  const digitsOnly = code.replace(/\D/g, '');
  if (!enrichedName && lxNames[digitsOnly]) {
    enrichedName = lxNames[digitsOnly];
  } else if (!enrichedName && lxNames[code]) {
    enrichedName = lxNames[code];
  }

  const combinedText = `${enrichedName} ${code} ${brand} ${category} ${line} ${desc} ${usage} ${size}`.toLowerCase();

  // A. 색상 추출
  let detectedFamily = null;
  let detectedDetail = null;
  let detectedTone = null;
  let detectedBrightness = null;

  // 특수 케이스: '라임' 처리 (라임오크 vs 라임/연두)
  const isLimeWood = /라임\s*오크|라임오크/.test(combinedText);
  const isPureLime = /라임(?!오크)|라이트그린|연두|옐로우그린/.test(combinedText);

  if (isPureLime) {
    detectedFamily = '라임';
    detectedDetail = '라임';
    detectedTone = '소프트';
    detectedBrightness = '밝음';
  } else if (isLimeWood) {
    detectedFamily = '우드';
    detectedDetail = '라임오크';
    detectedTone = '내추럴';
    detectedBrightness = '밝음';
  } else {
    for (const [key, conf] of Object.entries(COLOR_TAXONOMY)) {
      for (const kw of conf.keywords) {
        if (combinedText.includes(kw)) {
          detectedFamily = conf.family;
          detectedDetail = kw;
          detectedTone = conf.tone;
          detectedBrightness = conf.brightness;
          break;
        }
      }
      if (detectedFamily) break;
    }
  }

  // B. 패턴 및 질감 추출
  let detectedPattern = null;
  let detectedTexture = null;

  for (const [key, conf] of Object.entries(PATTERN_TAXONOMY)) {
    for (const kw of conf.keywords) {
      if (combinedText.includes(kw)) {
        detectedPattern = conf.type;
        detectedTexture = kw;
        break;
      }
    }
    if (detectedPattern) break;
  }

  // 카테고리 & 라인 기본 패턴 추론
  if (!detectedPattern) {
    if (category === '마루') {
      detectedPattern = '우드';
      detectedTexture = '원목/나뭇결';
    } else if (category === '카페트타일') {
      detectedPattern = '패브릭';
      detectedTexture = '직물';
    } else if (line.includes('우드') || line.includes('wood') || code.startsWith('AB') || code.startsWith('B0')) {
      detectedPattern = '우드';
      detectedTexture = '나뭇결';
    } else if (category === '벽지') {
      if (/실크|디아망|베스띠/.test(combinedText)) {
        detectedPattern = '패브릭';
        detectedTexture = '엠보/질감';
      } else {
        detectedPattern = '솔리드/무지';
        detectedTexture = '플레인';
      }
    } else if (category === '데코타일' && /사각|450|600|as|ts/.test(combinedText)) {
      detectedPattern = '스톤/대리석';
      detectedTexture = '스톤';
    }
  }

  // 색상 기본값 추론 (패턴 기반 보조)
  if (!detectedFamily) {
    if (detectedPattern === '우드') {
      detectedFamily = '우드';
      detectedDetail = '오크';
      detectedTone = '내추럴';
      detectedBrightness = '중간';
    } else if (detectedPattern === '콘크리트') {
      detectedFamily = '그레이';
      detectedDetail = '라이트그레이';
      detectedTone = '쿨톤';
      detectedBrightness = '중간';
    } else if (category === '벽지') {
      detectedFamily = '화이트';
      detectedDetail = '화이트';
      detectedTone = '뉴트럴';
      detectedBrightness = '밝음';
    }
  }

  // C. 표면 마감
  let detectedFinish = null;
  for (const [key, conf] of Object.entries(FINISH_TAXONOMY)) {
    for (const kw of conf.keywords) {
      if (combinedText.includes(kw)) {
        detectedFinish = conf.finish;
        break;
      }
    }
    if (detectedFinish) break;
  }
  if (!detectedFinish) {
    detectedFinish = '무광'; // 대다수 데코타일/장판/벽지/강마루 기본 마감
  }

  // D. 공간 태그 추출
  const spaceTags = new Set();
  for (const rule of SPACE_USAGE_RULES) {
    const kwHit = rule.keywords.some(kw => combinedText.includes(kw));
    if (kwHit) {
      spaceTags.add(rule.tag);
    }
    if (rule.categoryBonus.includes(category)) {
      if (rule.tag === '사무실' && (category === '카페트타일' || category === '디럭스타일' || (category === '데코타일' && (line.includes('사각') || line.includes('oa') || code.startsWith('OA'))))) {
        spaceTags.add('사무실');
      }
      if (rule.tag === '거실' && (category === '장판' || category === '마루' || category === '벽지' || (category === '데코타일' && line.includes('우드')))) {
        spaceTags.add('거실');
      }
      if (rule.tag === '카페' && (category === '데코타일' || (category === '마루' && /광폭|스톤/.test(combinedText)))) {
        spaceTags.add('카페');
      }
      if (rule.tag === '학원/교육시설' && (category === '장판' || (category === '데코타일' && line.includes('차음')))) {
        spaceTags.add('학원/교육시설');
      }
      if (rule.tag === '병원/의료시설' && (category === '장판' && /항균|소리잠/.test(combinedText))) {
        spaceTags.add('병원/의료시설');
      }
      if (rule.tag === '헬스장' && (category === '러버타일' || (category === '데코타일' && /중보행|5\.0/.test(combinedText)))) {
        spaceTags.add('헬스장');
      }
    }
  }

  // E. 분위기 및 스타일 태그 추출
  const styleTags = new Set();
  for (const rule of STYLE_MOOD_RULES) {
    let matches = false;
    if (rule.keywords.some(kw => combinedText.includes(kw))) {
      matches = true;
    }
    if (rule.conditions) {
      const cMatch = !rule.conditions.colors || (detectedFamily && rule.conditions.colors.includes(detectedFamily));
      const pMatch = !rule.conditions.patterns || (detectedPattern && rule.conditions.patterns.includes(detectedPattern));
      const bMatch = !rule.conditions.brightness || (detectedBrightness === rule.conditions.brightness);
      const tMatch = !rule.conditions.tone || (detectedTone === rule.conditions.tone);
      if (cMatch && pMatch && bMatch && tMatch) {
        matches = true;
      }
    }
    if (matches) {
      styleTags.add(rule.tag);
    }
  }

  // F. 규격 감지
  let specTag = null;
  if (/600각|600\s*[x×]\s*600/i.test(combinedText)) {
    specTag = '600각';
  } else if (/450각|457\.?2?각|450\s*[x×]\s*450/i.test(combinedText)) {
    specTag = '450각';
  }

  // G. 검색 키워드 및 별칭 수집
  const searchKeywords = new Set();
  if (detectedFamily) searchKeywords.add(detectedFamily);
  if (detectedDetail && detectedDetail !== detectedFamily) searchKeywords.add(detectedDetail);
  if (detectedPattern) searchKeywords.add(detectedPattern);
  if (detectedTexture && detectedTexture !== detectedPattern) searchKeywords.add(detectedTexture);
  if (detectedFinish) searchKeywords.add(detectedFinish);
  if (specTag) searchKeywords.add(specTag);
  for (const s of spaceTags) searchKeywords.add(s);
  for (const st of styleTags) searchKeywords.add(st);

  // Confidence & Source
  const confidence = (desc || enrichedName) ? 0.95 : 0.85;

  return {
    product_id: product.id || product.code,
    brand,
    category,
    product_name: enrichedName || rawName,
    product_code: code,
    series: product.series || '',
    line,
    color_family: detectedFamily || 'unknown',
    color_detail: detectedDetail || '',
    brightness: detectedBrightness || '중간',
    tone: detectedTone || '뉴트럴',
    pattern_type: detectedPattern || 'unknown',
    texture: detectedTexture || '',
    finish: detectedFinish || '무광',
    style_tags: Array.from(styleTags),
    space_tags: Array.from(spaceTags),
    usage_tags: category === '데코타일' || category === '카페트타일' ? ['상업용', '주거겸용'] : ['주거용'],
    spec_tag: specTag,
    search_aliases: [code, enrichedName, `${brand} ${code}`, `${brand} ${enrichedName}`].filter(Boolean),
    search_keywords: Array.from(searchKeywords),
    metadata_source: desc ? 'catalog' : 'rule_engine',
    metadata_confidence: confidence
  };
}

async function run() {
  console.log('■ 상품 검색 메타데이터 추출 시작...');
  const { materials } = await import('../src/data/materials.db.js');
  console.log(`총 ${materials.length}개 상품 데이터 로드 완료`);

  const metadataList = [];
  const metadataByCode = {};
  const metadataById = {};

  let colorCount = 0;
  let patternCount = 0;
  let styleCount = 0;
  let spaceCount = 0;

  for (const item of materials) {
    const meta = extractProductMetadata(item);
    metadataList.push(meta);

    if (meta.color_family !== 'unknown') colorCount++;
    if (meta.pattern_type !== 'unknown') patternCount++;
    if (meta.style_tags.length > 0) styleCount++;
    if (meta.space_tags.length > 0) spaceCount++;

    const codeKey = (meta.product_code || '').trim().toUpperCase();
    if (codeKey) metadataByCode[codeKey] = meta;

    const idKey = String(meta.product_id).trim().toLowerCase();
    if (idKey) metadataById[idKey] = meta;
  }

  console.log(`- 색상 분류 완료 상품: ${colorCount}개 (${Math.round((colorCount / materials.length) * 100)}%)`);
  console.log(`- 패턴 분류 완료 상품: ${patternCount}개 (${Math.round((patternCount / materials.length) * 100)}%)`);
  console.log(`- 분위기/스타일 태그 부여 상품: ${styleCount}개 (${Math.round((styleCount / materials.length) * 100)}%)`);
  console.log(`- 공간/용도 태그 부여 상품: ${spaceCount}개 (${Math.round((spaceCount / materials.length) * 100)}%)`);

  // JSON 및 JS 파일로 출력
  const outputPath = path.join(root, 'src', 'data', 'productSearchMetadata.generated.js');
  const fileContent = `// Auto-generated by scripts/buildProductSearchMetadata.mjs
export const productSearchMetadata = ${JSON.stringify(metadataList, null, 2)};

export const metadataByCode = new Map(
  productSearchMetadata.map(m => [m.product_code.toUpperCase(), m])
);

export const metadataById = new Map(
  productSearchMetadata.map(m => [String(m.product_id).toLowerCase(), m])
);
`;

  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`✓ 메타데이터 파일 생성 완료: ${outputPath}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(console.error);
}
