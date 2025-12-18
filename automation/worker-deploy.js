// ================================================
// 은인자금파트너스 - 통합 Workers API
// 작성일: 2024-12-18
// 기능: Airtable + Resend + Telegram + GA4 Analytics 통합
// 배포: Cloudflare Workers
// URL: https://euninbiz.swdoor15.workers.dev/
// ================================================

const GA4_PROPERTY_ID = 'TO_BE_SET';
const SERVICE_ACCOUNT_EMAIL = 'TO_BE_SET';

export default {
  async fetch(request, env) {
    // CORS 헤더
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Preflight 요청 처리
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // ================================================
    // 라우팅: /webhook/meta-lead - Meta Lead Ads Webhook
    // ================================================
    if (path === '/webhook/meta-lead') {
      return handleMetaLeadWebhook(request, env, corsHeaders);
    }

    // ================================================
    // 라우팅: /auth - 관리자 인증
    // ================================================
    if (path === '/auth') {
      return handleAuth(request, env, corsHeaders);
    }

    // ================================================
    // 라우팅: /analytics/* - GA4 Analytics
    // ================================================
    if (path.startsWith('/analytics')) {
      return handleAnalytics(request, env, corsHeaders, path, url);
    }

    // ================================================
    // 라우팅: /leads - 접수내역 조회/수정
    // ================================================
    if (path === '/leads') {
      return handleLeads(request, env, corsHeaders);
    }

    // ================================================
    // 라우팅: /board - 게시판 조회
    // ================================================
    if (path === '/board' || path === '/board/all') {
      return handleBoard(request, env, corsHeaders);
    }

    // ================================================
    // 기본 라우트: 폼 제출 처리 (POST /)
    // ================================================
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const data = await request.json();
      console.log('📥 Request received:', data);

      // 응답 결과 객체
      const results = {
        success: true,
        airtable: { success: false, id: null, error: null },
        email: { customer: { success: false, error: null }, staff: { success: false, error: null } },
        telegram: { success: false, error: null }
      };

      // ================================================
      // 1. Airtable 저장
      // ================================================
      try {
        console.log('📤 Saving to Airtable...');
        const airtableResponse = await fetch(
          `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_NAME)}`,
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
      try {
        console.log('📧 Sending customer email via Resend...');
        const customerEmailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: data.emailFrom,
            to: [data.customerEmail],
            subject: data.customerSubject,
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

      // Rate limit 대응: 500ms 딜레이
      await new Promise(resolve => setTimeout(resolve, 500));

      // ================================================
      // 3. Resend 이메일 발송 (담당자들에게 각각 발송)
      // ================================================
      try {
        // staffEmails 배열 또는 기존 staffEmail 지원
        const staffEmailList = data.staffEmails || (data.staffEmail ? [data.staffEmail] : []);
        console.log('📧 Sending staff emails via Resend to:', staffEmailList);

        const staffResults = [];
        for (const email of staffEmailList) {
          try {
            const staffEmailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: data.emailFrom,
                to: [email],
                subject: data.staffSubject,
                html: data.staffHtml
              })
            });

            if (staffEmailResponse.ok) {
              const result = await staffEmailResponse.json();
              staffResults.push({ email, success: true, id: result.id });
              console.log('✅ Staff email sent to', email, ':', result.id);
            } else {
              const error = await staffEmailResponse.json();
              staffResults.push({ email, success: false, error });
              console.error('❌ Staff email error for', email, ':', error);
            }
            // Rate limit 대응: 담당자 이메일 사이 500ms 딜레이
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (err) {
            staffResults.push({ email, success: false, error: err.message });
            console.error('❌ Staff email exception for', email, ':', err.message);
          }
        }

        results.email.staff.success = staffResults.every(r => r.success);
        results.email.staff.details = staffResults;
      } catch (error) {
        results.email.staff.error = error.message;
        console.error('❌ Staff email exception:', error.message);
      }

      // ================================================
      // 4. Telegram 메시지 발송
      // ================================================
      try {
        console.log('📱 Sending Telegram message...');

        // Airtable 필드에서 데이터 추출
        const fields = data.airtableFields;
        const fundTypes = Array.isArray(fields['지원받고 싶은 자금종류'])
          ? fields['지원받고 싶은 자금종류'].join(', ')
          : (fields['지원받고 싶은 자금종류'] || '');

        const telegramText = `🔔 <b>은인자금파트너스 - 신규 무료진단 신청</b>

<b>👤 고객정보</b>
├ 기업명: <b>${fields['기업명'] || ''}</b>
├ 사업자번호: ${fields['사업자번호'] || ''}
├ 대표자명: <b>${fields['대표자명'] || ''}</b>
├ 연락처: <code>${fields['연락처'] || ''}</code>
├ 이메일: ${fields['이메일'] || ''}
└ 지역: ${fields['지역'] || ''}

<b>💰 자금정보</b>
├ 통화가능시간: ${fields['통화가능시간'] || ''}
├ 직전년도매출: ${fields['직전년도매출'] || ''}
├ 필요자금규모: ${fields['필요자금규모'] || ''}
└ 자금종류: ${fundTypes}

${fields['문의사항'] ? `<b>💬 문의내용</b>\n${fields['문의사항']}\n` : ''}
📊 Airtable에서 확인`;

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
// 캐시 설정
// ================================================
const CACHE_TTL = 60; // 60초 캐시 (Airtable API 제한 대응)
const CACHE_KEY_PREFIX = 'euninbiz-leads-';

// 캐시 무효화 함수
async function invalidateLeadsCache(cache) {
  try {
    // 기본 캐시 키 삭제 (100 레코드, 필터 없음)
    const defaultCacheKey = new Request(
      `https://cache.euninbiz.co.kr/${CACHE_KEY_PREFIX}100-`,
      { method: 'GET' }
    );
    await cache.delete(defaultCacheKey);
    console.log('🗑️ Leads cache invalidated');
  } catch (error) {
    console.error('❌ Cache invalidation error:', error.message);
  }
}

// ================================================
// /leads 핸들러 - Airtable 조회/수정 (캐싱 적용)
// ================================================
async function handleLeads(request, env, corsHeaders) {
  const url = new URL(request.url);
  const cache = caches.default;

  // GET: 목록 조회 (캐싱 적용)
  if (request.method === 'GET') {
    try {
      // 쿼리 파라미터
      const maxRecords = url.searchParams.get('maxRecords') || '100';
      const filterByFormula = url.searchParams.get('filter') || '';
      const noCache = url.searchParams.get('noCache') === 'true';

      // 캐시 키 생성
      const cacheKey = new Request(
        `https://cache.euninbiz.co.kr/${CACHE_KEY_PREFIX}${maxRecords}-${filterByFormula}`,
        { method: 'GET' }
      );

      // 캐시 확인 (noCache가 아닐 경우)
      if (!noCache) {
        const cachedResponse = await cache.match(cacheKey);
        if (cachedResponse) {
          console.log('📦 Cache HIT for leads');
          const cachedData = await cachedResponse.json();
          return new Response(JSON.stringify({
            ...cachedData,
            cached: true,
            cacheAge: Math.round((Date.now() - cachedData.cachedAt) / 1000)
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        console.log('📭 Cache MISS for leads');
      }

      let airtableUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_NAME)}?maxRecords=${maxRecords}`;

      if (filterByFormula) {
        airtableUrl += `&filterByFormula=${encodeURIComponent(filterByFormula)}`;
      }

      const response = await fetch(airtableUrl, {
        headers: {
          'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return new Response(JSON.stringify({ success: false, error }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const data = await response.json();

      // 필드 매핑하여 반환
      const leads = data.records.map(record => ({
        id: record.id,
        createdTime: record.createdTime,
        기업명: record.fields['기업명'] || '',
        대표자명: record.fields['대표자명'] || '',
        연락처: record.fields['연락처'] || '',
        이메일: record.fields['이메일'] || '',
        사업자번호: record.fields['사업자번호'] || '',
        업종: record.fields['업종'] || '',
        지역: record.fields['지역'] || '',
        설립연도: record.fields['설립연도'] || '',
        직전년도매출: record.fields['직전년도매출'] || '',
        필요자금규모: record.fields['필요자금규모'] || '',
        자금종류: record.fields['지원받고 싶은 자금종류'] || [],
        통화가능시간: record.fields['통화가능시간'] || '',
        문의사항: record.fields['문의사항'] || '',
        상태: record.fields['상태'] || '대기중',
        메모: record.fields['메모'] || '',
      }));

      const responseData = { success: true, leads, cachedAt: Date.now() };

      // 캐시에 저장
      const cacheResponse = new Response(JSON.stringify(responseData), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${CACHE_TTL}`
        }
      });
      await cache.put(cacheKey, cacheResponse.clone());
      console.log('💾 Cached leads data');

      return new Response(JSON.stringify({ ...responseData, cached: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // PATCH: 레코드 수정 (상태, 메모 등)
  if (request.method === 'PATCH') {
    try {
      const { recordId, fields } = await request.json();

      if (!recordId) {
        return new Response(JSON.stringify({ success: false, error: 'recordId required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const response = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_NAME)}/${recordId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return new Response(JSON.stringify({ success: false, error }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await response.json();

      // 캐시 무효화
      await invalidateLeadsCache(cache);

      return new Response(JSON.stringify({ success: true, record: result, cacheInvalidated: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // DELETE: 레코드 삭제
  if (request.method === 'DELETE') {
    try {
      const { recordId } = await request.json();

      if (!recordId) {
        return new Response(JSON.stringify({ success: false, error: 'recordId required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const response = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_NAME)}/${recordId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return new Response(JSON.stringify({ success: false, error }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 캐시 무효화
      await invalidateLeadsCache(cache);

      return new Response(JSON.stringify({ success: true, deleted: recordId, cacheInvalidated: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
}

// ================================================
// /board 핸들러 - 게시판 조회
// ================================================
async function handleBoard(request, env, corsHeaders) {
  // GET: 게시글 목록 조회
  if (request.method === 'GET') {
    try {
      const BOARD_TABLE = '게시판';

      // 게시여부가 true인 게시글만, 작성일 내림차순 정렬
      const airtableUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(BOARD_TABLE)}`;

      const response = await fetch(airtableUrl, {
        headers: {
          'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return new Response(JSON.stringify({ success: false, error }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const data = await response.json();

      // 필드 매핑하여 반환
      const allPosts = data.records.map(record => ({
        id: record.id,
        제목: record.fields['제목'] || '',
        내용: record.fields['내용'] || '',
        요약: record.fields['요약'] || (record.fields['내용'] || '').substring(0, 100),
        카테고리: record.fields['카테고리'] || '공지',
        썸네일: record.fields['썸네일']?.[0]?.url || null,
        작성일: record.fields['작성일'] || '',
        조회수: record.fields['조회수'] || 0,
        게시여부: record.fields['게시여부'] ?? true,
      }));

      // /board: 공개 게시글만, /board/all: 전체 (관리자용)
      const url = new URL(request.url);
      const isAdminRequest = url.pathname === '/board/all';
      const posts = isAdminRequest ? allPosts : allPosts.filter(p => p.게시여부 === true);

      return new Response(JSON.stringify({ success: true, posts }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
}

// ================================================
// /auth 핸들러 - 관리자 인증
// ================================================
const ADMIN_PASSWORD = 'love1025!!'; // 관리자 비밀번호

async function handleAuth(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { password } = await request.json();

    if (password === ADMIN_PASSWORD) {
      // 간단한 토큰 생성 (실제 운영시 더 안전한 방식 사용)
      const token = btoa(`euninbiz_admin_${Date.now()}`);
      return new Response(JSON.stringify({
        success: true,
        token: token,
        expiresIn: 24 * 60 * 60 * 1000 // 24시간
      }), {
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
// /analytics 핸들러 - GA4 Data API
// ================================================
async function handleAnalytics(request, env, corsHeaders, path, url) {
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const privateKey = env.GA4_PRIVATE_KEY;
    if (!privateKey) {
      return new Response(JSON.stringify({ error: 'GA4_PRIVATE_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const period = url.searchParams.get('period') || 'daily';
    const accessToken = await getGA4AccessToken(privateKey);

    let data;
    switch (path) {
      case '/analytics/overview':
        data = await getGA4Overview(accessToken, period);
        break;
      case '/analytics/traffic':
        data = await getGA4TrafficSources(accessToken, period);
        break;
      case '/analytics/pages':
        data = await getGA4TopPages(accessToken, period);
        break;
      case '/analytics/devices':
        data = await getGA4Devices(accessToken, period);
        break;
      case '/analytics/geography':
        data = await getGA4Geography(accessToken, period);
        break;
      case '/analytics/trend':
        data = await getGA4DailyTrend(accessToken, period);
        break;
      case '/analytics/all':
        const [overview, traffic, pages, devices, geography, trend] = await Promise.all([
          getGA4Overview(accessToken, period),
          getGA4TrafficSources(accessToken, period),
          getGA4TopPages(accessToken, period),
          getGA4Devices(accessToken, period),
          getGA4Geography(accessToken, period),
          getGA4DailyTrend(accessToken, period)
        ]);
        data = { overview, traffic, pages, devices, geography, trend };
        break;
      default:
        return new Response(JSON.stringify({
          error: 'Not found',
          endpoints: ['/analytics/overview', '/analytics/traffic', '/analytics/pages', '/analytics/devices', '/analytics/geography', '/analytics/trend', '/analytics/all']
        }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// GA4 JWT 생성 및 토큰 발급
function base64urlEncode(str) {
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function createGA4JWT(privateKey) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const pemContents = privateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\\n/g, '')
    .replace(/\s/g, '');

  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = base64urlEncode(String.fromCharCode(...new Uint8Array(signature)));
  return `${signatureInput}.${encodedSignature}`;
}

async function getGA4AccessToken(privateKey) {
  const jwt = await createGA4JWT(privateKey);
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const data = await response.json();
  if (!data.access_token) {
    throw new Error('Failed to get access token: ' + JSON.stringify(data));
  }
  return data.access_token;
}

async function callGA4API(accessToken, requestBody) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
  );
  return response.json();
}

function getGA4DateRange(period) {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  let startDate;

  switch (period) {
    case 'daily': startDate = endDate; break;
    case 'weekly':
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
      break;
    case 'monthly':
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      startDate = monthAgo.toISOString().split('T')[0];
      break;
    default: startDate = endDate;
  }
  return { startDate, endDate };
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}분 ${secs}초`;
}

async function getGA4Overview(accessToken, period) {
  const { startDate, endDate } = getGA4DateRange(period);

  const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
  const prevEnd = new Date(startDate);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - daysDiff + 1);

  const [currentData, previousData] = await Promise.all([
    callGA4API(accessToken, {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' }
      ]
    }),
    callGA4API(accessToken, {
      dateRanges: [{
        startDate: prevStart.toISOString().split('T')[0],
        endDate: prevEnd.toISOString().split('T')[0]
      }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' }
      ]
    })
  ]);

  const current = currentData.rows?.[0]?.metricValues || [];
  const previous = previousData.rows?.[0]?.metricValues || [];

  const visitors = parseInt(current[0]?.value || 0);
  const pageviews = parseInt(current[1]?.value || 0);
  const duration = parseFloat(current[2]?.value || 0);
  const bounceRate = parseFloat(current[3]?.value || 0);

  const prevVisitors = parseInt(previous[0]?.value || 1) || 1;
  const prevPageviews = parseInt(previous[1]?.value || 1) || 1;
  const prevDuration = parseFloat(previous[2]?.value || 1) || 1;
  const prevBounceRate = parseFloat(previous[3]?.value || 0.01) || 0.01;

  return {
    period: { startDate, endDate },
    visitors: { value: visitors, change: Math.round(((visitors - prevVisitors) / prevVisitors) * 100) },
    pageviews: { value: pageviews, change: Math.round(((pageviews - prevPageviews) / prevPageviews) * 100) },
    duration: { value: formatDuration(duration), seconds: duration, change: Math.round(((duration - prevDuration) / prevDuration) * 100) },
    bounceRate: { value: Math.round(bounceRate * 100), change: Math.round(((bounceRate - prevBounceRate) / prevBounceRate) * 100) }
  };
}

async function getGA4TrafficSources(accessToken, period) {
  const { startDate, endDate } = getGA4DateRange(period);
  const data = await callGA4API(accessToken, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 10
  });

  const total = data.rows?.reduce((sum, row) => sum + parseInt(row.metricValues[0].value), 0) || 1;
  const sources = data.rows?.map(row => ({
    source: row.dimensionValues[0].value,
    sessions: parseInt(row.metricValues[0].value),
    percentage: Math.round((parseInt(row.metricValues[0].value) / total) * 100)
  })) || [];

  return { period: { startDate, endDate }, sources, total };
}

async function getGA4TopPages(accessToken, period) {
  const { startDate, endDate } = getGA4DateRange(period);
  const data = await callGA4API(accessToken, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10
  });

  const pages = data.rows?.map(row => ({
    path: row.dimensionValues[0].value,
    views: parseInt(row.metricValues[0].value)
  })) || [];

  return { period: { startDate, endDate }, pages };
}

async function getGA4Devices(accessToken, period) {
  const { startDate, endDate } = getGA4DateRange(period);
  const data = await callGA4API(accessToken, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [{ name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
  });

  const total = data.rows?.reduce((sum, row) => sum + parseInt(row.metricValues[0].value), 0) || 1;
  const devices = data.rows?.map(row => ({
    device: row.dimensionValues[0].value,
    users: parseInt(row.metricValues[0].value),
    percentage: Math.round((parseInt(row.metricValues[0].value) / total) * 100)
  })) || [];

  return { period: { startDate, endDate }, devices, total };
}

async function getGA4Geography(accessToken, period) {
  const { startDate, endDate } = getGA4DateRange(period);
  const data = await callGA4API(accessToken, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'city' }],
    metrics: [{ name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    limit: 10
  });

  const regions = data.rows?.map(row => ({
    city: row.dimensionValues[0].value,
    users: parseInt(row.metricValues[0].value)
  })) || [];

  return { period: { startDate, endDate }, regions };
}

async function getGA4DailyTrend(accessToken, period) {
  const { startDate, endDate } = getGA4DateRange(period);
  const data = await callGA4API(accessToken, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
    orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
  });

  const trend = data.rows?.map(row => ({
    date: row.dimensionValues[0].value,
    visitors: parseInt(row.metricValues[0].value),
    pageviews: parseInt(row.metricValues[1].value)
  })) || [];

  return { period: { startDate, endDate }, trend };
}

// ================================================
// /webhook/meta-lead 핸들러 - Meta Lead Ads Webhook
// ================================================
async function handleMetaLeadWebhook(request, env, corsHeaders) {
  const url = new URL(request.url);

  // GET: Meta Webhook 구독 검증
  if (request.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    console.log('📥 Meta webhook verification:', { mode, token });

    if (mode === 'subscribe' && token === env.META_VERIFY_TOKEN) {
      console.log('✅ Webhook verification successful');
      return new Response(challenge, { status: 200 });
    } else {
      console.error('❌ Webhook verification failed');
      return new Response('Forbidden', { status: 403 });
    }
  }

  // POST: Lead 데이터 수신
  if (request.method === 'POST') {
    try {
      const payload = await request.json();
      console.log('📥 Meta Lead webhook received:', JSON.stringify(payload));

      // Meta webhook payload 구조:
      // { object: 'page', entry: [{ id, time, changes: [{ field: 'leadgen', value: { ... } }] }] }
      if (payload.object !== 'page') {
        return new Response(JSON.stringify({ success: true, message: 'Not a page event' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const results = [];

      for (const entry of payload.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'leadgen') {
            const leadgenId = change.value.leadgen_id;
            const formId = change.value.form_id;
            const pageId = change.value.page_id;

            console.log('🔍 Processing lead:', { leadgenId, formId, pageId });

            // Graph API로 실제 Lead 데이터 조회
            const leadData = await fetchMetaLeadData(leadgenId, env.META_ACCESS_TOKEN);

            if (leadData) {
              // Airtable에 저장
              const airtableResult = await saveMetaLeadToAirtable(leadData, formId, env);

              // Telegram 알림
              const telegramResult = await sendMetaLeadTelegram(leadData, formId, env);

              results.push({
                leadgenId,
                leadData: leadData.success,
                airtable: airtableResult.success,
                telegram: telegramResult.success
              });
            } else {
              results.push({ leadgenId, error: 'Failed to fetch lead data' });
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('❌ Meta webhook error:', error.message);
      // Meta expects 200 response even on errors
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
}

// Meta Graph API로 Lead 데이터 조회
async function fetchMetaLeadData(leadgenId, accessToken) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${accessToken}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Meta Graph API error:', error);
      return null;
    }

    const data = await response.json();
    console.log('✅ Lead data fetched:', JSON.stringify(data));

    // field_data를 객체로 변환
    const fields = {};
    for (const field of data.field_data || []) {
      fields[field.name] = field.values?.[0] || '';
    }

    return {
      success: true,
      id: data.id,
      created_time: data.created_time,
      fields
    };
  } catch (error) {
    console.error('❌ fetchMetaLeadData error:', error.message);
    return null;
  }
}

// Meta Lead를 Airtable에 저장
async function saveMetaLeadToAirtable(leadData, formId, env) {
  try {
    const fields = leadData.fields;

    // Meta Lead 폼 필드를 Airtable 필드로 매핑
    // (Meta 폼 필드명은 설정에 따라 다름, 아래는 일반적인 예시)
    const airtableFields = {
      '기업명': fields['company_name'] || fields['회사명'] || '',
      '대표자명': fields['full_name'] || fields['이름'] || '',
      '연락처': fields['phone_number'] || fields['연락처'] || '',
      '이메일': fields['email'] || fields['이메일'] || '',
      '문의사항': fields['message'] || fields['문의내용'] || '',
      '유입경로': `Meta Lead (Form: ${formId})`,
      '상태': '대기중'
    };

    // 빈 필드 제거
    Object.keys(airtableFields).forEach(key => {
      if (!airtableFields[key]) delete airtableFields[key];
    });

    const response = await fetch(
      `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_NAME)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields: airtableFields })
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Meta Lead saved to Airtable:', result.id);
      return { success: true, id: result.id };
    } else {
      const error = await response.json();
      console.error('❌ Airtable error:', error);
      return { success: false, error };
    }
  } catch (error) {
    console.error('❌ saveMetaLeadToAirtable error:', error.message);
    return { success: false, error: error.message };
  }
}

// Meta Lead Telegram 알림
async function sendMetaLeadTelegram(leadData, formId, env) {
  try {
    const fields = leadData.fields;

    const telegramText = `🔔 <b>은인자금파트너스 - Meta 광고 리드</b>

<b>📱 리드 정보</b>
├ 기업명: <b>${fields['company_name'] || fields['회사명'] || '-'}</b>
├ 담당자: <b>${fields['full_name'] || fields['이름'] || '-'}</b>
├ 연락처: <code>${fields['phone_number'] || fields['연락처'] || '-'}</code>
├ 이메일: ${fields['email'] || fields['이메일'] || '-'}
└ 수신시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}

${fields['message'] || fields['문의내용'] ? `<b>💬 문의내용</b>\n${fields['message'] || fields['문의내용']}\n` : ''}
📊 Airtable에서 확인
🔗 출처: Meta Lead Ads (Form: ${formId})`;

    const response = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: telegramText,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Meta Lead Telegram sent:', result.result.message_id);
      return { success: true };
    } else {
      const error = await response.json();
      console.error('❌ Telegram error:', error);
      return { success: false, error };
    }
  } catch (error) {
    console.error('❌ sendMetaLeadTelegram error:', error.message);
    return { success: false, error: error.message };
  }
}
