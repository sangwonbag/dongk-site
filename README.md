# 🏠 동경바닥재 온라인 주문 및 자재 조회 시스템 (DK Floor)

동경바닥재의 다양한 바닥재/자재 정보를 실시간으로 조회하고, 장바구니에 담아 가입/로그인 과정을 통해 즉시 무통장입금 및 전화주문으로 발주를 접수할 수 있는 통합 웹 어플리케이션입니다.

---

## 🛠️ 1. 로컬 실행 방법

로컬 개발 환경에서 프로젝트를 실행하는 절차입니다.

```bash
# 1. 의존성 패키지 설치
npm install

# 2. 환경변수 파일 설정
# .env.example 복사하여 .env.local 생성 후 값 입력 (Supabase 설정 참고)
cp .env.example .env.local

# 3. 로컬 개발 서버 실행
npm run dev

# 4. 프로덕션 빌드 테스트
npm run build
```

- 로컬 개발 서버 접속 주소: **`http://localhost:5173`**
- 프로덕션 빌드 결과물 경로: **`dist/`**

---

## 🔑 2. Supabase 환경변수 설정 방법

본 웹앱은 Supabase를 데이터베이스 및 사용자 인증 백엔드로 사용합니다.

### A. 로컬 `.env.local` 설정
프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하여 다음과 같이 환경변수를 기입해 주세요:

```env
# Supabase Client Side configuration (Vite prefix)
# 이 값들은 프론트엔드 빌드 시 로드되어 Supabase API 통신에 사용됩니다.
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> [!CAUTION]
> **보안 알림**: `SUPABASE_SERVICE_ROLE` 키는 무제한 권한을 가지므로 보안 상 절대 프론트엔드 코드나 VITE 접두사를 붙여 노출해서는 안 됩니다.

### B. Supabase DB 스키마 생성
Supabase 대시보드 내 **SQL Editor**에서 다음 두 파일의 SQL 스크립트를 복사하여 차례대로 구동해 주시기 바랍니다:
1. **[setup_profiles.sql](setup_profiles.sql)**: 유저 인증 및 프로필 정보를 관리하는 `profiles` 테이블 생성 및 관리자 기본값 적재
2. **[setup_orders.sql](setup_orders.sql)**: 주문 내역 및 개별 자재 품목을 관리하는 `orders`, `order_items` 테이블 생성

---

## ☁️ 3. Vercel 환경변수 설정 방법

프로젝트를 Vercel에 배포할 때, 보안 키가 누락되지 않도록 Vercel 콘솔 대시보드에 환경변수를 반드시 기입해 주어야 정상 구동됩니다.

1. **Vercel Console**에 로그인한 후 해당 프로젝트 세부 설정으로 이동합니다.
2. **Settings** 탭 > **Environment Variables** 메뉴로 진입합니다.
3. 다음 두 개의 Key-Value를 추가해 줍니다:
   - **Key**: `VITE_SUPABASE_URL` | **Value**: *(실제 Supabase 프로젝트 URL)*
   - **Key**: `VITE_SUPABASE_ANON_KEY` | **Value**: *(실제 Supabase anon key)*
4. 환경변수를 추가한 후 **Redeploy** 하시면 사이트가 정상적으로 Supabase 서버와 연동되어 배포 완료됩니다.

---

## 🐙 4. GitHub Push 방법

수정한 코드를 안전하게 깃허브 원격 저장소에 푸시하는 기본 절차입니다.

```bash
# 1. 변경된 파일 확인
git status

# 2. 모든 변경사항 스테이징 (의도치 않은 파일이나 빌드물이 포함되지 않도록 .gitignore 설정 완료)
git add .

# 3. 명확하고 의미 있는 커밋 메시지 작성
git commit -m "feat: 실제 주문 접수 및 profiles 기반 회원 구조 마이그레이션"

# 4. 원격 개발 브랜치로 푸시
git push origin dev

# 5. (필요 시) 메인(운영) 브랜치로 머지하여 최종 푸시
git checkout main
git merge dev
git push origin main
git checkout dev
```

---

## 📋 5. 배포 후 확인 체크리스트

운영 서버 배포 직후, 아래 체크리스트를 바탕으로 기능들의 최종 동작 상태를 수동 검증해 주시기 바랍니다.

- [ ] **DB 테이블 정상 조회**: 사이트 메인의 자재 카테고리나 자재 찾기 탭에서 상품 리스트가 정상 노출되는지 확인 (Supabase fetching 확인).
- [ ] **회원가입 기능**: 회원가입 시 아이디 중복 체크가 돌고, 정상 가입되어 `profiles` 테이블에 레코드가 1건 신규 적재되는지 확인.
- [ ] **관리자 로그인**: 관리자 아이디(`dongk3089` / `1234`)로 로그인 시, 자동으로 관리자 주문관리 대시보드(`/admin`) 화면으로 분기 리다이렉트되는지 확인.
- [ ] **일반 로그인**: 새롭게 가입한 일반 계정으로 로그인 시, 어드민 가드에 의해 차단되며 일반 메인/장바구니 화면으로 분기되는지 확인.
- [ ] **주문 생성 트랜잭션**: 자재를 장바구니에 2개 이상 담고 주소를 입력해 주문 완료 시, `orders` 및 `order_items` 테이블에 외래키(`order_id`, `user_id` -> `profiles.id`)가 정상 매핑되어 기록되는지 확인.
- [ ] **토큰 보안성**: 브라우저 개발자 도구(F12)의 네트워크 탭 혹은 소스 코드상에서 `service_role` 보안 키가 노출되지 않는지 재차 검증.
