# 동경바닥재 Android / iOS 스토어 앱

기존 동경바닥재 공식 사이트(`dkfloor.co.kr`)와 **상품·이미지·가격·계정·장바구니·주문·결제·관리자**를 공유합니다. 앱용 데이터베이스를 별도로 만들지 않습니다.

## 소스/네이티브 프로젝트 생성

안드로이드(Android Studio + SDK 36):

```bash
cd mobile
npm install
npm run prepare:android
npm run open:android
```

아이폰(macOS + Xcode 26 이상):

```bash
cd mobile
npm install
npm run prepare:ios
npm run open:ios
```

Capacitor 8.6 기반 `mobile/android`, `mobile/ios`가 생성됩니다. 두 앱 모두 동일한 공식 사이트를 표시하므로 사이트 수정이 앱에도 반영됩니다. 앱에는 인터넷 연결이 필요합니다.

GitHub Actions에서 **DK Floor Android test APK** 작업이 성공하면 테스트 APK를 Artifacts에서 내려받을 수 있습니다. 테스트 APK는 Play Store 등록 파일(AAB)이 아닙니다. iOS 시뮬레이터 빌드도 서명된 IPA가 아닙니다.

## 출시 전 반드시 확인

- Android 패키지/iOS 번들 ID 초안: `kr.co.dkfloor.store` (실제 개발자 계정의 고유 ID로 확정)
- Android targetSdk 36; Google Play에 올릴 **서명된 AAB**는 개발자 소유 업로드 키로 생성
- iOS는 개발자 계정 및 Xcode Team Signing 설정 후 Archive → App Store Connect 제출
- 개인정보 처리방침: https://dkfloor.co.kr/privacy (내용 및 작동 확인 필수)
- 계정 생성 기능이 있으므로 **앱 안에서 시작하는 계정 삭제** 및 **외부 삭제 신청 URL** 필요. 현재 사이트에서 구현 확인되지 않아 스토어 제출 전 보완해야 함
- 심사용 로그인 테스트 계정, 실제 스크린샷, 앱 내 연락처/서비스 안내 필요
- 카카오 OAuth, 로그인 유지, 우편번호 검색, 장바구니·배송방식·주문·결제, 미수금/출고 관리자, 외부 브라우저 전환을 iOS/Android 실기기로 검증
- 원격 URL 기반 Capacitor 앱은 **애플 심사 4.2 '단순 웹사이트 포장' 규정**에 따라 거절될 수 있음. 상품 고유 기능/네이티브 UX 보강과 심사 테스트 필수
- 코드/CI에 개인 인증서·서명키·키 비밀번호·운영 서비스 키를 넣지 말 것

공식 스토어 공개는 개발자 계정, 테스트, 서명 및 각 스토어 심사 통과 후에만 가능합니다.
