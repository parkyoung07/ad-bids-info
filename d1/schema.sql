-- ====================================================================
-- SignBid AI - Cloudflare D1 영구 데이터베이스 스키마 (Phase 1)
-- ====================================================================

-- 1. 관리자 계정 테이블 (비밀번호 PBKDF2-SHA512 해시 저장)
CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,                       -- UUID v4
    username TEXT UNIQUE NOT NULL,             -- 관리자 아이디 (예: admin)
    email TEXT UNIQUE NOT NULL,                -- 관리자 이메일
    password_hash TEXT NOT NULL,               -- PBKDF2-SHA512 해시 (100,000회)
    salt TEXT NOT NULL,                        -- 계정별 128비트 Cryptographic Salt
    role TEXT NOT NULL DEFAULT 'VERIFIER',     -- SUPER_ADMIN | VERIFIER
    failed_login_count INTEGER DEFAULT 0,      -- 연속 실패 횟수 (5회 시 잠금)
    locked_until TEXT,                         -- 계정 잠금 해제 시각 (ISO-8601)
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. 관리자 세션 테이블 (Session Fixation 방어 및 만료 관리)
CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,                       -- 세션 ID (암호학적 난수)
    user_id TEXT NOT NULL,                     -- admin_users.id 외래키
    session_token TEXT UNIQUE NOT NULL,        -- HttpOnly 세션 쿠키 토큰
    csrf_token TEXT NOT NULL,                  -- X-CSRF-Token 헤더 대조용 토큰
    role TEXT NOT NULL,                        -- 세션 유효 당시 권한
    expires_at TEXT NOT NULL,                  -- 만료 일시 (2시간 TTL)
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON admin_sessions(expires_at);

-- 3. 영구 불변 감사로그 테이블 (Append-Only, 수정/삭제 불가)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,                       -- UUID v4 (고유 로그 ID)
    admin_user_id TEXT NOT NULL,               -- 관리자 식별자 (이메일/ID)
    admin_role TEXT NOT NULL,                  -- 관리자 권한
    timestamp TEXT NOT NULL,                   -- ISO-8601 UTC 시각
    target_bid_key TEXT NOT NULL,              -- 대상 공고 (예: R26BK01706792-000)
    action TEXT NOT NULL,                      -- APPROVE | REJECT | HOLD | FLAG
    before_state TEXT NOT NULL,                -- 변경 전 데이터 (JSON String)
    after_state TEXT NOT NULL,                 -- 변경 후 데이터 (JSON String)
    reason TEXT NOT NULL,                      -- 사유 (필수 기재)
    request_id TEXT NOT NULL,                  -- Cloudflare Ray ID / Request UUID
    client_ip TEXT NOT NULL,                   -- IP 주소 (마스킹)
    integrity_hash TEXT NOT NULL               -- HMAC-SHA256 위변조 검증 서명
);

CREATE INDEX IF NOT EXISTS idx_audit_bid ON audit_logs(target_bid_key);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(timestamp);

-- 4. 검증 공고 영구 저장 테이블 (3계층 데이터 보존)
CREATE TABLE IF NOT EXISTS verified_bids (
    bid_key TEXT PRIMARY KEY,                  -- bidNtceNo-bidNtceOrd (예: R26BK01706792-000)
    bid_no TEXT NOT NULL,
    bid_ord TEXT NOT NULL,
    title TEXT NOT NULL,
    client_name TEXT NOT NULL,
    allocated_budget INTEGER,                  -- 배정예산 (asignBdgtAmt)
    estimated_price INTEGER,                   -- 추정가격 (presmptPrce)
    base_amount INTEGER,                       -- 기초금액 (공식 확인 시만 기재, 없으면 NULL)
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    contract_method TEXT,
    region_status TEXT NOT NULL,               -- RESTRICTED | UNRESTRICTED | UNKNOWN
    restricted_regions TEXT,                   -- JSON Array (예: ["부산광역시"])
    notice_kind TEXT NOT NULL,                 -- 등록공고 | 정정공고 | 취소공고 등
    verification_status TEXT NOT NULL,         -- PENDING_MANUAL_CHECK | APPROVED | REJECTED | REVIEW_REQUIRED
    verification_tier INTEGER NOT NULL,        -- 다중 필드 검증 통과 차수
    is_public_locked INTEGER NOT NULL DEFAULT 1, -- 1: 비공개 잠금(LOCKED), 0: 공개
    raw_data TEXT NOT NULL,                    -- pure G2B API 원문 (JSON)
    normalized_data TEXT NOT NULL,             -- 정규화 데이터 (null 결측치 준수 JSON)
    ai_data TEXT NOT NULL,                     -- AI 분석 결과 (완전 분리 JSON)
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verified_status ON verified_bids(verification_status);
CREATE INDEX IF NOT EXISTS idx_verified_locked ON verified_bids(is_public_locked);
