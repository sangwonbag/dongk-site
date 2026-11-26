# 동경바닥재 보안 강화 점검 및 단계별 전환 (2026-11-26)

## 이번 브랜치에 반영한 변경
- Vercel 응답에 보수적인 브라우저 보안 헤더(X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS)를 추가했습니다.
- README에서 관리자 테스트 자격 증명을 제거하고, 기존 SQL 설정 파일을 운영 데이터베이스에서 재실행하지 않도록 경고했습니다.
- **운영 DB 스키마/RLS, 기존 인증 처리와 주문 로직, 배포 설정은 변경하지 않았습니다.** 보안 헤더 효과는 Vercel 배포 이후 응답 헤더 확인이 필요합니다.

## 실측으로 발견한 긴급 문제
1. `src/lib/auth.js`의 브라우저 코드가 하드코딩된 관리자 아이디 및 여러 비밀번호를 허용합니다. `VITE_ADMIN_PASSWORD`도 브라우저에 노출되는 설정이므로 인증 비밀로 사용할 수 없습니다.
2. `src/lib/auth.js`에서 기존 계정의 `profiles.password` SHA-256을 브라우저에서 직접 조회·검증합니다. 단독 SHA-256은 비밀번호 저장 방식으로 부적절합니다.
3. `src/contexts/AuthContext.jsx`와 `src/components/auth/AdminRoute.jsx`에서 localStorage에 저장된 사용자 정보의 `role`을 관리자 화면 분기에 활용합니다. 브라우저 정보는 권한의 근거가 될 수 없습니다.
4. 운영 Supabase의 `profiles`, `orders`, `order_items`에는 실제로 `USING (true)` 방식의 익명 읽기 정책이 있습니다. `orders`, `order_items`에는 익명 INSERT/UPDATE 허용 정책도 존재합니다. RLS가 켜져 있어도 공개 정책이 있으면 데이터가 보호되지 않습니다.
5. 운영 Supabase Security Advisor에서 **Leaked Password Protection Disabled** 경고가 발견됐습니다.

## 긴급 조치: 운영자 실행 필요
- 관리자 계정 비밀번호를 교체하고 모든 활성 세션을 폐기합니다. 과거 Git 이력, 배포된 JS 및 README에 노출되었을 수 있으므로 문서 삭제만으로 충분하지 않습니다.
- GitHub/Vercel/Supabase의 관리자 계정에 2단계 인증(MFA)을 활성화합니다.
- Supabase Auth의 유출 비밀번호 보호를 활성화합니다: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- Supabase API 키 중 secret/service_role 키가 프런트엔드에 섞여 있지 않은지 확인하고 노출된 키는 회전합니다. 클라이언트 publishable/anon 키 자체는 공개를 전제로 하며 RLS가 핵심 방어입니다.
- 관리되는 팀 계정, GitHub 브랜치 보호 및 PR 승인 절차를 적용합니다.

## 필수 인증/RLS 마이그레이션 순서 (운영 직접 실행 금지)
1. 운영 DB 백업 및 복구 리허설, 실제 로그인/회원가입/주문/관리자 업무 경로와 RLS 정책 목록을 확보합니다.
2. 기존 아이디/비밀번호 가입을 **Supabase Auth의 실제 인증 계정**으로 이전합니다. 기존 아이디 UI는 유지할 수 있지만 사용자 본인 확인을 서버에서 수행해야 합니다. 기존 SHA-256 비밀번호를 그대로 Auth로 안전하게 옮기는 것은 불가하므로 안전한 비밀번호 재설정 또는 인증된 전환 플로우가 필요합니다. 카카오 로그인도 동일한 Auth 계정 체계에서 처리합니다.
3. `profiles`에서 비밀번호 해시를 클라이언트에 반환하지 않고 서버만 관리하는 인증 흐름으로 전환합니다. 관리자/직원 역할은 사용자가 수정할 수 없는 서버측 저장소에서 검증합니다.
4. 주문 생성 시 서버에서 인증 사용자와 가격을 검증합니다. 클라이언트가 보낸 `user_id`, 관리자 여부, 가격, 입금상태를 신뢰하지 않습니다.
5. 스테이징 DB에서 소유자 전용 SELECT 정책과 관리자 별도 권한 정책을 테스트합니다. `orders`/`order_items`의 익명 공개 정책을 제거하되 실제 사용자/관리자/비회원 흐름을 선행 이관합니다.
6. 정상/공격 테스트 후에만 단계적으로 운영 RLS를 변경합니다. 프로필 읽기 제한을 먼저 적용하면 현재 레거시 로그인이 깨질 수 있으므로 순서를 반드시 지켜야 합니다.
7. 가격을 사업자 인증 후만 보여주려면 숨김 UI만으로 불가능합니다. 승인된 사업자에게만 가격을 반환하는 서버 API와 데이터베이스 권한이 필요합니다.

## 검증할 최소 회귀 시나리오
- 비회원 자재찾기 및 상세 조회/견적 계산 (정책에 따라 가격은 숨김)
- 기존 아이디/비밀번호 회원가입·로그인 및 카카오 OAuth 로그인·로그아웃
- 일반 고객의 관리자 화면 및 주문 변경 API 접근 차단
- 주문 생성/조회/입금 상태/관리자 처리/자기 주문만 조회
- 직접수령·화물착불·퀵 전환과 부자재 선택
- 주문/회원 데이터에 대한 익명 읽기·수정 거부
- 모바일 Safari/Android Chrome에서 로그인·장바구니 테스트
- 실제 Vercel Preview 응답의 보안 헤더 확인 및 화면 회귀

## 참고
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/security/production-checklist
- https://supabase.com/docs/guides/auth/auth-mfa
