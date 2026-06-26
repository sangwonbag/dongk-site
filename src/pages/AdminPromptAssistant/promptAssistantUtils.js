import { TARGET_TEMPLATES } from './promptTemplates';

// Dynamic placeholders mapping for different task types
export const TASK_PLACEHOLDERS = {
  '사이트 디자인 수정': {
    purpose: "예: 전체적인 메인 페이지 비주얼을 더 정교하고 현대적인 톤앤매너로 다듬기",
    issue: "예: 현재 메인 비주얼 슬라이더 영역의 폰트 대비와 간격이 모바일에서 다소 타이트함",
    result: "예: 배경에 미세한 그라디언트 및 글래스모피즘 효과 추가, 반응형 간격 보정"
  },
  '홈 화면 수정': {
    purpose: "예: 홈 화면 주요 자재 기획전 영역의 배치 최적화",
    issue: "예: 특정 기획 상품이 세로로 너무 길게 배치되어 화면 스크롤 피로도가 높음",
    result: "예: 가로 스크롤형 또는 3열/4열 배치로 변경하여 한 화면에 깔끔하게 배치"
  },
  '자재 목록/카드 UI 수정': {
    purpose: "예: 자재 목록 카드 컴포넌트의 테두리 및 그림자 효과 정교화",
    issue: "예: 카드 이미지 모서리 둥글기가 불일치하고, 브랜드 로고 텍스트가 작음",
    result: "예: border-radius: 8px 통일, 브랜드 로고 두께 강화, 마우스 호버 시 자연스럽게 카드 상승(Y축 -4px) 효과 추가"
  },
  '자재 상세페이지 수정': {
    purpose: "예: 자재 상세 스펙표 및 시공 주의사항 레이아웃 변경",
    issue: "예: 모바일 화면에서 테이블 규격이 가로로 스크롤되지 않고 텍스트가 겹침",
    result: "예: 가로 스크롤을 활성화하거나 세로형 요약 리스트로 모바일에서 대체 전환"
  },
  '장바구니/주문 플로우 수정': {
    purpose: "예: 주문서 작성 시 주소 검색 및 장바구니 잔상 버그 해결",
    issue: "예: 로그아웃 후 장바구니 카운트가 남아 있음 (0으로 갱신되지 않고 1로 남음)",
    result: "예: 스토리지 데이터 청소와 리액트 카트 상태가 확실하게 동기화되게 수정"
  },
  '로그인/회원 기능 수정': {
    purpose: "예: 회원가입 시 비밀번호 일치 조건 유효성 검사 강화",
    issue: "예: 비밀번호 확인 칸에 오타가 있어도 경고 없이 회원가입 단계가 완료됨",
    result: "예: 회원가입 전 비밀번호 일치 실시간 체크 경고문 노출 및 가입 차단"
  },
  '관리자 주문관리 수정': {
    purpose: "예: 관리자 주문 목록 엑셀 다운로드 또는 현황 대시보드 개선",
    issue: "예: 주문 내역 테이블에 상세 자재 상품명이 콤마로 나열되어 가독성이 떨어짐",
    result: "예: 주문 자재 목록을 각각의 라인 아이템 줄바꿈으로 처리하고 총합 금액 명확히 표기"
  },
  'Supabase 데이터 연동 수정': {
    purpose: "예: Supabase 자재 검색 및 필터 fetch 성능 개선",
    issue: "예: 자재 필터 변경 시 전체 3000개 자재를 매번 새로 쿼리하여 응답 속도가 느림",
    result: "예: 클라이언트 단 캐싱 또는 Supabase rpc 쿼리 최적화로 변경"
  },
  '오류 수정': {
    purpose: "예: 상세페이지 진입 시 발생하는 undefined property 오류 복구",
    issue: "예: 특정 자재의 썸네일 경로가 비어있을 때 클라이언트 화면이 흰색(White screen)으로 죽어버림",
    result: "예: 자재 데이터 바인딩 시 옵셔널 체이닝 및 대체 기본 이미지(Fallback image) 제공"
  },
  '배포/Vercel/GitHub 점검': {
    purpose: "예: Vercel 환경변수 누락 여부 점검 및 자동 배포 트리거 복원",
    issue: "예: GitHub main branch에 push를 해도 Vercel Production에 자동 배포 빌드가 시작되지 않음",
    result: "예: Vercel Git Integration을 해제 후 재연결하고 배포 웹훅 상태 정상 복구"
  },
  '기타 직접 입력': {
    purpose: "수정하려는 작업의 목적을 입력해주세요.",
    issue: "발생하는 문제나 현재 상황을 입력해주세요.",
    result: "도달하고자 하는 작동 방식 및 화면 상태를 입력해주세요."
  }
};

