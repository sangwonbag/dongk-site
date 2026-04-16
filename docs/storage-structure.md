# Supabase Storage Structure

본 문서는 `dongk-site` 프로젝트의 자재 썸네일/갤러리 이미지 에셋(Assets)의 로컬 폴더 구조와 Supabase Storage `materials` 버킷 폴더 구조의 매핑 규칙을 정의합니다.

## 1. 개요
* **목표**: 프론트엔드 컴포넌트 처리 효율성을 위해 랜덤 파일명(UUID) 부여 방식을 버리고, **상품코드 기준의 파일 파편화 유지 (예: `ts5502p_0.jpg`) 기반의 직관적인 영문 폴더 구조(slugify)** 로 전환합니다.
* **적용 스크립트**: `scripts/upload_supabase_all.cjs` (업로드), `scripts/generate_manifest.cjs` (매니페스트 자동 생성)
* **결과물**: Supabase의 `materials` 버킷 내에 업로드 되며, `generate_manifest.cjs` 실행 시 이를 배열 구조(`{ thumbnail, images: [] }`)로 자동 병합합니다.

---

## 2. 폴더 및 카테고리 매핑 구조

로컬 폴더명(`public/images/Thumbnail_Image/materials/`)을 기준으로 다음의 Slug 치환 규칙을 따르며, 최종적으로 Supabase Storage 내부에 안전한 영문명(Safe Path)으로 업로드됩니다.

### 대분류 카테고리 매핑
* `데코타일` → `deco_tile`
* `장판` → `jangpan`
* `마루` → `maru`
* `벽지` → `wallpaper`
* `카페트타일` → `carpet_tile`

### 2.1 데코타일 (`deco_tile`)
| 로컬 폴더명 | Supabase 폴더명 | 예시 |
| -------- | ----------- | ---- |
| KCC | `kcc` | `materials/deco_tile/kcc/` |
| 동신 | `dongshin` | `materials/deco_tile/dongshin/` |
| LX | `lx` | `materials/deco_tile/lx/` |
| 녹수 | `noksu` | `materials/deco_tile/noksu/` |
| 재영 | `jaeyoung` | `materials/deco_tile/jaeyoung/` |
| 현대 | `hyundai` | `materials/deco_tile/hyundai/` |

### 2.2 장판 (`jangpan`) - 두께(T) 중심 분리
| 로컬 폴더명 (정규식 기반) | Supabase 폴더명 | 예시 |
| -------- | ----------- | ---- |
| LX하우시스_..._1.8T | `lx_18t` | `materials/jangpan/lx_18t/` |
| LX하우시스_..._2.0T | `lx_20t` | `materials/jangpan/lx_20t/` |
| LX하우시스_..._2.2T | `lx_22t` | `materials/jangpan/lx_22t/` |
| LX하우시스_..._2.7T | `lx_27t` | `materials/jangpan/lx_27t/` |
| LX하우시스_..._3.2T | `lx_32t` | `materials/jangpan/lx_32t/` |
| LX하우시스_..._4.5T | `lx_45t` | `materials/jangpan/lx_45t/` |
| LX하우시스_..._5.0T | `lx_50t` | `materials/jangpan/lx_50t/` |

### 2.3 마루 (`maru`)
| 로컬 폴더명 | Supabase 폴더명 | 예시 |
| -------- | ----------- | ---- |
| 동화 | `dongwha` | `materials/maru/dongwha/` |
| 구정 | `kujung` | `materials/maru/kujung/` |

### 2.4 벽지 (`wallpaper`)
| 로컬 폴더명 | Supabase 폴더명 | 예시 |
| -------- | ----------- | ---- |
| LX | `lx` | `materials/wallpaper/lx/` |
| 개나리 | `gaenari` | `materials/wallpaper/gaenari/` |
| 서울 | `seoul` | `materials/wallpaper/seoul/` |
| 제일 | `jeil` | `materials/wallpaper/jeil/` |
| 디아이디 | `did` | `materials/wallpaper/did/` |
| 신한 | `shinhan` | `materials/wallpaper/shinhan/` |

### 2.5 카페트타일 (`carpet_tile`)
| 로컬 폴더명 | Supabase 폴더명 | 예시 |
| -------- | ----------- | ---- |
| 스완 | `swan` | `materials/carpet_tile/swan/` |
| 아반 | `avan` | `materials/carpet_tile/avan/` |

---

## 3. 파일명 Safe Path 정규화 규칙
업로드 시 파일 명칭은 아래 순서를 거쳐 안전한 식별자로 변환됩니다.

1. **소문자 변환**: 대문자를 모두 소문자로 일치 (`TS5502P_0.JPG` → `ts5502p_0.jpg`)
2. **공백 치환**: 파일명 내 띄어쓰기는 언더스코어(`_`)로 치환 (예: `TS 5508.jpg` → `ts_5508.jpg`)
3. **특수문자 제거**: 영문 알파벳(`a-z`), 숫자(`0-9`), 언더스코어(`_`), 대시(`-`), 마침표(`.`) 이외의 모든 문자열을 `_`로 치환합니다.
4. **연속 _ 단일화**: 중복 생성된 `__`를 하나의 `_`로 축소합니다.
5. **찌꺼기 파일 제외**: macOS 환경에서 자동 생성되는 `__MACOSX/` 폴더와 `._` 파일, 혹은 정규화 후 빈 문자열이나 `_`만 남는 쓰레기 데이터는 전부 업로드 대상에서 자동 제외됩니다. 중복 Safe Path 역시 로그에 `DUPLICATE`를 남긴 후 Skip 됩니다.

---

## 4. Manifest 상품코드 그룹핑 방식
기존 방식에서는 `ts5502p_0.jpg`, `ts5502p_1.jpg` 각각에 임의의 MD5 해시나 UUID가 부여되어 이미지간 종속 관계를 묶을 수 없었습니다. 

**전환된 방식:**
1. UUID를 부여하지 않고, 원본 파일명인 `ts5502p_0.jpg` 식별자를 Storage에 그대로 유지.
2. 매니페스트 구축 스크립트(`scripts/generate_manifest.cjs`)가 폴더 내부를 스캔하여 같은 코드를 물고 있는 사진들을 탐색.
3. 데이터베이스상 노출된 기본 상품코드 `TS5502P`에 다음과 같이 원본 Array 객체 생태계로 묶어서 `imageManifest.js` 파일에 자동 할당.

```js
// 생성된 Manifest 예시
{
  "ts5502p": {
    "thumbnail": "deco_tile/kcc/kcc_square/ts5502p_0.jpg",
    "images": [
      "deco_tile/kcc/kcc_square/ts5502p_0.jpg",
      "deco_tile/kcc/kcc_square/ts5502p_1.jpg"
    ]
  }
}
```

---

## 5. 실행 가이드

모든 로컬 폴더(브랜드, 썸네일 등) 편집이 마무리되면, 터미널에서 다음 명령어를 실행하여 폴더 구조 그대로 Storage에 동기화할 수 있습니다.

```bash
npm run upload:supabase
```

### 실행 후 출력 요약 (예시)
에러 복구 설계(timeout, 5xx 에러 최대 3회 재시도 로직)가 적용되어 있으며, 마지막에 요약을 통해 상태를 확인할 수 있습니다.

```text
UPLOADED: materials/deco_tile/kcc/kcc_square/ts5502p_0.jpg
RETRY 1/3: materials/장판/lx_18t/file.jpg (fetch failed)
...
--- UPLOAD SUMMARY ---
UPLOADED: 450
SKIPPED:  50
FAILED:   0
----------------------
DONE
```
