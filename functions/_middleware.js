/**
 * Cloudflare Pages Edge Middleware
 * 
 * 1. 구형 불일치/미검증 공고(/bids/R26BK*, /bids/DEMO-G2B*, /bids/2026* 등)에 대해 
 *    302 리다이렉트 없이 최초 요청에서 직접 HTTP 410 Gone 반환
 * 2. /404 직접 접근 시 HTTP 404 Not Found 상태 코드 반환
 * 3. 미존재 공고 ID 요청 시 HTTP 404 Not Found 반환
 */

const VALID_DEMO_BIDS = new Set([
  'DEMO-BID-001',
  'DEMO-BID-002',
  'DEMO-BID-003',
  'DEMO-BID-004',
  'DEMO-BID-005',
  'DEMO-BID-006',
  'DEMO-BID-007',
  'DEMO-BID-008',
]);

const GONE_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>410 Gone | 영구 삭제된 공고 | SignBid AI</title>
  <style>
    body { background-color: #020617; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 24px; padding: 36px; max-width: 480px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .icon { width: 48px; height: 48px; margin: 0 auto 16px auto; background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #f43f5e; font-size: 24px; }
    .badge { display: inline-block; font-family: monospace; font-size: 11px; font-weight: bold; color: #f43f5e; background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.25); padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; }
    h1 { font-size: 20px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin: 0 0 24px 0; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 12px; transition: background 0.2s; }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✕</div>
    <div class="badge">HTTP 410 GONE · 영구 삭제됨</div>
    <h1>영구 삭제된 공고입니다</h1>
    <p>요청하신 공고는 실시간 공공데이터 원문 검증 과정에서 불일치 및 미검증으로 확인되어 시스템에서 <strong>영구 삭제(410 Gone)</strong> 처리되었습니다.<br>더 이상 제공되지 않으며 실제 투찰에 사용하실 수 없습니다.</p>
    <a href="/" class="btn">SignBid AI 홈으로 이동</a>
  </div>
</body>
</html>`;

const NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>404 Not Found | SignBid AI</title>
  <style>
    body { background-color: #020617; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 24px; padding: 36px; max-width: 480px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .icon { width: 48px; height: 48px; margin: 0 auto 16px auto; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #ef4444; font-size: 24px; }
    .badge { display: inline-block; font-family: monospace; font-size: 11px; font-weight: bold; color: #ef4444; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; }
    h1 { font-size: 20px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin: 0 0 24px 0; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 12px; transition: background 0.2s; }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">!</div>
    <div class="badge">HTTP 404 NOT FOUND</div>
    <h1>존재하지 않거나 삭제된 페이지입니다</h1>
    <p>요청하신 페이지 또는 공고를 찾을 수 없습니다.<br>입력하신 주소가 정확한지 다시 한번 확인해 주시기 바랍니다.</p>
    <a href="/" class="btn">SignBid AI 홈으로 이동</a>
  </div>
</body>
</html>`;

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // 1. /bids/* 경로 검증
  if (pathname.startsWith('/bids/')) {
    const segments = pathname.replace(/^\/bids\/?/, '').split('/');
    const bidId = segments[0];

    // /bids 또는 /bids/ 로 공고 목록 접근한 경우 메인으로 넘김
    if (!bidId) {
      return context.next();
    }

    // 유효한 DEMO 공고 ID는 정상 정적 HTML 서빙 (200 OK)
    if (VALID_DEMO_BIDS.has(bidId)) {
      return context.next();
    }

    // 구형 불일치/미검증 공고번호 패턴은 직접 410 Gone 반환 (리다이렉트 없이)
    if (
      bidId.startsWith('R26BK') ||
      bidId.startsWith('DEMO-G2B') ||
      bidId.startsWith('DEMO-KAPT') ||
      bidId.startsWith('DEMO-ONBID') ||
      bidId.startsWith('2026')
    ) {
      return new Response(GONE_HTML, {
        status: 410,
        statusText: 'Gone',
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      });
    }

    // 그 외 존재하지 않는 공고 ID는 직접 404 Not Found 반환
    return new Response(NOT_FOUND_HTML, {
      status: 404,
      statusText: 'Not Found',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  // 2. /404 경로 직접 요청 시 404 Not Found 상태 코드 반환
  if (pathname === '/404' || pathname === '/404/' || pathname === '/404.html') {
    return new Response(NOT_FOUND_HTML, {
      status: 404,
      statusText: 'Not Found',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  // 3. 그 외 정상 경로는 다음 핸들러(정적 에셋 등)로 통과
  return context.next();
}
