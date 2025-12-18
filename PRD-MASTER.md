# PRD - 마스터 (클로드1 조율용)

## 프로젝트: 은인자금파트너스 홈페이지 브랜딩

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트 경로 | `F:\pola_homepage\2.16th_joeunye_eunin` |
| 기준 프로젝트 | BIZEN (1.14th_jeonyejin_bizen) |
| 목표 | BIZEN → 은인자금파트너스 브랜딩 변경 |
| GitHub | https://github.com/swdoor15-web/eunin |

---

## 완료된 작업 ✅

- [x] 프로젝트 복사 (bizen 기반)
- [x] wrangler.toml, package.json 커스텀
- [x] Worker 코드 브랜딩 변경 (은인자금파트너스)
- [x] automation 스크립트 커스텀
- [x] Git 초기화 및 GitHub 푸시
- [x] npm install 및 빌드 테스트
- [x] Airtable 테이블 생성 (Base ID: app45R8nx0dcCQK6D)
- [x] Cloudflare 환경변수 설정
- [x] 헤더 컴포넌트 변경 완료 (header.html)

---

## 업무 분담

### 클로드2: CSS 스타일링 + 푸터 + 헤더 변형
📄 **PRD**: `PRD-CLAUDE2-STYLING.md`

| 파일 | 작업 |
|------|------|
| css/main.css | 전체 컬러 변수 및 그라디언트 변경 |
| src/components/footer.html | 푸터 완전 변경 |
| src/components/header-about.html | 컬러 변경 |
| src/components/header-fund.html | 컬러 변경 |
| src/components/header-marketing.html | 컬러 변경 |
| src/components/header-process.html | 컬러 변경 |
| src/components/header-service.html | 컬러 변경 |

**예상 파일 수**: 7개

---

### 클로드3: 컴포넌트 브랜딩 변경
📄 **PRD**: `PRD-CLAUDE3-COMPONENTS.md`

| 카테고리 | 파일 |
|----------|------|
| 히어로 | hero.html |
| 폼 | form.html, marketing-form.html |
| About | about-category.html, about-ceo.html, about-hero.html, about-system.html |
| Fund | fund-detail.html, fund-hero.html, fund-process.html, fund-success.html |
| Marketing | marketing-box.html, marketing-hero.html |
| Process | process.html, process-faq.html, process-hero.html, process-service.html |
| Service | service.html, service-hero.html, service-network.html |
| 기타 | board.html, cta.html, partners.html, scripts.html, trust.html |

**예상 파일 수**: 25개

---

### 클로드1 (나): 조율 + 빌드 테스트 + 최종 검증

1. PRD 작성 및 배포 ✅
2. 작업 진행 상황 모니터링
3. 충돌 파일 없는지 확인
4. 최종 빌드 테스트 (`npm run build`)
5. 로컬 서버 테스트 (`npm run dev`)
6. GitHub 푸시

---

## 브랜드 정보 요약

### 기본 정보
| 항목 | 값 |
|------|-----|
| 회사명 | 은인자금파트너스 |
| 대표 | 조은예 |
| 사업자번호 | 688-56-00879 |
| 전화번호 | 010-6660-5118 |
| 이메일 | swdoor166@naver.com |
| 주소 | 경기도 안산시 단원구 원고잔로 6, 827호 |
| 도메인 | euninbiz.co.kr |

### 컬러 (포레스트 그린)
| 용도 | HEX |
|------|-----|
| Primary | #2D6A4F |
| Primary Dark | #1B4332 |
| Primary Light | #D8F3DC |
| Accent | #52B788 |
| Accent Dark | #40916C |
| Accent Light | #74C69D |

### Worker URL
```
https://euninbiz.swdoor15.workers.dev/
```

---

## 파일 충돌 방지

### 클로드2 전용 (클로드3 건드리지 않음)
- css/main.css
- footer.html
- header-*.html (6개)

### 클로드3 전용 (클로드2 건드리지 않음)
- hero.html
- form.html
- 나머지 모든 컴포넌트

### 공통 참조 (수정 금지)
- BRAND.md
- header.html (이미 완료)

---

## 최종 검증 항목

### 빌드 테스트
```bash
cd F:\pola_homepage\2.16th_joeunye_eunin
npm run build
```

### 로컬 테스트
```bash
npm run dev
# http://localhost:3000 접속 확인
```

### 확인 사항
- [ ] 모든 페이지에서 "BIZEN" 텍스트 없음
- [ ] 모든 페이지에서 네이비 컬러(#1D4ED8 등) 없음
- [ ] 연락처 010-6660-5118 표시
- [ ] 푸터 회사 정보 정확
- [ ] 폼 제출 시 Worker 연동 정상
- [ ] 모바일 반응형 정상

---

## 작업 순서

```
1. 클로드2, 클로드3 동시 시작 (병렬)
   ↓
2. 각자 PRD 따라 작업 진행
   ↓
3. 클로드1에게 완료 보고
   ↓
4. 클로드1: 빌드 테스트
   ↓
5. 문제 있으면 수정 지시
   ↓
6. GitHub 푸시 및 배포
```

---

## 긴급 연락

문제 발생 시:
- "BIZEN" 텍스트 발견 → 클로드3에게 알림
- 컬러 불일치 → 클로드2에게 알림
- Worker 오류 → 클로드3에게 알림 (form.html)

---

*작성일: 2025-12-18*
*관리: 클로드1*
