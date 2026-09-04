'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface RawBid {
  bidKey: string;
  verificationStatus: string;
  verificationTier: number;
  verifiedAt: string | null;
  verifierId: string | null;
  isPublicLocked: boolean;
  raw: {
    mainApi: any;
    regionApi: any[];
    chgHstryApi: any[];
  };
  normalized: {
    bidNo: string;
    bidOrd: string;
    title: string;
    noticeKind: string;
    client: string;
    allocatedBudget: number | null;
    estimatedPrice: number | null;
    baseAmount: number | null;
    startDate: string | null;
    endDate: string | null;
    openingDate: string | null;
    contractMethod: string | null;
    industryRestriction: boolean;
    manufactureRequired: boolean;
    regionStatus: string;
    restrictedRegions: string[] | null;
    displayRegion: string;
    g2bDetailUrl: string;
    specDocUrls: string[];
  };
  ai: {
    modelId: string;
    analyzedAt: string;
    category: string;
    summary: string;
    tips: string;
    isSegregatedFromOfficial: boolean;
  };
}

interface AuditLog {
  id: string;
  admin_user_id: string;
  admin_role: string;
  timestamp: string;
  target_bid_key: string;
  action: string;
  before_state: string;
  after_state: string;
  reason: string;
  request_id: string;
  client_ip: string;
  integrity_hash: string;
}

