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
  const instructionsSection = `### E. 구현 지시사항
1. **사전 파일 분석**: 코드 변경 작업 전 수정 대상 파일을 열어 타 모듈과의 의존 관계를 확실히 확인하십시오.
2. **모바일 반응형 보장**: 화면 변경 사항이 있을 시 모바일 가로/세로 뷰포트에서 레이아웃이 흘러내리거나 깨지지 않도록 미디어 쿼리를 추가하십시오.
3. **더미 구현 배제**: 실제로 정상 동작하는 코드로 완성하십시오.
${styleNote ? `4. **스타일 및 톤**: ${styleNote}` : ''}`;

  // F. 유지해야 할 기존 기능
  const nonTouchSection = `### F. 유지해야 할 기존 기능
- 기존 Supabase DB 테이블 통신, 로그인 인증, 장바구니 Context, 로그아웃 clean 로직의 안정성을 최우선으로 보존하십시오.
${nonTouchParts ? `- **추가 금지/유지 사항**: ${nonTouchParts}` : ''}`;

  // G. 검수 체크리스트
  const checklistSection = `### G. 검수 체크리스트
- [ ] \`npm run build\` 명령어를 실행해 컴파일 오류 없이 번들링이 완료되는지 검사
- [ ] 장바구니에 담기, 로그아웃, 주문 완료 후 스토리지 정리 시 잔상 체크
- [ ] 모바일 해상도(375px~768px)에서 UI 구성 요소의 정렬 및 터치 크기 보장
- [ ] Supabase 연결 끊김 및 비로그인(게스트) 시의 비정상 접근 예외 처리 검증`;

  // H. 종합 입력용 지시서
  const finalPrompt = `### H. 최종 ${targetTemplate.name} 입력용 지시서

${targetTemplate.prefix}

---

${DONGK_STATIC_RULES}

---

## [작업 요청서: ${actualTaskType}]

**1. 개요 및 목적**
${effectivePurpose}

**2. 해결 대상 현상/오류**
${effectiveIssue}

**3. 도달할 결과 (To-Be)**
${effectiveResult}

**4. 수정/참고 파일**
${estimatedFiles.map(f => `- ${f}`).join('\n')}

**5. 절대로 건드리면 안 되는 영역**
- Supabase 클라이언트 세션 관리 및 cart clean 흐름
${nonTouchParts ? `- ${nonTouchParts}` : ''}

**6. 스타일 테마 요약**
${styleNote || '동경바닥재 어드민 테마 (화이트 배경, 얇은 회색 선, 깔끔한 레이아웃)'}

${additionalMemo ? `**7. 기타 추가 요청 사항**\n${additionalMemo}\n` : ''}
---
위 명세 및 에이전트 지침에 맞춰 안전하고 빌드 가능한 코드로 반영해주십시오.`;

  return {
    summary: summarySection,
    issue: issueSection,
    goal: goalSection,
    files: filesSection,
    instructions: instructionsSection,
    nonTouch: nonTouchSection,
    checklist: checklistSection,
    finalPrompt: finalPrompt,
    fullText: `${summarySection}\n\n${issueSection}\n\n${goalSection}\n\n${filesSection}\n\n${instructionsSection}\n\n${nonTouchSection}\n\n${checklistSection}\n\n${finalPrompt}`
  };
}
