/**
 * 2026년 정부정책자금 게시글 6개 생성 스크립트
 * - Gemini API로 이미지 생성 (gemini-3-pro-image-preview)
 * - Airtable API로 게시판 직접 등록
 */

// 환경변수에서 로드 (실행 시 설정 필요)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const AIRTABLE_API_TOKEN = process.env.AIRTABLE_API_TOKEN || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'app45R8nx0dcCQK6D';
const AIRTABLE_TABLE_NAME = '게시판';
const R2_UPLOAD_URL = 'https://euninbiz.swdoor15.workers.dev/upload';

// 6개 게시글 데이터
const posts = [
  {
    제목: '2026년 소상공인 경영안정 바우처 총정리',
    카테고리: '정보',
    요약: '2026년부터 시행되는 소상공인 경영안정 바우처의 지원 내용과 신청 방법을 안내합니다.',
    내용: `2026년부터 소상공인 부담경감 크레딧이 '소상공인 경영안정 바우처'로 명칭이 변경되어 시행됩니다.

■ 지원 대상
상시근로자 5인 미만 소상공인(제조업, 건설업, 운수업, 광업은 10인 미만)

■ 지원 내용
- 전기·가스·수도요금
- 4대 보험료
- 통신비
- 차량 연료비 등 고정비 부담 경감

■ 지급 방식
카드 포인트 방식으로 지급되며, 등록된 카드로 결제 시 금액이 자동 차감됩니다.

■ 신청 방법
소상공인마당(sbiz.or.kr) 또는 소상공인24(sbiz24.kr)에서 온라인 신청이 가능합니다.

■ 준비 서류
사업자등록증, 매출 증빙자료, 고정비 지출 내역 등

2026년에는 지원 기회가 더 다양해지고 디지털 전환 분야 사업이 강화될 예정이니, 미리 준비하셔서 혜택을 놓치지 마세요.

※ 자세한 내용은 소상공인시장진흥공단(semas.or.kr)에서 확인하세요.`,
    imagePrompt: 'Korean small business owner in modern cafe, reviewing financial documents on tablet, warm lighting, professional Korean office setting, Seoul cityscape visible through window, photorealistic, no text'
  },
  {
    제목: '2026년 중소기업 정책자금 신청 가이드',
    카테고리: '안내',
    요약: '중소기업진흥공단 정책자금 신청 절차와 준비사항을 상세히 안내합니다.',
    내용: `중소벤처기업부와 중소기업진흥공단에서 운영하는 정책자금은 성장잠재력이 높은 중소기업을 위한 저금리 융자 제도입니다.

■ 지원 대상
「중소기업기본법」 제2조에 따른 중소기업으로, 민간금융기관에서 자금조달이 어려운 우수 중소벤처기업

■ 자금 종류
1. 혁신창업 사업화자금
2. 신시장진출 지원자금
3. 신성장기반자금
4. 재도약지원자금
5. 긴급경영안정자금
6. 밸류체인 안정화자금

■ 융자 한도
기업당 최대 60억원 이내 (대출 잔액 + 신규 대출 합산)

■ 신청 절차
1단계: 온라인 신청예약 (kosmes.or.kr)
2단계: 사전상담
3단계: 온라인 신청
4단계: 심사 및 대출 실행

■ 신청 시기
당월 자금 희망 시 전월 말까지 신청 필요

■ 문의처
정책자금 안내 콜센터: 1811-3655

※ 정책자금 공고는 매년 초 중소벤처기업부(mss.go.kr)에서 확인하세요.`,
    imagePrompt: 'Korean business professionals in corporate meeting room, discussing financial charts on large screen, modern Korean office interior, natural lighting, professional atmosphere, photorealistic, no text'
  },
  {
    제목: '신용보증기금 vs 기술보증기금, 어떤 곳이 유리할까?',
    카테고리: '정보',
    요약: '신용보증기금과 기술보증기금의 차이점과 각 기관이 유리한 기업 유형을 비교합니다.',
    내용: `정책자금 대출을 받으려면 보증기관의 보증서가 필요합니다. 신용보증기금(신보)과 기술보증기금(기보) 중 어디가 유리한지 비교해 드립니다.

■ 신용보증기금 (신보)
- 대상: 업종 제한 거의 없음, 개인·법인 모두 가능
- 평가 기준: 매출, 현재 사업 성과, 유망성 종합 평가
- 보증 한도: 운전자금 기준 최대 30억원
- 추천 기업: 일반 제조업, 도소매업, 서비스업 등

■ 기술보증기금 (기보)
- 대상: 기술 혁신형 기업 중점 지원
- 평가 기준: 기술력, 특허권, R&D 역량 중심
- 보증 한도: 기업 규모 및 기술력에 따라 차등
- 추천 기업: IT업, 연구개발업, 특허 보유 제조업

■ 선택 기준
1. 특허나 기술력이 강점이라면 → 기보
2. 매출과 사업 안정성이 강점이라면 → 신보
3. 창업 초기 R&D 중심 기업 → 기보
4. 업력이 길고 매출이 안정적 → 신보

■ 동시 이용 가능?
네, 두 기관 모두에서 보증을 받을 수 있습니다. 다만 동일인당 합산 한도가 적용됩니다.

※ 신보: kodit.co.kr / 기보: kibo.or.kr`,
    imagePrompt: 'Korean financial advisor explaining documents to business owner, bright modern Korean bank office, professional setting, Seoul business district, comparison charts visible, photorealistic, no text'
  },
  {
    제목: '2026년 희망리턴패키지 - 폐업부터 재창업까지 원스톱 지원',
    카테고리: '안내',
    요약: '경영 어려움을 겪는 소상공인을 위한 희망리턴패키지 프로그램을 소개합니다.',
    내용: `희망리턴패키지는 폐업을 고민하는 소상공인부터 재창업을 준비하는 분들까지 한 번에 지원하는 종합 프로그램입니다.

■ 지원 대상
- 폐업을 고려 중인 소상공인
- 이미 폐업한 소상공인
- 재창업을 준비하는 예비창업자

■ 지원 내용

1. 정리컨설팅
- 폐업 절차 안내
- 채무조정 상담
- 점포철거비 지원 (최대 250만원)

2. 재기교육
- 재창업 역량 강화 교육
- 업종 전환 컨설팅
- 취업 연계 프로그램

3. 재창업 지원
- 재창업자금 융자 연계
- 멘토링 프로그램
- 사업계획서 작성 지원

4. 취업 지원
- 취업 알선
- 직업훈련 연계
- 자격증 취득 지원

■ 신청 방법
소상공인시장진흥공단 지역센터 방문 또는 온라인 신청

■ 문의처
희망리턴패키지 콜센터: 1357

※ 자세한 내용: semas.or.kr 또는 소상공인24`,
    imagePrompt: 'Korean entrepreneur starting new business, positive atmosphere, modern Korean startup office, business planning on whiteboard, hopeful expression, natural lighting, photorealistic, no text'
  },
  {
    제목: '정책자금 승인률 높이는 5가지 핵심 전략',
    카테고리: '정보',
    요약: '정책자금 심사에서 승인률을 높이기 위한 실전 전략을 공개합니다.',
    내용: `정책자금 신청 시 승인률을 높이려면 철저한 준비가 필요합니다. 전문가가 알려드리는 5가지 핵심 전략입니다.

■ 전략 1: 사업계획서 구체화
- 막연한 계획이 아닌 수치와 일정이 명확한 계획 작성
- 매출 목표, 자금 사용처, 상환 계획 구체적으로 기재
- 시장 분석과 경쟁력 분석 포함

■ 전략 2: 자금 용도 세분화
- 총액만 기재하지 말고 항목별 상세 작성
- 운전자금: 원자재, 인건비, 임대료 등 구분
- 시설자금: 설비 종류, 구매처, 금액 명시

■ 전략 3: 기업 강점 객관적으로 부각
- 업력, 매출 성장률, 기술력 등 수치로 증명
- 수상 이력, 인증서, 특허 등 첨부
- 거래처 레퍼런스 활용

■ 전략 4: 재무제표 정합성 확인
- 손익계산서와 재무상태표 수치 일치 여부 점검
- 부채비율, 유동비율 등 재무건전성 확인
- 세금 체납 여부 사전 해결

■ 전략 5: 제출 전 최종 검토
- 오탈자, 누락 서류 없는지 체크리스트로 확인
- 제3자 검토 받기
- 마감일 여유 있게 제출

※ 은인자금파트너스에서 무료 상담을 받아보세요.`,
    imagePrompt: 'Korean business consultant reviewing loan documents with client, professional Korean office setting, documents and charts on desk, confident professional atmosphere, photorealistic, no text'
  },
  {
    제목: '2026년 소상공인 디지털 전환 지원사업 총정리',
    카테고리: '정보',
    요약: '2026년 강화되는 소상공인 디지털 전환 지원사업의 종류와 신청 방법을 안내합니다.',
    내용: `2026년에는 소상공인의 디지털 전환을 돕는 지원사업이 대폭 강화됩니다. AI 활용부터 온라인 판로 개척까지 다양한 지원을 받을 수 있습니다.

■ AI 활용 지원사업
- AI 기반 고객 분석 도구 도입 지원
- 챗봇, 자동화 시스템 구축 비용 지원
- AI 마케팅 교육 프로그램

■ 스마트상점 기술보급사업
- 스마트 오더 시스템 도입
- 키오스크 설치 지원
- 무인 결제 시스템

■ 온라인 판로 지원
- 온라인 쇼핑몰 입점 지원
- 상품 촬영 및 상세페이지 제작
- 라이브커머스 교육

■ 디지털 역량 강화 교육
- 온라인 마케팅 기초
- SNS 활용법
- 데이터 분석 기초

■ 지원 대상
상시근로자 5인 미만 소상공인 (업종별 상이)

■ 신청 방법
소상공인마당(sbiz.or.kr) 또는 지역 소상공인지원센터 방문

■ 신청 시기
2026년 상반기 공고 예정 (1~3월)

※ 미리 사업자등록증, 매출 증빙, 디지털 전환 계획서를 준비하세요.`,
    imagePrompt: 'Korean small business owner using tablet for digital ordering system in modern Korean cafe, technology integration, bright modern interior, Seoul urban setting, photorealistic, no text'
  }
];

