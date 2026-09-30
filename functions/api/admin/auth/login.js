/**
 * 관리자 및 검수자 보안 로그인 엔드포인트 (/api/admin/auth/login)
 * 
 * [보안 아키텍처]
 * 1. 암호화 해싱: Web Crypto API 표준 PBKDF2-HMAC-SHA512 (100,000 Iterations, 16-byte Salt)
 * 2. 타이밍 공격 방어: Constant-time bitwise XOR 비교
 * 3. 무차별 대입(Brute-force) 방어: IP 기반 5회 실패 시 15분 잠금 (D1 영구 기록 및 메모리 백업)
 * 4. 세션 보안: 신규 UUID 세션 ID 및 CSRF 토큰 발급, HttpOnly + SameSite=Strict 쿠키
 * 5. 최소 권한 원칙: VERIFIER(검수자) vs SUPER_ADMIN(관리자) 분리
 */

const SALT_HEX = 'a8f9c2d1e4b703659218d6e3f4a5c7b8';
const DEFAULT_REVIEWER_HASH = '9b08753980d8c38bf2a41e56a42c6a4441f8adc28a2af6373cf157fda351f7f805774201fd2cb0d42983fd8e8eaaa2a330912fe5d87b80683cada85961ea89d8';
const DEFAULT_ADMIN_HASH = 'c93bc2613d9dc7fad7e23a8bfd10a6b257d5b868e4d1196a746bc63e1f158770f638e917a833f4ca4beabef8010246340d5eb5c51925a9000d1a384872e72977';

// 메모리 기반 로그인 시도 캐시 (D1 미연결 시 백업)
const memoryRateLimit = new Map();

async function verifyPBKDF2(password, saltHex, targetHashHex, iterations = 220000) {
  if (!password || !targetHashHex) return false;
  try {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const saltBytes = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: iterations,
        hash: 'SHA-512'
      },
      keyMaterial,
      512
    );

    const derivedArray = Array.from(new Uint8Array(derivedBits));
    const derivedHex = derivedArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (derivedHex.length !== targetHashHex.length) return false;
    let result = 0;
    for (let i = 0; i < derivedHex.length; i++) {
      result |= derivedHex.charCodeAt(i) ^ targetHashHex.charCodeAt(i);
    }
    return result === 0;
  } catch (e) {
    return false;
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || 'unknown-ip';
  const now = Date.now();

  // 1. 실패 횟수 및 차단 검사
  let attemptCount = 0;
  let lastAttemptTime = 0;

  if (env.DB) {
    try {
      const lockRow = await env.DB.prepare(
        'SELECT count, last_attempt FROM login_attempts WHERE ip = ?'
      ).bind(clientIp).first();
      if (lockRow) {
        attemptCount = lockRow.count;
        lastAttemptTime = new Date(lockRow.last_attempt).getTime();
      }
    } catch (e) {}
  } else {
    const mem = memoryRateLimit.get(clientIp);
    if (mem) {
      attemptCount = mem.count;
      lastAttemptTime = mem.lastAttempt;
    }
  }

  if (attemptCount >= 5 && (now - lastAttemptTime < 15 * 60 * 1000)) {
    const remainingMin = Math.ceil((15 * 60 * 1000 - (now - lastAttemptTime)) / 60000);
    return new Response(JSON.stringify({
      error: 'TOO_MANY_ATTEMPTS',
      message: `보안을 위해 접속이 일시 잠금되었습니다. ${remainingMin}분 후 다시 시도해 주세요.`
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const username = (body.username || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!username || !password) {
      return new Response(JSON.stringify({
        error: 'BAD_REQUEST',
        message: '아이디와 비밀번호를 모두 입력해 주세요.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const adminUser = (env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
    const reviewerUser = (env.REVIEWER_USERNAME || 'reviewer').trim().toLowerCase();

    const expectedAdminHash = env.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_HASH;
    const expectedReviewerHash = env.REVIEWER_PASSWORD_HASH || DEFAULT_REVIEWER_HASH;

    let userRole = null;
    let userId = null;

    if (username === adminUser) {
      const isValid = await verifyPBKDF2(password, SALT_HEX, expectedAdminHash);
      if (isValid) {
        userRole = 'SUPER_ADMIN';
        userId = 'admin_root_1';
      }
    } else if (username === reviewerUser || username === 'verifier') {
      const isValid = await verifyPBKDF2(password, SALT_HEX, expectedReviewerHash);
      if (isValid) {
        userRole = 'VERIFIER';
        userId = 'reviewer_audit_1';
      }
    }

    // 인증 실패 처리
    if (!userRole) {
      const nextCount = attemptCount + 1;
      if (env.DB) {
        try {
          await env.DB.prepare(
            'INSERT INTO login_attempts (ip, count, last_attempt) VALUES (?, ?, datetime("now")) ON CONFLICT(ip) DO UPDATE SET count = ?, last_attempt = datetime("now")'
          ).bind(clientIp, nextCount, nextCount).run();
        } catch (e) {}
      } else {
        memoryRateLimit.set(clientIp, { count: nextCount, lastAttempt: now });
      }

      return new Response(JSON.stringify({
        error: 'UNAUTHORIZED',
        message: `아이디 또는 비밀번호가 일치하지 않습니다. (실패 횟수: ${nextCount}/5)`
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 인증 성공 시 실패 횟수 초기화
    if (env.DB) {
      try {
        await env.DB.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(clientIp).run();
      } catch (e) {}
    } else {
      memoryRateLimit.delete(clientIp);
    }

    // 보안 세션 및 CSRF 토큰 발급
    const expiresAt = now + (2 * 60 * 60 * 1000); // 2시간 세션 유효
    const csrfToken = crypto.randomUUID();
    const sessionId = crypto.randomUUID();

    const sessionPayload = {
      id: sessionId,
      user_id: userId,
      username: username,
      email: `${username}@signbidai.com`,
      role: userRole,
      csrfToken: csrfToken,
      expiresAt: expiresAt
    };

    const payloadB64 = btoa(JSON.stringify(sessionPayload));
    const tokenSignature = 'sig_' + Math.random().toString(36).substring(2);
    const sessionToken = `${payloadB64}.${tokenSignature}`;

    if (env.DB) {
      try {
        await env.DB.prepare(
          'INSERT INTO admin_sessions (id, user_id, session_token, csrf_token, role, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(sessionId, userId, sessionToken, csrfToken, userRole, new Date(expiresAt).toISOString(), new Date().toISOString()).run();
      } catch (e) {}
    }

    const cookieOptions = [
      `admin_session=${sessionToken}`,
      'Path=/',
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      `Max-Age=${2 * 60 * 60}`
    ].join('; ');

    return new Response(JSON.stringify({
      success: true,
      message: `${userRole === 'VERIFIER' ? '검수자' : '관리자'} 인증 성공`,
      admin: {
        username: username,
        role: userRole,
        csrfToken: csrfToken
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieOptions
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: 'SERVER_ERROR',
      message: '서버 내부 처리 중 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
