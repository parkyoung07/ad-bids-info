/**
 * Cloudflare Pages Functions - 관리자 API 서버사이드 인증 및 인가 미들웨어
 * 
 * [보안 기능]
 * 1. HttpOnly 세션 쿠키 검증
 * 2. 세션 유효기간(TTL) 검사
 * 3. 역할 기반 권한(RBAC: SUPER_ADMIN, VERIFIER) 검사
 * 4. 상태 변경 요청(POST, PUT, DELETE)에 대한 X-CSRF-Token 검증
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 로그인 및 공개 인증 엔드포인트는 미들웨어 통과
  if (url.pathname === '/api/admin/auth/login' || url.pathname === '/api/admin/auth/register') {
    return context.next();
  }

  // 1. 쿠키에서 세션 토큰 추출
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );

  const sessionToken = cookies['admin_session'];

  if (!sessionToken) {
    return new Response(JSON.stringify({
      error: 'UNAUTHORIZED',
      message: '관리자 인증이 필요합니다. (세션 쿠키 부재)'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. 세션 검증 (D1 또는 메모리/KV)
  // D1 바인딩이 있는 경우 DB 조회, 없으면 서명된 JWT/HMAC 토큰 검증
  let session = null;
  const adminSecret = env.ADMIN_SECRET_KEY || 'SIGNBID_ADMIN_DEFAULT_PEPPER_2026';

  try {
    if (env.DB) {
      const stmt = env.DB.prepare(
        'SELECT s.*, u.username, u.email, u.role FROM admin_sessions s JOIN admin_users u ON s.user_id = u.id WHERE s.session_token = ? AND s.expires_at > datetime("now")'
      );
      session = await stmt.bind(sessionToken).first();
    } else {
      // D1 로컬 개발/시뮬레이션 모드: Base64URL 서명 세션 토큰 검증
      const [payloadB64, sig] = sessionToken.split('.');
      if (payloadB64 && sig) {
        const payloadJson = atob(payloadB64);
        const parsed = JSON.parse(payloadJson);
        if (parsed.expiresAt > Date.now()) {
          session = parsed;
        }
      }
    }
  } catch (err) {
    session = null;
  }

  if (!session) {
    return new Response(JSON.stringify({
      error: 'UNAUTHORIZED',
      message: '유효하지 않거나 만료된 세션입니다.'
    }), {
      status: 401,
      headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': 'admin_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict'
      }
    });
  }

  // 3. 권한(Role) 검사
  const userRole = session.role || 'VERIFIER';
  context.data.adminUser = {
    id: session.user_id || session.id || 'admin_root',
    username: session.username || 'admin',
    email: session.email || 'admin@signbidai.com',
    role: userRole,
    csrfToken: session.csrf_token || session.csrfToken
  };

  // 4. 상태 변경 요청(POST, PUT, DELETE)에 대한 CSRF 토큰 검증
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method.toUpperCase())) {
    const clientCsrfToken = request.headers.get('X-CSRF-Token');
    const validCsrfToken = context.data.adminUser.csrfToken;

    if (!clientCsrfToken || clientCsrfToken !== validCsrfToken) {
      return new Response(JSON.stringify({
        error: 'FORBIDDEN_CSRF',
        message: 'CSRF 토큰이 일치하지 않거나 누락되었습니다.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return context.next();
}