// 동경바닥재 사이트 전용 고정 규칙
export const DONGK_STATIC_RULES = `## 동경바닥재 사이트 전용 고정 규칙 (필수 준수)
1. **핵심 기능 및 연동 보존**: 기존의 주문 처리, 장바구니 Context, 로그인/인증, Supabase 데이터 연동 기능은 절대로 파괴하지 말고 그대로 보존하십시오.
2. **자재 메타데이터 변경 금지**: 사이트에 정의된 실제 제품명, 상품코드, 규격, 이미지 색상은 임의로 조작하거나 변조하지 마십시오.
3. **디자인 테마 일관성**: 전체 사이트의 톤앤매너인 '화이트톤, 얇은 회색 선, 깔끔한 B2B 자재몰' 분위기와 Pretendard/Outfit 폰트 사용을 그대로 유지하십시오.
4. **반응형 체크**: 데스크톱 뷰포트와 모바일 뷰포트 전체에서 레이아웃이 깨지지 않는지 검수하십시오.
5. **사전 영향 분석**: 코드 수정 전, 반드시 대상 관련 파일들을 검색하고 변경으로 영향받을 타 모듈들을 파악하십시오.
6. **빌드 무결성**: 작업 완료 전 \`npm run build\`를 로컬에서 구동하여 에러 유무를 확인하십시오.
7. **최종 보고 양식**: 수정/추가 완료 후 변경된 파일 목록 및 로컬/운영 검수 체크리스트 결과를 문서 형식으로 요약 보고하십시오.`;

/**
 * Estimates files that might need modifications based on the task type.
 * @param {string} taskType 
 * @returns {string[]} List of file paths
 */
export function estimateAffectedFiles(taskType) {
  switch (taskType) {
    case '사이트 디자인 수정':
      return [
        'src/components/layout/Header.css',
        'src/components/layout/Header.jsx',
        'src/components/layout/Footer.css',
        'src/index.css'
      ];
    case '홈 화면 수정':
      return [
        'src/pages/Home/Home.jsx',
        'src/pages/Home/Home.css'
      ];
    case '자재 목록/카드 UI 수정':
      return [
        'src/pages/Materials/Materials.jsx',
        'src/pages/Materials/Materials.css',
        'src/components/material/MaterialCard.jsx',
        'src/components/material/MaterialCard.css'
      ];
    case '자재 상세페이지 수정':
      return [
        'src/pages/MaterialDetail/MaterialDetail.jsx',
        'src/pages/MaterialDetail/MaterialDetail.css'
      ];
    case '장바구니/주문 플로우 수정':
      return [
        'src/contexts/EstimateCartContext.jsx',
        'src/pages/Cart/Cart.jsx',
        'src/pages/Cart/Checkout.jsx',
        'src/pages/Cart/OrderComplete.jsx'
      ];
    case '로그인/회원 기능 수정':
      return [
        'src/contexts/AuthContext.jsx',
        'src/pages/Login/Login.jsx',
        'src/pages/Signup/Signup.jsx',
        'src/pages/MyPage/MyPage.jsx'
      ];
    case '관리자 주문관리 수정':
      return [
        'src/pages/Admin/Orders/AdminOrders.jsx',
        'src/pages/Admin/Dashboard/AdminDashboard.jsx',
        'src/pages/Admin/Dashboard/AdminDashboard.css'
      ];
    case 'Supabase 데이터 연동 수정':
      return [
        'src/utils/supabaseFetcher.js',
        'src/lib/supabase.js',
        'src/services/orderService.js'
      ];
    case '오류 수정':
      return [
        'src/app/App.jsx',
        'src/contexts/EstimateCartContext.jsx',
        '(상세페이지 또는 에러 컴포넌트)'
      ];
    case '배포/Vercel/GitHub 점검':
      return [
        'vercel.json',
        'package.json'
      ];
    default:
      return [];
  }
}