export default function AdminVerifyClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminUser, setAdminUser] = useState<any>(null);

  const [bids, setBids] = useState<RawBid[]>([]);
  const [selectedBid, setSelectedBid] = useState<RawBid | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reasonInput, setReasonInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 1. 초기 인증 상태 및 데이터 로드
  useEffect(() => {
    checkAuth();
    loadBids();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setAdminUser(data.user);
        loadAuditLogs();
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  const loadBids = async () => {
    try {
      const res = await fetch('/data/bids-verified-raw.json');
      if (res.ok) {
        const data = await res.json();
        setBids(data);
        if (data.length > 0) {
          setSelectedBid(data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load raw bids:', e);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (e) {}
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAdminUser(data.admin);
        loadAuditLogs();
      } else {
        setLoginError(data.message || '인증 실패');
      }
    } catch (e: any) {
      setLoginError(e.message || '서버 통신 오류');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  const handleAction = async (action: 'APPROVE' | 'REJECT' | 'HOLD') => {
    if (!selectedBid) return;
    if (!reasonInput.trim()) {
      alert('검수 사유(Reason)를 반드시 입력해야 합니다.');
      return;
    }

    setActionLoading(true);
    setNotification(null);

    const beforeState = {
      verificationStatus: selectedBid.verificationStatus,
      verifiedAt: selectedBid.verifiedAt,
      verifierId: selectedBid.verifierId
    };

    const nextStatus = action === 'APPROVE' ? 'APPROVED' : (action === 'REJECT' ? 'REJECTED' : 'HELD');
    const afterState = {
      verificationStatus: nextStatus,
      verifiedAt: new Date().toISOString(),
      verifierId: adminUser?.username || 'admin'
    };

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': adminUser?.csrfToken || ''
        },
        body: JSON.stringify({
          bidKey: selectedBid.bidKey,
          action: action,
          reason: reasonInput,
          beforeState: beforeState,
          afterState: afterState
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setNotification({ type: 'success', message: data.message });
        // 로컬 상태 업데이트
        setBids(prev => prev.map(b => b.bidKey === selectedBid.bidKey ? { ...b, verificationStatus: nextStatus } : b));
        setSelectedBid(prev => prev ? { ...prev, verificationStatus: nextStatus } : null);
        setReasonInput('');
        loadAuditLogs();
      } else {
        setNotification({ type: 'error', message: data.message || '검수 처리 실패' });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || '요청 실패' });
    } finally {
      setActionLoading(false);
    }
  };

  // 로그인 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 mb-4 border border-indigo-500/30 text-2xl font-bold">
              🔒
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">관리자 검수 스튜디오</h1>
            <p className="text-sm text-slate-400">조달청 나라장터 공식 원문 1:1 대조 및 불변 감사로그</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">아이디</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="••••••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition duration-200 mt-2"
            >
              안전 세션 로그인 (HttpOnly Cookie)
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 transition">
              ← SignBid 메인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 관리자 검수 대시보드
  const pendingCount = bids.filter(b => b.verificationStatus === 'PENDING_MANUAL_CHECK').length;
  const approvedCount = bids.filter(b => b.verificationStatus === 'APPROVED').length;
  const rejectedCount = bids.filter(b => b.verificationStatus === 'REJECTED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 상단 네비게이션 헤더 */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold tracking-wider">
            PRIVATE ADMIN
          </div>
          <span className="font-bold text-lg text-white">나라장터 공식 원문 1:1 대조 검수 스튜디오</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">관리자: <strong className="text-white">{adminUser?.username}</strong> ({adminUser?.role})</span>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 transition"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 상태 알림 바 */}
      {notification && (
        <div className={`p-3 text-sm text-center font-medium ${notification.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800' : 'bg-red-950/80 text-red-300 border-b border-red-800'}`}>
          {notification.message}
        </div>
      )}

      {/* 대시보드 서머리 카드 */}
      <div className="max-w-7xl w-full mx-auto p-6 space-y-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400">발굴된 실공고 총계</p>
              <p className="text-2xl font-bold text-white mt-1">{bids.length}건</p>
            </div>
            <span className="text-2xl">📡</span>
          </div>

          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-amber-400">원문 대조 대기 (PENDING)</p>
              <p className="text-2xl font-bold text-amber-300 mt-1">{pendingCount}건</p>
            </div>
            <span className="text-2xl">⏳</span>
          </div>

          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-emerald-400">수동 대조 승인 (APPROVED)</p>
              <p className="text-2xl font-bold text-emerald-300 mt-1">{approvedCount}건</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">공개 잠금 상태</p>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold">LOCKED</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">10건 대조 전 일괄 공개 비활성화</p>
          </div>
        </div>

        {/* 메인 2열 레이아웃: 좌측 공고 목록 / 우측 1:1 대조 및 검수 패널 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 좌측 공고 목록 */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 max-h-[750px] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <span>📋 발굴 공고 목록</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{bids.length}</span>
              </h2>
              <span className="text-xs text-slate-400">최신순</span>
            </div>

            {bids.map((b) => {
              const isSelected = selectedBid?.bidKey === b.bidKey;
              return (
                <div
                  key={b.bidKey}
                  onClick={() => setSelectedBid(b)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${isSelected ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50' : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-mono text-indigo-400 font-semibold">{b.bidKey}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${b.verificationStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : (b.verificationStatus === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30')}`}>
                      {b.verificationStatus}
                    </span>
                  </div>

                  <h3 className="text-xs font-medium text-white line-clamp-2 leading-relaxed mb-2">{b.normalized.title}</h3>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{b.normalized.client}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${b.normalized.regionStatus === 'RESTRICTED' ? 'bg-purple-950 text-purple-300 border border-purple-800' : (b.normalized.regionStatus === 'UNRESTRICTED' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-slate-800 text-slate-400')}`}>
                      {b.normalized.displayRegion}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 우측 1:1 대조 및 승인/반려 제어 패널 */}
          <div className="lg:col-span-7 space-y-6">
            {selectedBid ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                {/* 상단 공고 헤더 */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-indigo-400">{selectedBid.bidKey}</span>
                      <span className="text-xs text-slate-400">|</span>
                      <span className="text-xs text-slate-300">{selectedBid.normalized.noticeKind}</span>
                    </div>
                    <h2 className="text-base font-bold text-white leading-snug">{selectedBid.normalized.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">발주기관: {selectedBid.normalized.client}</p>
                  </div>

                  <a
                    href={selectedBid.normalized.g2bDetailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-indigo-300 border border-indigo-500/30 shadow transition whitespace-nowrap"
                  >
                    <span>조달청 공식 원문 열기</span>
                    <span>↗</span>
                  </a>
                </div>

                {/* 1:1 대조 필드 테이블 */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">📊 공식 데이터 1:1 대조 검증표</h3>
                  
                  <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3 w-1/4">항목</th>
                          <th className="p-3 w-3/8 text-indigo-300 font-semibold">정규화 값 (SignBid)</th>
                          <th className="p-3 w-3/8 text-slate-400 font-mono">G2B API 원본 필드</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        <tr>
                          <td className="p-3 font-medium text-slate-300">배정예산 (asignBdgtAmt)</td>
                          <td className="p-3 text-white font-semibold">
                            {selectedBid.normalized.allocatedBudget ? `${selectedBid.normalized.allocatedBudget.toLocaleString()}원` : <span className="text-slate-500">null (미기재)</span>}
                          </td>
                          <td className="p-3 font-mono text-slate-400">{selectedBid.raw.mainApi.asignBdgtAmt || selectedBid.raw.mainApi.bdgtAmt || 'null'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-300">추정가격 (presmptPrce)</td>
                          <td className="p-3 text-white font-semibold">
                            {selectedBid.normalized.estimatedPrice ? `${selectedBid.normalized.estimatedPrice.toLocaleString()}원` : <span className="text-slate-500">null (미기재)</span>}
                          </td>
                          <td className="p-3 font-mono text-slate-400">{selectedBid.raw.mainApi.presmptPrce || 'null'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-300">기초금액 (baseAmount)</td>
                          <td className="p-3 text-slate-400">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]">null (별도 발표 시에만 기재)</span>
                          </td>
                          <td className="p-3 font-mono text-slate-500">API 미제공 (배정예산과 혼용 금지)</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-300">참가자격 지역</td>
                          <td className="p-3 text-white font-semibold">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${selectedBid.normalized.regionStatus === 'RESTRICTED' ? 'bg-purple-900/60 text-purple-300 border border-purple-700' : 'bg-blue-900/60 text-blue-300 border border-blue-700'}`}>
                              {selectedBid.normalized.displayRegion}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-400">
                            {selectedBid.raw.regionApi?.length > 0 ? selectedBid.raw.regionApi.map((r: any) => r.regionName).join(', ') : '전체 4,469건 인덱스 내 0건 (전국)'}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-300">입찰 마감일시</td>
                          <td className="p-3 text-white font-mono">{selectedBid.normalized.endDate || 'null'}</td>
                          <td className="p-3 font-mono text-slate-400">{selectedBid.raw.mainApi.bidClseDt || 'null'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-300">계약체결방법</td>
                          <td className="p-3 text-white">{selectedBid.normalized.contractMethod || 'null'}</td>
                          <td className="p-3 font-mono text-slate-400">{selectedBid.raw.mainApi.cntrctCnclsMthdNm || 'null'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI 분석 결과 (완전 분리 영역) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                      <span>🤖 AI 분석 결과</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Model: {selectedBid.ai.modelId}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">공식 공고 필드와 100% 분리됨</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed"><strong className="text-slate-200">요약:</strong> {selectedBid.ai.summary}</p>
                  <p className="text-xs text-slate-300 leading-relaxed"><strong className="text-slate-200">참가 팁:</strong> {selectedBid.ai.tips}</p>
                </div>

                {/* 검수 제어 및 사유 입력 */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <label className="block text-xs font-bold text-slate-300">
                    ✍️ 검수 사유 및 확인 소견 (감사로그 필수 보존 항목)
                  </label>
                  <textarea
                    value={reasonInput}
                    onChange={e => setReasonInput(e.target.value)}
                    placeholder="조달청 공고문 원문 및 과업지시서와 1:1 대조 완료하였으며, 배정예산 및 지역제한 요건이 일치함을 확인함."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                    rows={2}
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleAction('APPROVE')}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                    >
                      {actionLoading ? '기록 중...' : '✅ 공식 원문 1:1 대조 승인 (APPROVE)'}
                    </button>
                    <button
                      onClick={() => handleAction('REJECT')}
                      disabled={actionLoading}
                      className="py-2.5 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold rounded-xl transition disabled:opacity-50"
                    >
                      반려 (REJECT)
                    </button>
                    <button
                      onClick={() => handleAction('HOLD')}
                      disabled={actionLoading}
                      className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition disabled:opacity-50"
                    >
                      보류 (HOLD)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
                좌측에서 검수할 공고를 선택하세요.
              </div>
            )}

            {/* 영구 감사로그(Audit Log) 스트림 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>🔒 Cloudflare D1 영구 불변 감사로그</span>
                  <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono">HMAC-SHA256</span>
                </h3>
                <span className="text-[11px] text-slate-500">Append-Only (수정/삭제 불가)</span>
              </div>

              {auditLogs.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-indigo-400 font-bold">[{log.action}] {log.target_bid_key}</span>
                        <span>{new Date(log.timestamp).toLocaleString('ko-KR')}</span>
                      </div>
                      <p className="text-slate-300 font-sans text-xs">{log.reason}</p>
                      <div className="text-[10px] text-slate-600 truncate">
                        Hash: {log.integrity_hash} | Verifier: {log.admin_user_id}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3 text-center font-sans">
                  아직 기록된 감사로그가 없습니다. 공고를 검수하여 첫 번째 불변 로그를 생성하세요.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
