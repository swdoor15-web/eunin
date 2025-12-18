# 은인자금파트너스 브랜드 가이드

## 기본 정보

| 항목 | 내용 |
|------|------|
| **회사명** | 은인자금파트너스 |
| **대표** | 조은예 |
| **도메인** | euninbiz.co.kr |
| **전화번호** | 010-6660-5118 |
| **이메일** | swdoor166@naver.com |
| **주소** | 경기도 안산시 단원구 원고잔로 6, 827호 |
| **사업자등록번호** | 688-56-00879 |

---

## 개발 계정 정보

| 서비스 | 계정/URL |
|--------|----------|
| **GitHub** | github-eunin (swdoor15-web) |
| **Cloudflare Worker** | euninbiz.swdoor15.workers.dev |
| **Vercel** | (설정 예정) |
| **Telegram Chat ID** | -1003635343656 |
| **Telegram Bot** | 비젠과 공유 (7947112373) |

---

## 컬러 시스템

### Primary Colors (포레스트 그린)
메인 브랜드 컬러 - 자연, 성장, 신뢰, 안정감

| 이름 | HEX | 용도 |
|------|-----|------|
| **Primary** | `#2D6A4F` | 헤더, 네비게이션, 메인 텍스트 |
| **Primary Light** | `#40916C` | 호버 상태, 서브 요소 |
| **Primary Dark** | `#1B4332` | 푸터, 강조 영역 |
| **Primary Pale** | `#D8F3DC` | 배경, 카드 |

### Accent Colors (프레시 그린)
CTA, 강조, 인터랙션

| 이름 | HEX | 용도 |
|------|-----|------|
| **Accent** | `#52B788` | CTA 버튼, 강조 |
| **Accent Light** | `#74C69D` | 호버, 밝은 강조 |
| **Accent Dark** | `#40916C` | 클릭 상태 |
| **Accent Pale** | `#E8F5E9` | 하이라이트 배경 |

### Secondary Colors (틸 그린)
보조 강조, 배지, 태그

| 이름 | HEX | 용도 |
|------|-----|------|
| **Secondary** | `#4A9E8C` | 배지, 태그 |
| **Secondary Light** | `#6BB5A5` | 밝은 보조 |
| **Secondary Dark** | `#3D8272` | 어두운 보조 |

### Status Colors

| 이름 | HEX | 용도 |
|------|-----|------|
| **Success** | `#10B981` | 성공 메시지 |
| **Warning** | `#F59E0B` | 경고 메시지 |
| **Error** | `#EF4444` | 에러 메시지 |
| **Info** | `#52B788` | 정보 메시지 |

### Neutral Colors (그레이 스케일)

| 이름 | HEX | 용도 |
|------|-----|------|
| **White** | `#FFFFFF` | 배경, 카드 |
| **Gray 50** | `#F9FAFB` | 페이지 배경 |
| **Gray 200** | `#E5E7EB` | 보더, 구분선 |
| **Gray 500** | `#6B7280` | 서브 텍스트 |
| **Gray 700** | `#374151` | 본문 텍스트 |
| **Gray 900** | `#111827` | 푸터 배경 |

### Gradients

```css
--gradient-primary: linear-gradient(135deg, #2D6A4F 0%, #40916C 100%);
--gradient-hero: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
--gradient-accent: linear-gradient(135deg, #52B788 0%, #74C69D 100%);
--gradient-fresh: linear-gradient(135deg, #40916C 0%, #52B788 100%);
```

---

## CSS Variables

```css
:root {
  /* Primary Colors */
  --primary: #2D6A4F;
  --primary-light: #40916C;
  --primary-dark: #1B4332;
  --primary-pale: #D8F3DC;

  /* Accent Colors */
  --accent: #52B788;
  --accent-light: #74C69D;
  --accent-dark: #40916C;
  --accent-pale: #E8F5E9;

  /* Secondary Colors */
  --secondary: #4A9E8C;
  --secondary-light: #6BB5A5;
  --secondary-dark: #3D8272;

  /* Status Colors */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #52B788;

  /* Neutral Colors */
  --neutral-50: #F9FAFB;
  --neutral-100: #F3F4F6;
  --neutral-200: #E5E7EB;
  --neutral-300: #D1D5DB;
  --neutral-400: #9CA3AF;
  --neutral-500: #6B7280;
  --neutral-600: #4B5563;
  --neutral-700: #374151;
  --neutral-800: #1F2937;
  --neutral-900: #111827;

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #2D6A4F 0%, #40916C 100%);
  --gradient-hero: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
  --gradient-accent: linear-gradient(135deg, #52B788 0%, #74C69D 100%);
  --gradient-fresh: linear-gradient(135deg, #40916C 0%, #52B788 100%);
}
```

---

## 컬러 사용 가이드

| 영역 | 권장 컬러 |
|------|-----------|
| **헤더/네비게이션** | Primary (`#2D6A4F`) 또는 Hero Gradient |
| **CTA 버튼** | Accent (`#52B788`), hover: Accent Dark |
| **히어로 섹션** | Hero Gradient, CTA: Accent |
| **푸터** | Gray 900 (`#111827`) 또는 Primary Dark |
| **카드/섹션** | White 또는 Primary Pale (`#D8F3DC`) |
| **링크** | Primary, hover: Accent |

---

## 파일 구조

```
2.16th_joeunye_eunin/
├── .env                    # 환경변수 (토큰)
├── .gitignore              # Git 제외 파일
├── BRAND.md                # 브랜드 가이드 (이 문서)
├── color-guide.html        # 컬러 가이드 (인터랙티브)
├── 자문계약서 표지_1차시안.jpg  # 브랜드 시안
└── ...
```

---

## 참고 자료

- 컬러 가이드 HTML: `color-guide.html`
- 기준 프로젝트: `F:\pola_homepage\1.14th_jeonyejin_bizen`

---

*최종 업데이트: 2025-12-18*
