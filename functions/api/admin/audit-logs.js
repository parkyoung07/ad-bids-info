/**
 * 불변 감사로그 조회 엔드포인트 (/api/admin/audit-logs) - Read-Only
 */

export async function onRequestGet(context) {
  const { env } = context;

  try {
    let logs = [];
    if (env.DB) {
      const { results } = await env.DB.prepare(
        'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50'
      ).all();
      logs = results || [];
    }

    return new Response(JSON.stringify({
      success: true,
      totalLogs: logs.length,
      logs: logs
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
