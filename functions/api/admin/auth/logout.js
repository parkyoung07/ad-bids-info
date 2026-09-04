/**
 * 관리자 로그아웃 엔드포인트 (/api/admin/auth/logout)
 */

export async function onRequestPost(context) {
  return new Response(JSON.stringify({
    success: true,
    message: '성공적으로 로그아웃되었습니다.'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'admin_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict'
    }
  });
}
