# PRD - 클로드2: CSS 스타일링 + 푸터 + 헤더 변형

## 담당: 클로드2
## 역할: 핵심 스타일링 및 레이아웃 컴포넌트

---

## 프로젝트 정보

- **경로**: `F:\pola_homepage\2.16th_joeunye_eunin`
- **브랜드**: 은인자금파트너스
- **참조**: `BRAND.md`

---

## 브랜드 변경 정보

### 회사 정보
| 항목 | 기존 (BIZEN) | 변경 (은인) |
|------|-------------|------------|
| 회사명 | BIZEN, 비젠 | 은인자금파트너스 |
| 대표자 | 김우영 | 조은예 |
| 사업자번호 | 766-67-00632 | 688-56-00879 |
| 전화번호 | 1668-3166 | 010-6660-5118 |
| 이메일 | bizregen119@gmail.com | swdoor166@naver.com |
| 주소 | 경기도 광명시 소하로 190, A동 13층 1301호 | 경기도 안산시 단원구 원고잔로 6, 827호 |

### 컬러 시스템 (네이비 → 포레스트 그린)

| 용도 | 기존 HEX | 변경 HEX |
|------|----------|----------|
| Primary | #1D4ED8 | #2D6A4F |
| Primary Dark | #1E40AF | #1B4332 |
| Primary Light | #DBEAFE | #D8F3DC |
| Primary Hover | #2563EB | #40916C |
| Accent | #3B82F6 | #52B788 |
| Accent Dark | #2563EB | #40916C |
| Accent Light | #60A5FA | #74C69D |
| Accent Pale | #EFF6FF | #E8F5E9 |

### 그라디언트 변경

```css
/* 기존 (네이비) */
linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)
linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)
linear-gradient(105deg, rgba(18, 18, 68, 0.99) 0%, rgba(30, 30, 110, 0.96) 35%, rgba(65, 65, 180, 0.85) 100%)

/* 변경 (포레스트 그린) */
linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)
linear-gradient(135deg, #52B788 0%, #40916C 100%)
linear-gradient(105deg, rgba(27, 67, 50, 0.99) 0%, rgba(45, 106, 79, 0.96) 35%, rgba(82, 183, 136, 0.85) 100%)
```

---

## 작업 목록

### 1. CSS 메인 파일 (`css/main.css`) ⭐ 최우선

**전체 컬러 변수 변경**

```css
/* 변경 전 */
--primary: #1D4ED8;
--primary-dark: #1E40AF;
--primary-light: #DBEAFE;
--primary-hover: #2563EB;
--accent: #3B82F6;
--accent-dark: #2563EB;
--accent-light: #60A5FA;
--accent-pale: #EFF6FF;

/* 변경 후 */
--primary: #2D6A4F;
--primary-dark: #1B4332;
--primary-light: #D8F3DC;
--primary-hover: #40916C;
--accent: #52B788;
--accent-dark: #40916C;
--accent-light: #74C69D;
--accent-pale: #E8F5E9;
```

**헤더 그라디언트 변경 (약 95번 라인)**
```css
/* 변경 전 */
background: linear-gradient(105deg, rgba(18, 18, 68, 0.99) 0%, rgba(30, 30, 110, 0.96) 35%, rgba(65, 65, 180, 0.85) 100%);

/* 변경 후 */
background: linear-gradient(105deg, rgba(27, 67, 50, 0.99) 0%, rgba(45, 106, 79, 0.96) 35%, rgba(82, 183, 136, 0.85) 100%);
```

**CTA 섹션 그라디언트 변경 (약 627번 라인)**
```css
/* 변경 전 */
background: linear-gradient(135deg, #0a1628 0%, #1a3a5f 50%, #0a1628 100%);

/* 변경 후 */
background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #1B4332 100%);
```

**box-shadow rgba 색상 변경 (전체)**
- `rgba(59, 130, 246, X)` → `rgba(82, 183, 136, X)` (accent)
- `rgba(30, 30, 110, X)` → `rgba(45, 106, 79, X)` (primary)
- `rgba(96, 165, 250, X)` → `rgba(116, 198, 157, X)` (accent-light)

---

### 2. 푸터 컴포넌트 (`src/components/footer.html`)

**변경 사항:**

1. **클래스명**: `bizen-footer` → `eunin-footer`

2. **CSS 변수 변경**:
```css
/* 변경 전 */
--footer-navy: #0a1628;
--footer-navy-light: #0f2847;
--footer-primary: #3B82F6;
--footer-accent: #60A5FA;

/* 변경 후 */
--footer-green: #1B4332;
--footer-green-light: #2D6A4F;
--footer-primary: #52B788;
--footer-accent: #74C69D;
```

3. **그라디언트 변경**:
```css
/* 변경 전 */
background: linear-gradient(145deg, #0a1628, #0f2847);

/* 변경 후 */
background: linear-gradient(145deg, #1B4332, #2D6A4F);
```

4. **회사 정보 변경**:
- 로고: 은인자금파트너스 로고로 변경 (또는 텍스트)
- 설명: "기업심사관 기반 정책자금 전문 컨설팅 / 정책자금 승인의 모든 단계에 은인자금파트너스가 함께합니다."
- 대표자: 조은예
- 사업자등록번호: 688-56-00879
- 대표번호: 010-6660-5118
- 이메일: swdoor166@naver.com
- 주소: 경기도 안산시 단원구 원고잔로 6, 827호

5. **메뉴 텍스트**:
- "비젠" → "은인자금파트너스" (또는 "홈")

6. **저작권**:
- "BIZEN" → "은인자금파트너스"

7. **JJK 파트너십 링크**: 삭제 또는 수정 (확인 필요)

---

### 3. 헤더 변형 컴포넌트 (6개 파일)

모든 헤더 파일의 그라디언트 및 컬러 변경:

| 파일 | 경로 |
|------|------|
| header-about.html | src/components/header-about.html |
| header-fund.html | src/components/header-fund.html |
| header-marketing.html | src/components/header-marketing.html |
| header-process.html | src/components/header-process.html |
| header-service.html | src/components/header-service.html |
| header.html | src/components/header.html (이미 완료됨) |

**각 파일 변경 사항:**
- 네이비 그라디언트 → 포레스트 그린 그라디언트
- rgba 블루 계열 → 그린 계열
- box-shadow 색상 변경

---

## 검증 체크리스트

- [ ] css/main.css 변수 변경
- [ ] css/main.css 그라디언트 변경
- [ ] css/main.css box-shadow 색상 변경
- [ ] footer.html 클래스명 변경
- [ ] footer.html CSS 변수 변경
- [ ] footer.html 회사 정보 변경
- [ ] footer.html 메뉴/저작권 변경
- [ ] header-about.html 컬러 변경
- [ ] header-fund.html 컬러 변경
- [ ] header-marketing.html 컬러 변경
- [ ] header-process.html 컬러 변경
- [ ] header-service.html 컬러 변경

---

## 주의사항

1. **Read First**: 반드시 파일을 먼저 읽고 수정
2. **백슬래시 경로**: Windows 경로는 `\` 사용
3. **정확한 치환**: 오타 없이 정확하게 변경
4. **일관성**: 모든 파일에서 동일한 컬러 코드 사용

---

## 완료 후

1. 변경한 파일 목록 보고
2. 클로드1에게 완료 알림
3. 클로드3 작업과 충돌 없는지 확인

---

*작성일: 2025-12-18*
*담당: 클로드2*