// 이미지 생성 함수 (Gemini 3 Pro Image Preview - Nano Banana Pro)
async function generateImage(prompt, index) {
  console.log(`\n🎨 이미지 생성 중 (${index + 1}/6)...`);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['image', 'text'] }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`   ❌ 이미지 생성 API 실패 (${response.status}):`, error.substring(0, 500));
      return null;
    }

    const result = await response.json();
    const imageData = result.candidates?.[0]?.content?.parts?.find(
      p => p.inlineData?.mimeType?.startsWith('image/')
    );

    if (imageData?.inlineData?.data) {
      // R2에 업로드
      const imageBuffer = Buffer.from(imageData.inlineData.data, 'base64');
      const blob = new Blob([imageBuffer], { type: 'image/png' });

      const formData = new FormData();
      formData.append('file', blob, `post-${index + 1}-${Date.now()}.png`);

      const uploadResponse = await fetch(R2_UPLOAD_URL, {
        method: 'POST',
        body: formData
      });

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        console.log(`   ✅ 이미지 업로드 완료: ${uploadResult.url}`);
        return uploadResult.url;
      } else {
        console.error(`   ❌ 이미지 업로드 실패`);
        return null;
      }
    }

    console.log(`   ⚠️ 이미지 데이터 없음`);
    return null;
  } catch (error) {
    console.error(`   ❌ 이미지 생성 오류:`, error.message);
    return null;
  }
}

