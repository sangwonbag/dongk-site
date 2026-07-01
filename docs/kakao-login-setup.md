# Kakao Login Setup Guide (카카오 로그인 연동 안내서)

이 문서는 동경바닥재 프로젝트에서 **카카오 간편 로그인(OAuth)**을 활성화하기 위해 Kakao Developers 및 Supabase Dashboard에서 수행해야 하는 필수 설정 단계를 정리한 문서입니다.

---

## 1. Supabase Database 사전 패치 (필수)

카카오 로그인 사용자는 비밀번호가 존재하지 않으며, 휴대전화번호 제공 동의를 하지 않을 수 있습니다. 
따라서 `profiles` 테이블의 필수 컬럼 제약조건을 사전에 해제해야 에러가 발생하지 않습니다.

* **실행 방법:** Supabase Dashboard > **SQL Editor**에 접속하여 아래 쿼리를 입력하고 실행(Run)합니다.
```sql
-- profiles 테이블의 password, phone 컬럼 NOT NULL 제약 조건 해제
ALTER TABLE public.profiles ALTER COLUMN password DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;
```

---

## 2. Kakao Developers 설정

1. **카카오 개발자 센터 접속 및 로그인:**
   - [Kakao Developers](https://developers.kakao.com/)에 접속하여 가입 후 로그인합니다.

2. **애플리케이션 생성:**
   - **내 애플리케이션** > **애플리케이션 추가하기**를 클릭합니다.
   - 앱 이름(예: `동경바닥재`) 및 회사명(예: `동경바닥재`)을 입력하고 저장합니다.

3. **Web 플랫폼 등록:**
   - 생성한 애플리케이션의 **앱 설정** > **플랫폼**으로 이동합니다.
   - **Web** 항목에서 **플랫폼 등록**을 클릭하고 서비스 사이트 도메인을 입력합니다:
     - 로컬 개발 환경: `http://localhost:5173` (또는 실제 실행 중인 로컬 포트)
     - 운영 환경: Vercel 배포 도메인 (예: `https://dongk-site.vercel.app` 등)
     - *주의: 도메인은 줄바꿈으로 여러 개 등록할 수 있습니다.*

4. **카카오 로그인 활성화:**
   - **제품 설정** > **카카오 로그인** 메뉴로 이동합니다.
   - 활성화 설정 상태를 **ON**으로 변경합니다.

5. **Redirect URI 등록:**
   - 동일한 화면 하단의 **Redirect URI** 항목에서 **등록**을 클릭합니다.
   - Supabase Dashboard의 Kakao Provider 설정 화면에서 제공하는 **Callback URL**을 이곳에 등록합니다.
     - 형태 예시: `https://[your-supabase-project-ref].supabase.co/auth/v1/callback`

6. **Client Secret 보안 활성화:**
   - **제품 설정** > **카카오 로그인** > **보안** 메뉴로 이동합니다.
   - **Client Secret** 코드의 **생성** 버튼을 누릅니다.
   - 활성화 상태를 **ON**으로 변경합니다. (이때 생성된 코드를 복사하여 Supabase Dashboard에 입력해야 합니다.)

7. **동의항목 설정:**
   - **제품 설정** > **카카오 로그인** > **동의항목** 메뉴로 이동합니다.
   - 다음 항목들을 **설정**을 눌러 설정합니다:
     - **프로필 정보(닉네임/프로필 사진)**: **필수 동의** 또는 **선택 동의** (사용자 실명 또는 닉네임을 식별하기 위해 필요합니다)
     - **카카오계정(이메일)**: **선택 동의** (이메일 정보를 profiles에 보정하고 싶다면 연동 설정합니다. 필수 동의 설정은 사업자 심사 후에 가능하므로 보통 선택 동의로 진행합니다)

---

## 3. Supabase Dashboard 설정

1. **Supabase 콘솔 접속:**
   - [Supabase Dashboard](https://supabase.com/dashboard)에 접속하여 프로젝트를 선택합니다.

2. **Authentication Provider 설정:**
   - 좌측 메뉴에서 **Authentication** > **Providers**로 이동합니다.
   - 리스트에서 **Kakao** 항목을 찾아 확장한 뒤 **Enabled** 상태를 **ON**으로 변경합니다.

3. **API 키 정보 입력:**
   - **Client ID**: Kakao Developers 애플리케이션의 **앱 키** > **REST API 키** 값을 입력합니다.
   - **Client Secret**: Kakao Developers **보안** 메뉴에서 활성화했던 **Client Secret 코드** 값을 입력합니다.
   - **Redirect URL (또는 Callback URL)**: Supabase 화면에 노출되는 Callback URL을 복사하여 위 `2-5` 단계의 Kakao Developers Redirect URI 항목에 똑같이 등록해 줍니다.

4. **Supabase Redirect URLs (허용된 리디렉션 주소 목록) 등록:**
   - Supabase Dashboard의 **Authentication** > **URL Configuration** 메뉴로 이동합니다.
   - **Redirect URLs** 항목에서 **Add URL**을 눌러 다음 프론트엔드 콜백 주소들을 등록합니다:
     - 로컬 개발 환경용: `http://localhost:5173/login-callback`
     - 운영 환경용: Vercel 배포 도메인 주소 (예: `https://dongk-site.vercel.app/login-callback` 등)
   - *이 설정을 빠뜨리면 카카오 인증이 완료된 후 프론트엔드의 콜백 화면(`/login-callback`)으로 되돌아가지 못하고 리디렉션이 차단될 수 있습니다.*

5. **변경사항 저장:**
   - 페이지 하단의 **Save** 버튼을 클릭하여 설정을 완료합니다.

---

## 4. 환경 변수 설정 점검

- 프론트엔드 환경 변수(`.env.local` 등)에 **Supabase anon key**와 **URL**이 올바르게 들어가 있는지 확인하십시오. 
- *주의: Kakao Client Secret 이나 Supabase Service Role Key 등 민감 정보는 절대로 프론트엔드 `.env` 파일이나 프론트 소스코드에 입력해서는 안 됩니다. 해당 값들은 오직 Supabase 대시보드 내부 설정으로만 보호되어야 합니다.*
