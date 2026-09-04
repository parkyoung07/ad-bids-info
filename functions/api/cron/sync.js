/**
 * Cloudflare Pages Functions - 예약 동기화 엔드포인트 (/api/cron/sync)
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization') || '';
  const expectedSecret = env.CRON_SECRET || 'SIGNBID_CRON_TRIGGER_SECRET_2026';

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return new Response(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Cron 인증 실패' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    success: true,
    message: '정기 동기화 헬스체크 정상',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
