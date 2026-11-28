# 동경바닥재 쇼핑몰 상품 마스터 DB 연동 계약

적용일: 2026-11-17 / Supabase 프로젝트: DK-Floor

## 공식 데이터 기준
- 단일 상품 마스터: `public.products`, 식별자는 **숫자 `products.id`**.
- 일반 상품: 상품코드, 이름, 브랜드, 카테고리, 규격, 단위, 두께, 기준 판매가를 쇼핑몰 DB에서 조회한다.
- 통합관리 기존 항목: `dk_ops_state.data.materials`의 `erp-p-...` ID는 **기존 거래 및 재고 기록의 참조키**이므로 삭제/치환하지 않는다.
- 단가 처리: 신규 문서 작성 시 쇼핑몰 `products.price`를 기본값으로 제안할 수 있지만, 사용자 수정 단가와 저장 문서의 가격 스냅샷은 보존한다.
- LOT / 출고 / 재고 / 거래내역: 기존 `dk_ops_state`와 `dk_ops_stock_audit`를 유지하고 상품 키만 매핑한다.
- 인건비/운반비/임대료 등 업무 전용 품목은 쇼핑몰 품목으로 변환하지 않고 별도 유지한다.

## 활성화된 DB 조회 인터페이스
1. `public.dk_ops_catalog_master`: 쇼핑몰 상품 전건을 기준으로 하는 읽기 전용 뷰. `product_id`가 공식 식별자이고 `material_id='shop:' || product_id`는 화면 호환용 표기다.
2. `public.dk_ops_search_shop_materials(q text, result_limit integer default 40, show_inactive boolean default false)`: 검색 RPC. 상품코드 정확/부분 검색, 상품명, 카테고리, 브랜드, 여러 단어 검색을 지원한다. 결과 최대 100건.
3. `public.dk_ops_catalog_approved_links`: 업무 ERP ID와 쇼핑몰 상품 ID 간 승인된 매핑만 조회한다.
4. `public.dk_ops_material_link_candidates`: `candidate / approved / rejected` 상태의 후보. 회원은 소속 작업공간만 조회, 관리자/편집자만 상태를 변경하도록 RLS 적용.

호출 예시 (통합관리 웹앱에 아직 연결해야 함):

```js
const { data: choices, error } = await supabase.rpc('dk_ops_search_shop_materials', {
  q: inputValue,
  result_limit: 40,
  show_inactive: false,
});
if (error) throw error;
// 선택 시: selected.product_id, selected.code, selected.name,
// selected.spec, selected.unit, selected.sale을 신규 문서 행에 스냅샷으로 저장
```

기존 ERP 자료를 읽을 때는 `dk_ops_catalog_approved_links`의 `erp_material_id`와 매칭되는 행에 대해 **쇼핑몰 상품 정보를 표시**하되, 내부 ERP ID 및 과거 가격/수량은 그대로 보존한다. 과거 거래 금액은 변경하거나 재계산하지 않는다. 연결이 확인되지 않은 기존 ERP 품목은 보류 상태로 유지한다.

## 2026-11-17 실행·검증 결과
- `products` 4,260건; `dk_ops_catalog_master` 4,260건.
- 기존 ERP `materials` 3,207건, `dk_ops_state.version = 10` 유지.
- 일치 후보 169건 중 승인 167건, 보류 2건.
- 보류: `1919`, `1922` — ERP 브랜드 동신, 사이트 브랜드 현대로 서로 다름.
- 검색: `24722`→`CM24722`(장판), `30082P`, `53351`, `보타닉 3086` 정상.
- 실서비스 **화면·견적서·출고증·거래내역서 코드 연결/배포는 아직 미완료**. Vercel `dongk-ops-realtime`은 별도 배포 프로젝트이며 쇼핑몰 `dongk-site` 저장소와 동일하지 않다.

## 프런트엔드 적용 체크리스트
- 거래내역서 / 견적서 / 출고증 / 매장재고의 상품 검색을 동일 RPC로 대체한다.
- 선택한 신규 상품에 `products.id`와 제품 스냅샷을 저장한다.
- 저장/수정/인쇄 시 과거 문서 품목의 ID와 단가를 변경하지 않는다.
- 업무용 기타 항목 입력(인건비/운반비 등)은 기존 업무 품목 별도 검색으로 유지한다.
- 상품 검색 정확성, 다중 단어, 코드 부분검색, 문서 왕복, LOT 합계 및 멀티기기 동기화를 검증한 후 운영 배포한다.

## 데이터 보안 주의
검사 당시 `public.products`에 익명 사용자 쓰기 정책이 발견되었다. 상품 마스터로 쓰기 전에 별도 인증/권한 구조를 확인하여 안전하게 정리해야 한다. 정책을 검증 없이 삭제하면 현재 관리자 기능을 중단시킬 수 있으므로, 이번 변경에서는 기존 정책을 수정하지 않았다.
