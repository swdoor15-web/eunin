# PRD - 클로드3: 컴포넌트 브랜딩 변경

## 담당: 클로드3
## 역할: 페이지 컴포넌트 브랜딩 및 텍스트 변경

---

## 프로젝트 정보

- **경로**: `F:\pola_homepage\2.16th_joeunye_eunin`
- **브랜드**: 은인자금파트너스
- **참조**: `BRAND.md`

---

## 브랜드 변경 정보

### 텍스트 치환 규칙

| 찾기 | 변경 |
|------|------|
| BIZEN | 은인자금파트너스 |
| bizen | eunin |
| 비젠 | 은인자금파트너스 |
| 1668-3166 | 010-6660-5118 |
| 김우영 | 조은예 |
| bizregen119@gmail.com | swdoor166@naver.com |
| weandbiz@gmail.com | swdoor166@naver.com |
| bizen-homepage.weandbiz.workers.dev | euninbiz.swdoor15.workers.dev |

### 컬러 변경 (인라인 스타일용)

| 기존 | 변경 | 용도 |
|------|------|------|
| #3B82F6 | #52B788 | Accent |
| #2563EB | #40916C | Accent Dark |
| #60A5FA | #74C69D | Accent Light |
| #93C5FD | #95D5B2 | Light Blue → Light Green |
| #1D4ED8 | #2D6A4F | Primary |
| #1E40AF | #1B4332 | Primary Dark |
| #DBEAFE | #D8F3DC | Primary Pale |
| #EFF6FF | #E8F5E9 | Accent Pale |

### 그라디언트 변경

```
rgba(30, 30, 110, X) → rgba(45, 106, 79, X)
rgba(59, 130, 246, X) → rgba(82, 183, 136, X)
rgba(96, 165, 250, X) → rgba(116, 198, 157, X)
rgba(147, 197, 253, X) → rgba(149, 213, 178, X)
```

---

## 작업 목록 (25개 파일)

### 1. 히어로 섹션 (`src/components/hero.html`) ⭐ 최우선

**변경 사항:**
1. 클래스명: `bizen-*` → `eunin-*`
2. 브랜드명: "BIZEN" → "은인자금파트너스"
3. 컬러 변경:
   - `#93C5FD` → `#95D5B2`
   - `#3B82F6` → `#52B788`
   - `#60A5FA` → `#74C69D`
   - `#2563EB` → `#40916C`
   - `#1D4ED8` → `#2D6A4F`
4. 그라디언트:
   - `rgba(30, 30, 110, X)` → `rgba(45, 106, 79, X)`
   - `rgba(59, 130, 246, X)` → `rgba(82, 183, 136, X)`

---

### 2. 폼 섹션 (`src/components/form.html`) ⭐ 최우선

**변경 사항:**
1. 클래스명: `bizen-*` → `eunin-*`
2. Worker URL: `bizen-homepage.weandbiz.workers.dev` → `euninbiz.swdoor15.workers.dev`
3. 브랜드명 텍스트 모두 변경
4. 연락처: `1668-3166` → `010-6660-5118`
5. 이메일:
   - `weandbiz@gmail.com` → `swdoor166@naver.com`
   - `mkt@polarad.co.kr` → 삭제 또는 유지 (확인 필요)
6. 컬러 변경 (CSS 변수 및 인라인):
   - `--bizen-primary` → `--eunin-primary`
   - `#3B82F6` → `#52B788`
   - `#2563EB` → `#40916C`

---

### 3. 기타 컴포넌트 (23개 파일)

