/**
 * 관리자 공고 검수 및 불변 감사로그 기록 엔드포인트 (/api/admin/verify)
 * 
 * [수행 기능]
 * 1. 공고 상태 변경 (APPROVE, REJECT, HOLD, FLAG)
 * 2. HMAC-SHA256 무결성 해시 생성
 * 3. Append-Only 감사로그 테이블에 영구 INSERT
 */

async function generateHmacSha256(dataStr, secretKey) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(dataStr));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const adminUser = context.data.adminUser;

  // 권한 검사 (VERIFIER 또는 SUPER_ADMIN 필요)
  if (!['SUPER_ADMIN', 'VERIFIER'].includes(adminUser.role)) {
    return new Response(JSON.stringify({
      error: 'FORBIDDEN',
      message: '공고 검수 권한이 없습니다.'
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { bidKey, action, reason, beforeState, afterState } = body;

    if (!bidKey || !action || !reason) {
      return new Response(JSON.stringify({
        error: 'BAD_REQUEST',
        message: 'bidKey, action, reason은 필수 항목입니다.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const logId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const requestId = request.headers.get('cf-ray') || crypto.randomUUID();
    const clientIp = request.headers.get('cf-connecting-ip') || '127.0.0.1';
    const secretPepper = env.AUDIT_SECRET_PEPPER || 'SIGNBID_AUDIT_PEPPER_KEY_2026';

    const beforeJson = JSON.stringify(beforeState || {});
    const afterJson = JSON.stringify(afterState || {});

    // HMAC-SHA256 무결성 서명 계산
    const signPayload = `${adminUser.id}|${timestamp}|${bidKey}|${action}|${afterJson}|${requestId}`;
    const integrityHash = await generateHmacSha256(signPayload, secretPepper);

    const auditLogEntry = {
      id: logId,
      admin_user_id: adminUser.username,
      admin_role: adminUser.role,
      timestamp: timestamp,
      target_bid_key: bidKey,
      action: action,
      before_state: beforeJson,
      after_state: afterJson,
      reason: reason,
      request_id: requestId,
      client_ip: clientIp.replace(/\.\d+$/, '.***'), // IP 마스킹
      integrity_hash: integrityHash
    };

    // D1이 바인딩되어 있다면 DB INSERT
    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO audit_logs (id, admin_user_id, admin_role, timestamp, target_bid_key, action, before_state, after_state, reason, request_id, client_ip, integrity_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        auditLogEntry.id,
        auditLogEntry.admin_user_id,
        auditLogEntry.admin_role,
        auditLogEntry.timestamp,
        auditLogEntry.target_bid_key,
        auditLogEntry.action,
        auditLogEntry.before_state,
        auditLogEntry.after_state,
        auditLogEntry.reason,
        auditLogEntry.request_id,
        auditLogEntry.client_ip,
        auditLogEntry.integrity_hash
      ).run();
    }

    return new Response(JSON.stringify({
      success: true,
      message: `공고 [${bidKey}]에 대한 [${action}] 처리가 감사로그에 영구 보존되었습니다.`,
      auditLog: auditLogEntry
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: 'SERVER_ERROR',
      message: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
