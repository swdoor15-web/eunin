// ================================================
// BIZEN 파트너스 - 통합 Workers API
// 작성일: 2025-12-02
// 기능: Airtable + Resend + Telegram 통합 + 게시판 CRUD
// 배포: Cloudflare Workers
// URL: https://bizen-homepage.weandbiz.workers.dev/
//
// ⚠️ Cloudflare 환경변수 설정 필요:
//   - AIRTABLE_TOKEN: Airtable Personal Access Token
//   - AIRTABLE_BASE_ID: Airtable Base ID
//   - RESEND_API_KEY: Resend API Key
//   - TELEGRAM_BOT_TOKEN: Telegram Bot Token
//   - TELEGRAM_CHAT_ID: Telegram Chat ID
// ================================================

// Airtable 테이블 ID
const TABLES = {
  LEADS: 'tblDGDn64l7eJyxjs',      // 상담신청 테이블
  BOARD: 'tblqMiNoaf3pgswgW'       // 게시판 테이블
};

export default {
  async fetch(request, env) {
    // CORS 헤더
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Preflight 요청 처리
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ================================================
      // 이미지 업로드 API (R2)
      // ================================================
      if (path === '/upload' && request.method === 'POST') {
        return await handleUploadAPI(request, env, corsHeaders);
      }

      // ================================================
      // 이미지 삭제 API (R2)
      // ================================================
      if (path === '/delete' && request.method === 'POST') {
        return await handleDeleteAPI(request, env, corsHeaders);
      }

      // ================================================
      // 관리자 인증 API
      // ================================================
      if (path === '/auth') {
        return await handleAuthAPI(request, env, corsHeaders);
      }

      // ================================================
      // 동적 Sitemap.xml (SEO)
      // ================================================
      if (path === '/sitemap.xml') {
        return await handleSitemapAPI(request, env, corsHeaders);
      }

      // ================================================
      // 게시판 API 라우팅
      // ================================================
      if (path === '/board' || path.startsWith('/board/')) {
        return await handleBoardAPI(request, env, corsHeaders, path);
      }

      // ================================================
      // 접수내역 조회 API (GET /leads)
      // ================================================
      if (path === '/leads' && request.method === 'GET') {
        return await handleLeadsAPI(request, env, corsHeaders);
      }

      // ================================================
      // 기존 상담신청 API (POST only)
      // ================================================
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
      }

      const data = await request.json();
      console.log('📥 Request received');

      // 응답 결과 객체
      const results = {
        success: true,
        airtable: { success: false, id: null, error: null },
        email: { customer: { success: false, error: null }, staff: { success: false, error: null } },
        telegram: { success: false, error: null }
      };

      // ================================================
      // 1. Airtable 저장 (환경변수 사용)
      // ================================================
      try {
        console.log('📤 Saving to Airtable...');
        const airtableResponse = await fetch(
          `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${TABLES.LEADS}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fields: data.airtableFields
            })
          }
        );

        if (airtableResponse.ok) {
          const airtableResult = await airtableResponse.json();
          results.airtable.success = true;
          results.airtable.id = airtableResult.id;
          console.log('✅ Airtable saved:', airtableResult.id);
        } else {
          const error = await airtableResponse.json();
          results.airtable.error = error;
          console.error('❌ Airtable error:', error);
        }
      } catch (error) {
        results.airtable.error = error.message;
        console.error('❌ Airtable exception:', error.message);
      }

      // ================================================
      // 2. Resend 이메일 발송 (고객용)
      // ================================================
      if (data.customerEmail) {
        try {
          console.log('📧 Sending customer email via Resend...');
          const customerEmailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: data.emailFrom || 'BIZEN 파트너스 <noreply@bizen.co.kr>',
              to: data.customerEmail,
              subject: data.customerSubject || '무료진단 신청이 접수되었습니다 - BIZEN 파트너스',
              html: data.customerHtml
            })
          });

          if (customerEmailResponse.ok) {
            const customerResult = await customerEmailResponse.json();
            results.email.customer.success = true;
            console.log('✅ Customer email sent:', customerResult.id);
          } else {
            const error = await customerEmailResponse.json();
            results.email.customer.error = error;
            console.error('❌ Customer email error:', error);
          }
        } catch (error) {
          results.email.customer.error = error.message;
          console.error('❌ Customer email exception:', error.message);
        }
      }

      // ================================================
      // 3. Resend 이메일 발송 (담당자용)
      // ================================================
      if (data.staffEmail) {
        try {
          console.log('📧 Sending staff email via Resend...');
          const staffEmailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: data.emailFrom || 'BIZEN 파트너스 <noreply@bizen.co.kr>',
              to: data.staffEmail,
              bcc: data.staffBcc || undefined,
              subject: data.staffSubject || '[신규상담] 무료진단 신청',
              html: data.staffHtml
            })
          });

          if (staffEmailResponse.ok) {
            const staffResult = await staffEmailResponse.json();
            results.email.staff.success = true;
            console.log('✅ Staff email sent:', staffResult.id);
          } else {
            const error = await staffEmailResponse.json();
            results.email.staff.error = error;
            console.error('❌ Staff email error:', error);
          }
        } catch (error) {
          results.email.staff.error = error.message;
          console.error('❌ Staff email exception:', error.message);
        }
      }

      // ================================================
      // 4. Telegram 메시지 발송 (미리보기 비활성화)
      // ================================================
      try {
        console.log('📱 Sending Telegram message...');

        const fields = data.airtableFields;
        const fundTypes = Array.isArray(fields['지원받고 싶은 자금종류']) ? fields['지원받고 싶은 자금종류'].join(', ') : (fields['지원받고 싶은 자금종류'] || '');
        const telegramText = `🔔 <b>BIZEN 파트너스 - 신규 상담 신청</b>

<b>👤 고객정보</b>
├ 기업명: <b>${fields['기업명'] || ''}</b>
├ 사업자번호: ${fields['사업자번호'] || ''}
├ 대표자명: <b>${fields['대표자명'] || ''}</b>
├ 연락처: <code>${fields['연락처'] || ''}</code>
├ 이메일: ${fields['이메일'] || ''}
└ 지역: ${fields['지역'] || ''}

<b>🏢 기업정보</b>
├ 업종: ${fields['업종'] || ''}
├ 설립연도: ${fields['설립연도'] || ''}
└ 직전년도매출: ${fields['전년도매출'] || ''}

<b>💰 자금정보</b>
├ 통화가능시간: ${fields['통화가능시간'] || ''}
├ 필요자금규모: ${fields['필요자금규모'] || ''}
└ 자금종류: ${fundTypes}

${fields['문의사항'] ? `<b>💬 문의내용</b>\n${fields['문의사항']}\n` : ''}`;

        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat_id: env.TELEGRAM_CHAT_ID,
              text: telegramText,
              parse_mode: 'HTML',
              disable_web_page_preview: true
            })
          }
        );

        if (telegramResponse.ok) {
          const telegramResult = await telegramResponse.json();
          results.telegram.success = true;
          console.log('✅ Telegram sent:', telegramResult.result.message_id);
        } else {
          const error = await telegramResponse.json();
          results.telegram.error = error;
          console.error('❌ Telegram error:', error);
        }
      } catch (error) {
        results.telegram.error = error.message;
        console.error('❌ Telegram exception:', error.message);
      }

      // ================================================
      // 최종 응답
      // ================================================
      console.log('📊 Final results:', results);

      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('💥 Fatal error:', error.message);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// ================================================
// 게시판 API 핸들러
// ================================================
async function handleBoardAPI(request, env, corsHeaders, path) {
  const method = request.method;

  // 게시판 테이블 ID
  const BOARD_TABLE = 'tblqMiNoaf3pgswgW';

  // GET /board - 게시글 목록 조회
  if (method === 'GET' && path === '/board') {
    try {
      console.log('📋 Fetching board posts...');

      // 게시여부가 true인 게시글만 조회, 작성일 내림차순 정렬
      const filterFormula = encodeURIComponent("{게시여부}=TRUE()");
      const sortField = encodeURIComponent("작성일");

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${BOARD_TABLE}?filterByFormula=${filterFormula}&sort[0][field]=${sortField}&sort[0][direction]=desc`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!airtableResponse.ok) {
        const error = await airtableResponse.json();
        console.error('❌ Airtable error:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.error?.message || 'Failed to fetch posts'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await airtableResponse.json();
      const posts = result.records.map(record => ({
        id: record.id,
        작성일: record.fields['작성일'],
        제목: record.fields['제목'],
        내용: record.fields['내용'],
        요약: record.fields['요약'],
        카테고리: record.fields['카테고리'],
        썸네일: record.fields['썸네일']?.[0]?.url || null,
        조회수: record.fields['조회수'] || 0,
        게시여부: record.fields['게시여부']
      }));

      console.log(`✅ Fetched ${posts.length} posts`);

      return new Response(JSON.stringify({
        success: true,
        posts: posts
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('❌ Board GET error:', error.message);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // GET /board/all - 모든 게시글 조회 (관리자용)
  if (method === 'GET' && path === '/board/all') {
    try {
      console.log('📋 Fetching all board posts (admin)...');

      const sortField = encodeURIComponent("작성일");

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${BOARD_TABLE}?sort[0][field]=${sortField}&sort[0][direction]=desc`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!airtableResponse.ok) {
        const error = await airtableResponse.json();
        return new Response(JSON.stringify({
          success: false,
          error: error.error?.message || 'Failed to fetch posts'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await airtableResponse.json();
      const posts = result.records.map(record => ({
        id: record.id,
        작성일: record.fields['작성일'],
        제목: record.fields['제목'],
        내용: record.fields['내용'],
        요약: record.fields['요약'],
        카테고리: record.fields['카테고리'],
        썸네일: record.fields['썸네일']?.[0]?.url || null,
        조회수: record.fields['조회수'] || 0,
        게시여부: record.fields['게시여부']
      }));

      return new Response(JSON.stringify({
        success: true,
        posts: posts
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // POST /board - 게시글 생성
  if (method === 'POST' && path === '/board') {
    try {
      const data = await request.json();
      console.log('📝 Creating board post...');

      const fields = {
        '제목': data.제목 || data.title,
        '내용': data.내용 || data.content,
        '요약': data.요약 || data.summary || '',
        '카테고리': data.카테고리 || data.category || '공지',
        '작성일': data.작성일 || data.date || new Date().toISOString().split('T')[0],
        '조회수': data.조회수 || data.views || 0,
        '게시여부': data.게시여부 !== undefined ? data.게시여부 : (data.published !== undefined ? data.published : true)
      };

      // 썸네일이 URL인 경우 Attachment 형태로 변환
      if (data.썸네일 || data.thumbnail) {
        const thumbnailUrl = data.썸네일 || data.thumbnail;
        fields['썸네일'] = [{ url: thumbnailUrl }];
      }

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${BOARD_TABLE}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields })
        }
      );

      if (!airtableResponse.ok) {
        const error = await airtableResponse.json();
        console.error('❌ Airtable create error:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.error?.message || 'Failed to create post'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await airtableResponse.json();
      console.log('✅ Post created:', result.id);

      return new Response(JSON.stringify({
        success: true,
        id: result.id,
        post: {
          id: result.id,
          ...result.fields
        }
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('❌ Board POST error:', error.message);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // PATCH /board/:id - 게시글 수정
  if (method === 'PATCH' && path.startsWith('/board/')) {
    const recordId = path.replace('/board/', '');

    if (!recordId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Record ID is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const data = await request.json();
      console.log('📝 Updating board post:', recordId);

      const fields = {};

      // 전달된 필드만 업데이트
      if (data.제목 !== undefined || data.title !== undefined) fields['제목'] = data.제목 || data.title;
      if (data.내용 !== undefined || data.content !== undefined) fields['내용'] = data.내용 || data.content;
      if (data.요약 !== undefined || data.summary !== undefined) fields['요약'] = data.요약 || data.summary;
      if (data.카테고리 !== undefined || data.category !== undefined) fields['카테고리'] = data.카테고리 || data.category;
      if (data.작성일 !== undefined || data.date !== undefined) fields['작성일'] = data.작성일 || data.date;
      if (data.조회수 !== undefined || data.views !== undefined) fields['조회수'] = data.조회수 || data.views;
      if (data.게시여부 !== undefined) fields['게시여부'] = data.게시여부;
      if (data.published !== undefined) fields['게시여부'] = data.published;

      if (data.썸네일 || data.thumbnail) {
        const thumbnailUrl = data.썸네일 || data.thumbnail;
        fields['썸네일'] = [{ url: thumbnailUrl }];
      }

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${BOARD_TABLE}/${recordId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields })
        }
      );

      if (!airtableResponse.ok) {
        const error = await airtableResponse.json();
        console.error('❌ Airtable update error:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.error?.message || 'Failed to update post'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await airtableResponse.json();
      console.log('✅ Post updated:', result.id);

      return new Response(JSON.stringify({
        success: true,
        id: result.id,
        post: {
          id: result.id,
          ...result.fields
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('❌ Board PATCH error:', error.message);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // DELETE /board/:id - 게시글 삭제
  if (method === 'DELETE' && path.startsWith('/board/')) {
    const recordId = path.replace('/board/', '');

    if (!recordId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Record ID is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      console.log('🗑️ Deleting board post:', recordId);

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${BOARD_TABLE}/${recordId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!airtableResponse.ok) {
        const error = await airtableResponse.json();
        console.error('❌ Airtable delete error:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.error?.message || 'Failed to delete post'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await airtableResponse.json();
      console.log('✅ Post deleted:', result.id);

      return new Response(JSON.stringify({
        success: true,
        id: result.id,
        deleted: true
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('❌ Board DELETE error:', error.message);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // 지원하지 않는 메서드
  return new Response(JSON.stringify({
    success: false,
    error: 'Method not allowed or path not found'
  }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ================================================
// 접수내역 API 핸들러
// ================================================
async function handleLeadsAPI(request, env, corsHeaders) {
  try {
    console.log('📋 Fetching leads...');

    // 정렬 없이 조회 (createdTime 기준 자동 정렬)
    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/tblDGDn64l7eJyxjs`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!airtableResponse.ok) {
      const error = await airtableResponse.json();
      return new Response(JSON.stringify({
        success: false,
        error: error.error?.message || 'Failed to fetch leads'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const result = await airtableResponse.json();
    const leads = result.records.map(record => ({
      id: record.id,
      createdTime: record.createdTime,
      기업명: record.fields['기업명'],
      대표자명: record.fields['대표자명'],
      연락처: record.fields['연락처'],
      이메일: record.fields['이메일'],
      사업자번호: record.fields['사업자번호'],
      업종: record.fields['업종'],
      필요자금규모: record.fields['필요자금규모'],
      문의사항: record.fields['문의사항'],
      상태: record.fields['상태'] || '대기중',
      메모: record.fields['메모']
    }));

    // 최신순 정렬
    leads.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

    console.log(`✅ Fetched ${leads.length} leads`);

    return new Response(JSON.stringify({
      success: true,
      leads: leads
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ Leads GET error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ================================================
// 이미지 업로드 API 핸들러 (R2)
// ================================================
async function handleUploadAPI(request, env, corsHeaders) {
  try {
    // R2 바인딩 체크
    if (!env.R2_BUCKET) {
      return new Response(JSON.stringify({
        success: false,
        error: 'R2 bucket not configured. Please bind R2_BUCKET in Cloudflare dashboard.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No file provided'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 파일명 생성 (timestamp + random)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop().toLowerCase();
    const fileName = `images/${timestamp}-${random}.${extension}`;

    // R2에 업로드
    const arrayBuffer = await file.arrayBuffer();
    await env.R2_BUCKET.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || 'image/webp'
      }
    });

    // 공개 URL 생성 (R2 Public Access)
    const publicUrl = `https://pub-d983e7cdd28841d2ba87f758cc01aa5f.r2.dev/${fileName}`;

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      fileName: fileName
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Upload error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ================================================
// 이미지 삭제 API 핸들러 (R2)
// ================================================
async function handleDeleteAPI(request, env, corsHeaders) {
  try {
    // R2 바인딩 체크
    if (!env.R2_BUCKET) {
      return new Response(JSON.stringify({
        success: false,
        error: 'R2 bucket not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { url } = await request.json();

    if (!url) {
      return new Response(JSON.stringify({
        success: false,
        error: 'URL is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // URL에서 파일명 추출 (images/xxxxx.webp)
    const match = url.match(/r2\.dev\/(.+)$/);
    if (!match) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid R2 URL format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const fileName = match[1];

    // R2에서 삭제
    await env.R2_BUCKET.delete(fileName);

    console.log('✅ Deleted from R2:', fileName);

    return new Response(JSON.stringify({
      success: true,
      deleted: fileName
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Delete error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ================================================
// 관리자 인증 API 핸들러
// ================================================
async function handleAuthAPI(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { password } = await request.json();

    // 환경변수에서 비밀번호 확인
    const adminPassword = env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Admin password not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (password === adminPassword) {
      // 간단한 토큰 생성 (24시간 유효)
      const token = btoa(`bizen_admin_${Date.now()}_${Math.random().toString(36).substr(2)}`);

      return new Response(JSON.stringify({
        success: true,
        token: token,
        expiresIn: 86400000 // 24시간 (밀리초)
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid password'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ================================================
// 동적 Sitemap API 핸들러 (SEO)
// ================================================
async function handleSitemapAPI(request, env, corsHeaders) {
  const BOARD_TABLE = 'tblqMiNoaf3pgswgW';
  const BASE_URL = 'https://bizen.co.kr';
  const today = new Date().toISOString().split('T')[0];

  try {
    // 게시된 게시글 목록 가져오기
    const filterFormula = encodeURIComponent("{게시여부}=TRUE()");
    const sortField = encodeURIComponent("작성일");

    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${BOARD_TABLE}?filterByFormula=${filterFormula}&sort[0][field]=${sortField}&sort[0][direction]=desc`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let posts = [];
    if (airtableResponse.ok) {
      const result = await airtableResponse.json();
      posts = result.records.map(record => ({
        id: record.id,
        date: record.fields['작성일'] || today
      }));
    }

    // Sitemap XML 생성
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 정적 페이지 -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/process.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/fund.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/service.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/marketing.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

    // 동적 게시글 페이지
    for (const post of posts) {
      sitemap += `
  <url>
    <loc>${BASE_URL}/post.html?id=${post.id}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }

    sitemap += `
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600' // 1시간 캐시
      }
    });

  } catch (error) {
    console.error('❌ Sitemap error:', error.message);
    // 에러 시 정적 페이지만 포함한 기본 sitemap 반환
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(fallbackSitemap, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8'
      }
    });
  }
}