| # | 파일명 | 주요 변경 |
|---|--------|----------|
| 1 | about-category.html | 텍스트, 컬러 |
| 2 | about-ceo.html | 대표자명 김우영→조은예, 텍스트 |
| 3 | about-hero.html | 브랜드명, 컬러 |
| 4 | about-system.html | 텍스트, 컬러 |
| 5 | board.html | 브랜드명 |
| 6 | cta.html | 브랜드명, 컬러, 연락처 |
| 7 | fund-detail.html | 텍스트, 컬러 |
| 8 | fund-hero.html | 브랜드명, 컬러 |
| 9 | fund-process.html | 텍스트, 컬러 |
| 10 | fund-success.html | 브랜드명 |
| 11 | marketing-box.html | 텍스트, 컬러 |
| 12 | marketing-form.html | 연락처, Worker URL, 이메일 |
| 13 | marketing-hero.html | 브랜드명, 컬러 |
| 14 | partners.html | 텍스트 |
| 15 | process.html | 텍스트, 컬러 |
| 16 | process-faq.html | 텍스트 |
| 17 | process-hero.html | 브랜드명, 컬러 |
| 18 | process-service.html | 텍스트 |
| 19 | scripts.html | Worker URL (있다면) |
| 20 | service.html | 텍스트, 컬러 |
| 21 | service-hero.html | 브랜드명, 컬러 |
| 22 | service-network.html | 텍스트 |
| 23 | trust.html | 브랜드명 |

---

## 파일별 상세 가이드

### about-ceo.html (대표 소개)
```
김우영 → 조은예
대표이사 김우영 → 대표 조은예
```

### marketing-form.html
```
Worker URL 변경
staffEmails 변경
연락처 변경
```

### cta.html
```
브랜드명 변경
전화번호 변경
컬러 변경
```

---

## 변경 패턴

### 1. 클래스명 치환
```html
<!-- Before -->
<section class="bizen-hero-section">
<div class="bizen-form-section">

<!-- After -->
<section class="eunin-hero-section">
<div class="eunin-form-section">
```

### 2. CSS 변수 치환
```css
/* Before */
--bizen-primary: #3B82F6;
--bizen-navy: #0a1628;

/* After */
--eunin-primary: #52B788;
--eunin-green: #1B4332;
```

### 3. 인라인 스타일 치환
```html
<!-- Before -->
style="color: #3B82F6"
style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"

<!-- After -->
style="color: #52B788"
style="background: linear-gradient(135deg, #52B788 0%, #40916C 100%)"
```

### 4. JavaScript 변수 치환
```javascript
// Before
const WORKER_URL = 'https://bizen-homepage.weandbiz.workers.dev/';

// After
const WORKER_URL = 'https://euninbiz.swdoor15.workers.dev/';
```

---

## 검증 체크리스트

### 히어로/폼 (최우선)
- [ ] hero.html 클래스명 변경
- [ ] hero.html 브랜드명 변경
- [ ] hero.html 컬러 변경
- [ ] form.html 클래스명 변경
- [ ] form.html Worker URL 변경
- [ ] form.html 이메일 변경
- [ ] form.html 연락처 변경
- [ ] form.html 컬러 변경

### About 페이지
- [ ] about-category.html
- [ ] about-ceo.html (대표자명!)
- [ ] about-hero.html
- [ ] about-system.html

### Fund 페이지
- [ ] fund-detail.html
- [ ] fund-hero.html
- [ ] fund-process.html
- [ ] fund-success.html

### Marketing 페이지
- [ ] marketing-box.html
- [ ] marketing-form.html (Worker URL!)
- [ ] marketing-hero.html

### Process 페이지
- [ ] process.html
- [ ] process-faq.html
- [ ] process-hero.html
- [ ] process-service.html

### Service 페이지
- [ ] service.html
- [ ] service-hero.html
- [ ] service-network.html

### 기타
- [ ] board.html
- [ ] cta.html
- [ ] partners.html
- [ ] scripts.html
- [ ] trust.html

---

## 주의사항

1. **Read First**: 반드시 파일을 먼저 읽고 수정
2. **백슬래시 경로**: Windows 경로는 `\` 사용
3. **Worker URL**: 정확하게 `euninbiz.swdoor15.workers.dev` 사용
4. **이메일**: staffEmails 배열에서 mkt@polarad.co.kr 유지 여부 확인
5. **클로드2 파일 제외**: footer.html, header-*.html, css/main.css는 건드리지 않음

---

## 작업 순서 권장

1. hero.html (메인 히어로)
2. form.html (상담 폼)
3. cta.html (CTA 섹션)
4. about-ceo.html (대표 정보)
5. marketing-form.html (마케팅 폼)
6. 나머지 파일들...

---

## 완료 후

1. 변경한 파일 목록 보고
2. 클로드1에게 완료 알림
3. Worker URL 연동 테스트 필요 여부 확인

---

*작성일: 2025-12-18*
*담당: 클로드3*