const themeMap = {
  '사이트 디자인 수정': 'site design and styles',
  '홈 화면 수정': 'home screen visual layout',
  '자재 목록/카드 UI 수정': 'material card list UI',
  '자재 상세페이지 수정': 'material detail page specs',
  '장바구니/주문 플로우 수정': 'cart and checkout flow',
  '로그인/회원 기능 수정': 'user authentication and session',
  '관리자 주문관리 수정': 'admin order management system',
  'Supabase 데이터 연동 수정': 'supabase database connection',
  '오류 수정': 'unexpected application crash/bug',
  '배포/Vercel/GitHub 점검': 'vercel deployment pipeline and settings',
  '기타 직접 입력': 'custom task request'
};

const getTranslatedTheme = (taskType, customTaskType, purpose) => {
  const lowerPurpose = (purpose || '').toLowerCase();
  const keywords = [];
  if (lowerPurpose.includes('장바구니') || lowerPurpose.includes('카트')) keywords.push('cart');
  if (lowerPurpose.includes('로그인') || lowerPurpose.includes('인증')) keywords.push('login');
  if (lowerPurpose.includes('로그아웃')) keywords.push('logout');
  if (lowerPurpose.includes('주문') || lowerPurpose.includes('결제')) keywords.push('order');
  if (lowerPurpose.includes('디자인') || lowerPurpose.includes('화면')) keywords.push('layout');
  if (lowerPurpose.includes('오류') || lowerPurpose.includes('에러') || lowerPurpose.includes('버그')) keywords.push('bug');
  if (lowerPurpose.includes('배포') || lowerPurpose.includes('서버')) keywords.push('deploy');
  
  if (keywords.length > 0) {
    return keywords.join(' and ');
  }
  
  if (taskType === '기타 직접 입력' && customTaskType) {
    return customTaskType.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase().trim() || 'custom features';
  }
  
  return themeMap[taskType] || 'application workflow';
};

/**
 * Assembles a structured markdown prompt based on input form values.
 */
