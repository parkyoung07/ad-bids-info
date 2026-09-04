/**
 * 관리자 세션 상태 확인 엔드포인트 (/api/admin/auth/me)
 */

export async function onRequestGet(context) {
  const adminUser = context.data.adminUser;
  return new Response(JSON.stringify({
    authenticated: true,
    user: {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
      csrfToken: adminUser.csrfToken
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
