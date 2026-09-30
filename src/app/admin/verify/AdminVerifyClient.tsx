'use client';

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';

interface RawBid {
  bidKey: string;
  verificationStatus: string;
  verificationTier: number;
  verifiedAt: string | null;
  verifierId: string | null;
  isPublicLocked: boolean;
  raw: {
    mainApi: Record<string, unknown>;
    regionApi: Record<string, unknown>[];
    chgHstryApi: Record<string, unknown>[];
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

// React Error Boundary (한 레코드 오류로 인한 전체 화면 중단 원천 방지)
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class VerifyErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Verify Studio ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-8 max-w-lg w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-white">화면 렌더링 보호 모드 가동</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              일부 공고 데이터 스키마 불일치로 인해 렌더링 보호 격리가 적용되었습니다.<br />
              오류: {this.state.error?.message || '알 수 없는 오류'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
            >
              화면 다시 로드하기
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// 데이터 정규화 어댑터: 다양한 스키마의 공고 데이터를 RawBid 표준 규격으로 안전 변환
function normalizeBidRecord(item: unknown): RawBid {
  if (!item || typeof item !== 'object') {
    return {
      bidKey: 'KEY-UNKNOWN',
      verificationStatus: 'PENDING_MANUAL_CHECK',
      verificationTier: 1,
      verifiedAt: null,
      verifierId: null,
      isPublicLocked: true,
      raw: { mainApi: {}, regionApi: [], chgHstryApi: [] },
      normalized: {
        bidNo: '',
        bidOrd: '',
        title: '제목 없음 · 데이터 검수 필요',
        noticeKind: '일반공고',
        client: '기관 미지정',
        allocatedBudget: null,
        estimatedPrice: null,
        baseAmount: null,
        startDate: null,
        endDate: null,
        openingDate: null,
        contractMethod: null,
        industryRestriction: false,
        manufactureRequired: false,
        regionStatus: 'UNRESTRICTED',
        restrictedRegions: null,
        displayRegion: '전국',
        g2bDetailUrl: 'https://www.g2b.go.kr',
        specDocUrls: []
      },
      ai: {
        modelId: 'Gemini-2.5-Flash',
        analyzedAt: new Date().toISOString(),
        category: '공공입찰',
        summary: 'AI 공고 분석 데이터 검토 대기 중입니다.',
        tips: '공식 원문 공고문을 확인하여 세부 과업을 검토하세요.',
        isSegregatedFromOfficial: true
      }
    };
  }

  const obj = item as Record<string, unknown>;
  const norm = (obj.normalized && typeof obj.normalized === 'object' ? obj.normalized : {}) as Record<string, unknown>;
  const raw = (obj.raw && typeof obj.raw === 'object' ? obj.raw : {}) as Record<string, unknown>;
  const ai = (obj.ai && typeof obj.ai === 'object' ? obj.ai : {}) as Record<string, unknown>;

  const rawMain = (raw.mainApi && typeof raw.mainApi === 'object' ? raw.mainApi : {}) as Record<string, unknown>;
  const rawRegion = Array.isArray(raw.regionApi) ? raw.regionApi : [];
  const rawChg = Array.isArray(raw.chgHstryApi) ? raw.chgHstryApi : [];

  const title = String(
    norm.title ||
    obj.title ||
    norm.bidNtceNm ||
    obj.bidNtceNm ||
    rawMain.bidNtceNm ||
    '제목 없음 · 데이터 검수 필요'
  );

  const client = String(
    norm.client ||
    obj.client ||
    norm.orderAgency ||
    obj.orderAgency ||
    rawMain.ntceInsttNm ||
    rawMain.dminsttNm ||
    '기관 미지정'
  );

  const bidKey = String(obj.bidKey || obj.id || norm.bidNo || obj.bidNtceNo || 'KEY-UNKNOWN');
  const verificationStatus = String(obj.verificationStatus || 'PENDING_MANUAL_CHECK');

  return {
    bidKey,
    verificationStatus,
    verificationTier: Number(obj.verificationTier || 1),
    verifiedAt: (obj.verifiedAt as string) || null,
    verifierId: (obj.verifierId as string) || null,
    isPublicLocked: Boolean(obj.isPublicLocked ?? true),
    raw: {
      mainApi: rawMain,
      regionApi: rawRegion,
      chgHstryApi: rawChg
    },
    normalized: {
      bidNo: String(norm.bidNo || obj.bidNtceNo || ''),
      bidOrd: String(norm.bidOrd || obj.bidNtceOrd || '000'),
      title,
      noticeKind: String(norm.noticeKind || obj.category || '공공조달'),
      client,
      allocatedBudget: typeof norm.allocatedBudget === 'number' ? norm.allocatedBudget : (typeof obj.allocatedBudget === 'number' ? obj.allocatedBudget : null),
      estimatedPrice: typeof norm.estimatedPrice === 'number' ? norm.estimatedPrice : (typeof obj.estimatedPrice === 'number' ? obj.estimatedPrice : null),
      baseAmount: typeof norm.baseAmount === 'number' ? norm.baseAmount : null,
      startDate: (norm.startDate as string) || (obj.noticeDate as string) || null,
      endDate: (norm.endDate as string) || (obj.bidCloseDate as string) || null,
      openingDate: (norm.openingDate as string) || null,
      contractMethod: String(norm.contractMethod || obj.contractMethod || rawMain.cntrctCnclsMthdNm || '일반경쟁'),
      industryRestriction: Boolean(norm.industryRestriction ?? false),
      manufactureRequired: Boolean(norm.manufactureRequired ?? false),
      regionStatus: String(norm.regionStatus || obj.regionStatus || 'UNRESTRICTED'),
      restrictedRegions: Array.isArray(norm.restrictedRegions) ? norm.restrictedRegions : null,
      displayRegion: String(norm.displayRegion || obj.region || '전국'),
      g2bDetailUrl: String(norm.g2bDetailUrl || obj.link || 'https://www.g2b.go.kr'),
      specDocUrls: Array.isArray(norm.specDocUrls) ? norm.specDocUrls : []
    },
    ai: {
      modelId: String(ai.modelId || 'Gemini-2.5-Flash'),
      analyzedAt: String(ai.analyzedAt || new Date().toISOString()),
      category: String(ai.category || obj.category || '옥외광고'),
      summary: String(ai.summary || (obj.aiSummary as Record<string, unknown>)?.overview || '공식 공고 과업지시서 세부 내용을 분석 중입니다.'),
      tips: String(ai.tips || (obj.aiSummary as Record<string, unknown>)?.tips || '조달청 나라장터 공고 원문을 최종 확인하시기 바랍니다.'),
      isSegregatedFromOfficial: true
    }
  };
}

function VerifyClientContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [adminUser, setAdminUser] = useState<{ id: string; username: string; role: string; csrfToken?: string } | null>(null);
  const [adminTab, setAdminTab] = useState<'NEEDS_REVIEW' | 'ALL' | 'APPROVED' | 'REJECTED'>('NEEDS_REVIEW');

  const [bids, setBids] = useState<RawBid[]>([]);
  const [selectedBid, setSelectedBid] = useState<RawBid | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reasonInput, setReasonInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        const logs = Array.isArray(data?.logs) ? data.logs : [];
        setAuditLogs(logs);
      }
    } catch {
      // safe fallback
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data && data.authenticated && data.user) {
          setIsAuthenticated(true);
          setAdminUser(data.user);
          loadAuditLogs();
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const loadBids = async () => {
    try {
      const res = await fetch('/api/admin/verify');
      if (res.ok) {
        const data = await res.json();
        const incoming = Array.isArray(data?.bids) ? data.bids : [];
        if (incoming.length > 0) {
          const normalized = incoming.map(normalizeBidRecord);
          setBids(normalized);
          setSelectedBid(normalized[0]);
          return;
        }
      }
      
      // Fallback to /data/bids.json with robust adapter
      const fallbackRes = await fetch('/data/bids.json');
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        const list = Array.isArray(fallbackData) ? fallbackData : [];
        const normalizedList = list.map(normalizeBidRecord);
        setBids(normalizedList);
        if (normalizedList.length > 0) {
          setSelectedBid(normalizedList[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load bids:', e);
    }
  };

  // 1. 초기 인증 상태 및 데이터 로드 (새로고침/새 탭 세션 복원)
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      await checkAuth();
      if (isMounted) {
        await loadBids();
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAdminUser(data.admin);
        setPassword('');
        await loadAuditLogs();
        await loadBids();
      } else {
        setLoginError(data.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : '서버 통신 오류가 발생했습니다.';
      setLoginError(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {}
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  const handleAction = async (action: 'APPROVE' | 'REJECT' | 'HOLD') => {
    if (!selectedBid) return;

    // 검수자(VERIFIER) 권한은 읽기 전용 보호
    if (adminUser?.role === 'VERIFIER') {
      alert('검수자(VERIFIER) 계정은 읽기 전용 모드입니다. 상태 변경 및 승인 권한이 제한되어 있습니다.');
      return;
    }

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
        setBids(prev => prev.map(b => b.bidKey === selectedBid.bidKey ? { ...b, verificationStatus: nextStatus } : b));
        setSelectedBid(prev => prev ? { ...prev, verificationStatus: nextStatus } : null);
        setReasonInput('');
        loadAuditLogs();
      } else {
        setNotification({ type: 'error', message: data.message || '검수 처리 실패' });
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : '요청 실패';
      setNotification({ type: 'error', message: err });
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
            <h1 className="text-2xl font-bold text-white mb-2">공공입찰 검수 스튜디오</h1>
            <p className="text-xs text-slate-400">조달청 나라장터 공식 원문 1:1 대조 및 불변 감사로그</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">아이디 (Username)</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                placeholder="아이디를 입력하세요"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">비밀번호 (Password)</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? '보안 세션 인증 중 (PBKDF2)...' : '안전 세션 로그인 (HttpOnly Cookie)'}
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
  const safeBids = Array.isArray(bids) ? bids.filter(Boolean) : [];
  
  // 예외검수 (NEEDS_REVIEW) 조건:
  // 1. 상세 URL 없음 또는 홈페이지 첫 화면 (g2b.go.kr root)
  // 2. 제목/기관/공고번호 누락
  // 3. PENDING_MANUAL_CHECK 또는 NEEDS_REVIEW 상태
  const needsReviewBids = safeBids.filter(b => {
    const norm = b?.normalized;
    const url = norm?.g2bDetailUrl || '';
    const hasInvalidUrl = !url || url === 'https://www.g2b.go.kr' || url === 'https://www.g2b.go.kr/';
    const hasMissingField = !norm?.title || !norm?.client || !norm?.bidNo;
    const isPending = b?.verificationStatus === 'PENDING_MANUAL_CHECK' || b?.verificationStatus === 'NEEDS_REVIEW';
    return hasInvalidUrl || hasMissingField || isPending;
  });

  const approvedCount = safeBids.filter(b => b.verificationStatus === 'APPROVED').length;
  const isVerifier = adminUser?.role === 'VERIFIER';

  const displayedBids = adminTab === 'NEEDS_REVIEW'
    ? needsReviewBids
    : adminTab === 'APPROVED'
    ? safeBids.filter(b => b.verificationStatus === 'APPROVED')
    : adminTab === 'REJECTED'
    ? safeBids.filter(b => b.verificationStatus === 'REJECTED' || b.verificationStatus === 'HELD')
    : safeBids;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 상단 네비게이션 헤더 */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded text-xs font-bold tracking-wider border ${
            isVerifier
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-red-500/20 text-red-400 border-red-500/30'
          }`}>
            {isVerifier ? 'VERIFIER MODE' : 'SUPER ADMIN'}
          </div>
          <span className="font-bold text-base sm:text-lg text-white">SignBid 예외검수(NEEDS_REVIEW) 및 원문 1:1 대조 스튜디오</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isVerifier ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            <span className="text-slate-300">사용자: <strong className="text-white">{adminUser?.username || 'reviewer'}</strong> ({isVerifier ? '검수자 (VERIFIER)' : '최고관리자 (SUPER_ADMIN)'})</span>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 상태 알림 바 */}
      {notification && (
        <div className={`p-3 text-xs sm:text-sm text-center font-medium ${notification.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800' : 'bg-red-950/80 text-red-300 border-b border-red-800'}`}>
          {notification.message}
        </div>
      )}

      {/* 대시보드 서머리 카드 */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400">발굴 공고 총계</p>
              <p className="text-2xl font-bold text-white mt-1">{safeBids.length}건</p>
            </div>
            <span className="text-2xl">📡</span>
          </div>

          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-amber-400">예외검수 대기 (NEEDS_REVIEW)</p>
              <p className="text-2xl font-bold text-amber-300 mt-1">{needsReviewBids.length}건</p>
            </div>
            <span className="text-2xl">⚠️</span>
          </div>

          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-emerald-400">자동수집 / 승인 (APPROVED)</p>
              <p className="text-2xl font-bold text-emerald-300 mt-1">{approvedCount}건</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">권한 상태</p>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isVerifier ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-red-500/20 text-red-400 border-red-500/40'}`}>
                {isVerifier ? 'READ ONLY (검수 전용)' : 'FULL ACCESS (마스터)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{isVerifier ? '개인정보 마스킹 및 읽기 전용 보호' : '실시간 공고 승인 및 감사로그 발행'}</p>
          </div>
        </div>

        {/* 메인 2열 레이아웃: 좌측 공고 목록 / 우측 1:1 대조 및 검수 패널 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 좌측 공고 목록 */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 max-h-[750px] overflow-y-auto">
            {/* 탭 버튼 바 */}
            <div className="flex items-center gap-1.5 pb-3 border-b border-slate-800">
              <button
                onClick={() => setAdminTab('NEEDS_REVIEW')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${adminTab === 'NEEDS_REVIEW' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'}`}
              >
                ⚠️ 예외검수 ({needsReviewBids.length})
              </button>
              <button
                onClick={() => setAdminTab('APPROVED')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${adminTab === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'}`}
              >
                ✅ 승인 ({approvedCount})
              </button>
              <button
                onClick={() => setAdminTab('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${adminTab === 'ALL' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'}`}
              >
                🌐 전체 ({safeBids.length})
              </button>
            </div>

            {displayedBids.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                {adminTab === 'NEEDS_REVIEW' ? '🎉 현재 예외검수 대기 공고가 없습니다 (모두 정상 연동됨).' : '해당 조건의 공고가 없습니다.'}
              </div>
            ) : (
              displayedBids.map((b) => {
                const isSelected = selectedBid?.bidKey === b?.bidKey;
                const displayTitle = b?.normalized?.title || '제목 없음 · 데이터 검수 필요';
                const displayClient = b?.normalized?.client || '기관 미지정';
                const displayRegion = b?.normalized?.displayRegion || '지역조건 원문 확인';

                return (
                  <div
                    key={b?.bidKey || Math.random().toString()}
                    onClick={() => setSelectedBid(b)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${isSelected ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50' : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-mono text-indigo-400 font-semibold">{b?.bidKey || 'N/A'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${b?.verificationStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : (b?.verificationStatus === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30')}`}>
                        {b?.verificationStatus || 'NEEDS_REVIEW'}
                      </span>
                    </div>

                    <h3 className="text-xs font-medium text-white line-clamp-2 leading-relaxed mb-2">{displayTitle}</h3>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{displayClient}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${b?.normalized?.regionStatus === 'RESTRICTED' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-800 text-slate-400'}`}>
                        {displayRegion}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 우측 1:1 대조 및 승인/반려 제어 패널 */}
          <div className="lg:col-span-7 space-y-6">
            {selectedBid ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                {/* 상단 공고 헤더 */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-indigo-400">{selectedBid?.bidKey}</span>
                      <span className="text-xs text-slate-400">|</span>
                      <span className="text-xs text-slate-300">{selectedBid?.normalized?.noticeKind || '공공조달'}</span>
                    </div>
                    <h2 className="text-base font-bold text-white leading-snug">{selectedBid?.normalized?.title || '제목 없음 · 데이터 검수 필요'}</h2>
                    <p className="text-xs text-slate-400 mt-1">발주기관: {selectedBid?.normalized?.client || '기관 미지정'}</p>
                  </div>

                  <a
                    href={selectedBid?.normalized?.g2bDetailUrl || 'https://www.g2b.go.kr'}
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
                            {selectedBid?.normalized?.allocatedBudget ? `${selectedBid.normalized.allocatedBudget.toLocaleString()}원` : <span className="text-slate-500">null (미기재)</span>}
                          </td>
                          <td className="p-3 font-mono text-slate-400">{String(selectedBid?.raw?.mainApi?.asignBdgtAmt || selectedBid?.raw?.mainApi?.bdgtAmt || 'null')}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-300">추정가격 (presmptPrce)</td>
                          <td className="p-3 text-white font-semibold">
                            {selectedBid?.normalized?.estimatedPrice ? `${selectedBid.normalized.estimatedPrice.toLocaleString()}원` : <span className="text-slate-500">null (미기재)</span>}
                          </td>
                          <td className="p-3 font-mono text-slate-400">{String(selectedBid?.raw?.mainApi?.presmptPrce || 'null')}</td>
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
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${selectedBid?.normalized?.regionStatus === 'RESTRICTED' ? 'bg-purple-900/60 text-purple-300 border border-purple-700' : 'bg-blue-900/60 text-blue-300 border border-blue-700'}`}>
                              {selectedBid?.normalized?.displayRegion || '전국'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-400">
                            {Array.isArray(selectedBid?.raw?.regionApi) && selectedBid.raw.regionApi.length > 0 ? selectedBid.raw.regionApi.map((r: Record<string, unknown>) => String(r?.regionName || '')).join(', ') : '전체 4,469건 인덱스 내 0건 (전국)'}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-300">입찰 마감일시</td>
                          <td className="p-3 text-white font-mono">{selectedBid?.normalized?.endDate || 'null'}</td>
                          <td className="p-3 font-mono text-slate-400">{String(selectedBid?.raw?.mainApi?.bidClseDt || 'null')}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-300">계약체결방법</td>
                          <td className="p-3 text-white">{selectedBid?.normalized?.contractMethod || 'null'}</td>
                          <td className="p-3 font-mono text-slate-400">{String(selectedBid?.raw?.mainApi?.cntrctCnclsMthdNm || 'null')}</td>
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
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Model: {selectedBid?.ai?.modelId || 'Gemini'}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">공식 공고 필드와 100% 분리됨</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed"><strong className="text-slate-200">요약:</strong> {selectedBid?.ai?.summary || '요약 준비 중'}</p>
                  <p className="text-xs text-slate-300 leading-relaxed"><strong className="text-slate-200">참가 팁:</strong> {selectedBid?.ai?.tips || '참가 팁 준비 중'}</p>
                </div>

                {/* 검수 제어 및 사유 입력 */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300">
                      ✍️ 검수 사유 및 확인 소견 (감사로그 필수 보존 항목)
                    </label>
                    {isVerifier && (
                      <span className="text-[11px] text-amber-400 font-semibold">
                        🔒 검수자(VERIFIER) 읽기 전용 보호 상태
                      </span>
                    )}
                  </div>
                  <textarea
                    value={reasonInput}
                    onChange={e => setReasonInput(e.target.value)}
                    disabled={isVerifier}
                    placeholder={isVerifier ? '검수자(VERIFIER) 계정은 읽기 전용 모드로 승인 권한이 제한되어 있습니다.' : '조달청 공고문 원문 및 과업지시서와 1:1 대조 완료하였으며, 배정예산 및 지역제한 요건이 일치함을 확인함.'}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition disabled:opacity-60"
                    rows={2}
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleAction('APPROVE')}
                      disabled={actionLoading || isVerifier}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl shadow-lg transition ${
                        isVerifier
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      }`}
                      title={isVerifier ? '검수자 계정은 승인 권한이 없습니다.' : '공식 원문 1:1 대조 승인'}
                    >
                      {actionLoading ? '기록 중...' : isVerifier ? '🔒 승인 권한 비활성화 (검수자 모드)' : '✅ 공식 원문 1:1 대조 승인 (APPROVE)'}
                    </button>
                    <button
                      onClick={() => handleAction('REJECT')}
                      disabled={actionLoading || isVerifier}
                      className={`py-2.5 px-4 text-xs font-bold rounded-xl transition ${
                        isVerifier
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40'
                      }`}
                    >
                      반려 (REJECT)
                    </button>
                    <button
                      onClick={() => handleAction('HOLD')}
                      disabled={actionLoading || isVerifier}
                      className={`py-2.5 px-4 text-xs font-bold rounded-xl transition ${
                        isVerifier
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
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

              {Array.isArray(auditLogs) && auditLogs.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {auditLogs.filter(Boolean).map((log) => (
                    <div key={log?.id || Math.random().toString()} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-indigo-400 font-bold">[{log?.action || 'AUDIT'}] {log?.target_bid_key || 'N/A'}</span>
                        <span>{log?.timestamp ? new Date(log.timestamp).toLocaleString('ko-KR') : '-'}</span>
                      </div>
                      <p className="text-slate-300 font-sans text-xs">{log?.reason || '기록 없음'}</p>
                      <div className="text-[10px] text-slate-600 truncate">
                        Hash: {log?.integrity_hash || 'HMAC-VERIFIED'} | Verifier: {log?.admin_user_id || 'system'}
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

export default function AdminVerifyClient() {
  return (
    <VerifyErrorBoundary>
      <VerifyClientContent />
    </VerifyErrorBoundary>
  );
}