export function generatePrompt(inputs) {
  const {
    taskType,
    customTaskType,
    taskPurpose,
    currentIssue,
    desiredResult,
    nonTouchParts,
    styleNote,
    outputTarget,
    additionalMemo,
    urgency = '보통',
    forbiddenFiles = '',
    requiredFeatures = '',
    workMode = '계획서만 작성'
  } = inputs;

  const placeholders = TASK_PLACEHOLDERS[taskType] || TASK_PLACEHOLDERS['기타 직접 입력'];
  const actualTaskType = taskType === '기타 직접 입력' ? (customTaskType || '기타 작업') : taskType;
  const targetTemplate = TARGET_TEMPLATES[outputTarget] || TARGET_TEMPLATES.antigravity;
  
  const estimatedFiles = estimateAffectedFiles(taskType);

  const effectivePurpose = taskPurpose || placeholders.purpose.replace('예: ', '');
  const effectiveIssue = currentIssue || placeholders.issue.replace('예: ', '');
  const effectiveResult = desiredResult || placeholders.result.replace('예: ', '');

  // A. 작업 요약
  const summarySection = `### A. 작업 요약
- **작업명**: ${actualTaskType}
- **작업 목적**: ${effectivePurpose}
- **작업 긴급도**: ${urgency}
- **출력 대상**: ${targetTemplate.name} (${targetTemplate.description})`;

  // B. 현재 문제 분석
  const issueSection = `### B. 현재 문제 분석
${effectiveIssue}`;

  // C. 구현 목표
  const goalSection = `### C. 구현 목표
${effectiveResult}`;

  // D. 수정 대상 파일 추정
  const filesSection = `### D. 수정 대상 파일 추정
${estimatedFiles.length > 0 
  ? estimatedFiles.map(f => `- [${f.split('/').pop()}](file:///${f})`).join('\n')
  : '- 관련 코드 영향 범위 파악 후 파일 지정 요망'}`;

  // E. 구현 지시사항
  let modeInstruction = '';
  if (workMode === '계획서만 작성') {
    modeInstruction = '작업을 시작하기 전, 구체적인 수정 범위 및 계획이 담긴 implementation_plan.md 파일만 선행 작성하고 대기하십시오.';
  } else if (workMode === '코드 수정까지 진행') {
    modeInstruction = '구현 계획 승인 혹은 즉시 작업이 필요한 영역에 대해 실제 코드 수정 및 작성을 완료해주십시오.';
  } else if (workMode === '코드 수정 후 빌드 검증까지 진행') {
    modeInstruction = '실제 코드 수정을 반영하고 로컬에서 `npm run build` 검증을 실행하여 컴파일 무결성을 확인해주십시오.';
  } else if (workMode === '코드 수정, 빌드, 커밋 메시지 제안까지 진행') {
    modeInstruction = '실제 코드 수정을 반영하고 로컬에서 `npm run build` 검증을 실행한 뒤 적절한 git 커밋 메시지까지 최종 제안해주십시오.';
  }

  const instructionsSection = `### E. 구현 지시사항
1. **사전 파일 분석**: 코드 변경 작업 전 수정 대상 파일을 열어 타 모듈과의 의존 관계를 확실히 확인하십시오.
2. **모바일 반응형 보장**: 화면 변경 사항이 있을 시 모바일 가로/세로 뷰포트에서 레이아웃이 흘러내리거나 깨지지 않도록 미디어 쿼리를 추가하십시오.
3. **더미 구현 배제**: 실제로 정상 동작하는 코드로 완성하십시오.
4. **작업 실행 모드**: ${modeInstruction}
${styleNote ? `5. **스타일 및 톤**: ${styleNote}` : ''}`;

  // F. 유지해야 할 기존 기능
  const nonTouchList = [];
  nonTouchList.push('기존 Supabase DB 테이블 통신, 로그인 인증, 장바구니 Context, 로그아웃 clean 로직의 안정성을 최우선으로 보존하십시오.');
  if (nonTouchParts) {
    nonTouchList.push(nonTouchParts);
  }
  if (requiredFeatures.trim()) {
    requiredFeatures.split(/[\n,]+/).map(item => item.trim()).filter(Boolean).forEach(item => {
      nonTouchList.push(`회귀 방지 필수 기능: ${item}`);
    });
  }
  
  const nonTouchSection = `### F. 유지해야 할 기존 기능
${nonTouchList.map(item => `- ${item}`).join('\n')}`;

  // Forbidden Files Section if any
  const forbiddenSection = forbiddenFiles.trim() 
    ? `### 아래 파일은 명시적 승인 없이 수정하지 말 것 (수정 금지)
${forbiddenFiles.split(/[\n,]+/).map(f => f.trim()).filter(Boolean).map(f => `- ${f}`).join('\n')}`
    : '';

  // G. 검수 체크리스트
  const coreChecklist = [
    '`npm run build` 성공 여부 확인',
    '관리자 라우트 접근 보호 유지 확인',
    '모바일 화면 깨짐 여부 확인',
    '기존 주문/장바구니/로그인 기능 회귀 여부 확인',
    '수정 파일 목록 정리',
    '변경 전후 동작 비교',
    '운영 배포 전 환경변수 하드코딩 여부 확인'
  ];

  const taskChecklist = [];
  if (taskType === '로그인/회원 기능 수정') {
    taskChecklist.push('로그아웃 후 이전 사용자 정보가 남지 않는지 확인');
    taskChecklist.push('비관리자 계정이 관리자 페이지에 접근하지 못하는지 확인');
  } else if (taskType === '장바구니/주문 플로우 수정') {
    taskChecklist.push('장바구니 주문과 바로구매 주문이 분리되어 작동하는지 확인');
    taskChecklist.push('주문 완료 후 장바구니 잔상이 남지 않는지 확인');
  } else if (['사이트 디자인 수정', '홈 화면 수정', '자재 목록/카드 UI 수정', '자재 상세페이지 수정'].includes(taskType)) {
    taskChecklist.push('기존 화이트/그레이 톤앤매너가 유지되는지 확인');
    taskChecklist.push('데스크톱/태블릿/모바일 반응형이 모두 자연스러운지 확인');
  }

  const allChecklistItems = [...coreChecklist, ...taskChecklist];
  const checklistSection = `### G. 검수 체크리스트
${allChecklistItems.map(item => `- [ ] ${item}`).join('\n')}`;

  // Commit Message recommendations
  const lowerPurpose = (effectivePurpose + ' ' + (currentIssue || '')).toLowerCase();
  const theme = getTranslatedTheme(taskType, customTaskType, effectivePurpose);
  let prefix = 'feat';
  if (taskType === '오류 수정' || lowerPurpose.includes('오류') || lowerPurpose.includes('에러') || lowerPurpose.includes('버그') || lowerPurpose.includes('fix')) {
    prefix = 'fix';
  } else if (taskType === '배포/Vercel/GitHub 점검' || lowerPurpose.includes('설정') || lowerPurpose.includes('배포') || lowerPurpose.includes('deploy') || lowerPurpose.includes('chore')) {
    prefix = 'chore';
  }

  const commitSuggestions = [];
  if (prefix === 'fix') {
    commitSuggestions.push(`fix: resolve ${theme} issue`);
    commitSuggestions.push(`fix: fix bug in ${theme}`);
    commitSuggestions.push(`fix: correct error during ${theme}`);
  } else if (prefix === 'chore') {
    commitSuggestions.push(`chore: refine ${theme} configurations`);
    commitSuggestions.push(`chore: update settings for ${theme}`);
    commitSuggestions.push(`chore: cleanup helper script in ${theme}`);
  } else {
    commitSuggestions.push(`feat: improve ${theme} workflow`);
    commitSuggestions.push(`feat: implement ${theme} feature`);
    commitSuggestions.push(`feat: enhance UI representation of ${theme}`);
  }

  const commitSection = `### 추천 커밋 메시지 (택1)
${commitSuggestions.map(msg => `- ${msg}`).join('\n')}`;

  // H. 종합 입력용 지시서
  const finalPrompt = `### H. 최종 ${targetTemplate.name} 입력용 지시서

${targetTemplate.prefix}

---

${DONGK_STATIC_RULES}

---

## [작업 요청서: ${actualTaskType}]

**1. 개요 및 목적**
${effectivePurpose}
(작업 긴급도: ${urgency})

**2. 해결 대상 현상/오류**
${effectiveIssue}

**3. 도달할 결과 (To-Be)**
${effectiveResult}

**4. 수정/참고 파일**
${estimatedFiles.map(f => `- ${f}`).join('\n')}
${forbiddenFiles.trim() ? `\n**[승인 없이 수정 금지 파일]**\n${forbiddenFiles.split(/[\n,]+/).map(f => f.trim()).filter(Boolean).map(f => `- ${f}`).join('\n')}` : ''}

**5. 절대로 건드리면 안 되는 영역**
- Supabase 클라이언트 세션 관리 및 cart clean 흐름
${nonTouchList.map(item => `- ${item}`).join('\n')}

**6. 스타일 테마 요약**
${styleNote || '동경바닥재 어드민 테마 (화이트 배경, 얇은 회색 선, 깔끔한 레이아웃)'}

${additionalMemo ? `**7. 기타 추가 요청 사항**\n${additionalMemo}\n` : ''}
---
**8. 실행 명령 지침**
${modeInstruction}

---
**9. 추천 커밋 메시지**
- ${commitSuggestions[0]}`;

  return {
    summary: summarySection,
    issue: issueSection,
    goal: goalSection,
    files: filesSection,
    instructions: instructionsSection,
    nonTouch: nonTouchSection,
    checklist: checklistSection,
    commit: commitSection,
    finalPrompt: finalPrompt,
    fullText: `${summarySection}\n\n${issueSection}\n\n${goalSection}\n\n${filesSection}\n\n${instructionsSection}\n\n${nonTouchSection}\n\n${forbiddenSection ? forbiddenSection + '\n\n' : ''}${checklistSection}\n\n${commitSection}\n\n${finalPrompt}`
  };
}