// 게시글 등록 함수 (Airtable API 직접 사용)
async function createPost(post, thumbnailUrl) {
  console.log(`\n📝 게시글 등록 중: ${post.제목}`);

  try {
    const today = new Date().toISOString().split('T')[0];

    const fields = {
      '제목': post.제목,
      '내용': post.내용,
      '카테고리': 'Policy', // singleSelect: Policy, Notice, News
      '작성일': today,
      '조회수': Math.floor(Math.random() * 500) + 100
    };

    // 썸네일이 있으면 URL로 추가 (URL 타입)
    if (thumbnailUrl) {
      fields['썸네일'] = thumbnailUrl;
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log(`   ✅ 게시글 등록 완료: ${result.id}`);
      return result;
    } else {
      const error = await response.json();
      console.error(`   ❌ 게시글 등록 실패:`, JSON.stringify(error));
      return null;
    }
  } catch (error) {
    console.error(`   ❌ 게시글 등록 오류:`, error.message);
    return null;
  }
}

// 메인 실행
async function main() {
  console.log('='.repeat(50));
  console.log('🚀 2026년 정부정책자금 게시글 6개 생성 시작');
  console.log('='.repeat(50));
  console.log(`\n📌 이미지 생성 모델: gemini-3-pro-image-preview (Nano Banana Pro)`);
  console.log(`📌 게시판: Airtable API 직접 사용`);

  let successCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`\n${'─'.repeat(40)}`);
    console.log(`📄 [${i + 1}/6] ${post.제목}`);

    // 이미지 생성
    const thumbnailUrl = await generateImage(post.imagePrompt, i);

    // 게시글 등록
    const result = await createPost(post, thumbnailUrl);

    if (result) {
      successCount++;
    }

    // API 속도 제한 방지
    if (i < posts.length - 1) {
      console.log(`\n⏳ 3초 대기...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ 완료: ${successCount}/6 게시글 등록됨`);
  console.log('='.repeat(50));
}

main().catch(console.error);
