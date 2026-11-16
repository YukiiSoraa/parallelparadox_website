import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { ClanMember, ClanSiteSettings, PRESET_PORTRAITS } from '../data/paradoxData';
import { InlineEditableText } from './InlineEditor';
import { ActiveSession, AppUser } from './Navbar';

export const USERS_DB_KEY = 'paradox_users_db';
export const ACTIVE_SESSION_KEY = 'paradox_active_session';

export const DEFAULT_ADMIN_ACCOUNT: AppUser = {
  id: 'usr_admin_prx',
  username: 'admin',
  email: 'admin@parallelparadox.gg',
  password: 'paradox2026',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export function ensureSeededUsersDb(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      const seeded = [DEFAULT_ADMIN_ACCOUNT];
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = [DEFAULT_ADMIN_ACCOUNT];
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return parsed as AppUser[];
  } catch {
    const seeded = [DEFAULT_ADMIN_ACCOUNT];
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(seeded));
    } catch {
      // Ignore storage error
    }
    return seeded;
  }
}

function writeUsersDb(users: AppUser[]) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

function formatSocialHref(handleOrUrl: string): string {
  const trimmed = handleOrUrl.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const clean = trimmed.replace(/^@/, '');
  return `https://www.tiktok.com/@${clean}`;
}

function Y3KModalFrame({
  onClose,
  kicker,
  title,
  children,
}: {
  onClose: () => void;
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040917]/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto y2k-navy-card border border-[#93C5FD]/40 rounded-2xl p-6 md:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#93C5FD]/20">
          <div>
            <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#93C5FD]">
              {kicker}
            </div>
            <h3 className="font-display text-xl md:text-2xl font-extrabold text-white mt-1">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-10 h-10 inline-flex items-center justify-center border border-[#93C5FD]/30 bg-[#060E24] hover:bg-[#172F6B] text-[#CBD5E1] hover:text-white rounded-xl cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function AuthModal({
  onAuthSuccess,
  onClose,
}: {
  onAuthSuccess: (session: ActiveSession) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Sign-Up form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    ensureSeededUsersDb();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('');

    const idInput = loginIdentifier.trim().toLowerCase();
    if (!idInput || !loginPassword) {
      setStatus('error');
      setFeedback('Enter your email (or username) and password.');
      return;
    }

    setStatus('loading');
    const currentDb = ensureSeededUsersDb();
    const matched = currentDb.find(
      (u) => u.email.toLowerCase() === idInput || u.username.toLowerCase() === idInput
    );

    if (!matched) {
      setStatus('error');
      setFeedback('No account found with that email or username.');
      return;
    }

    if (matched.password !== loginPassword) {
      setStatus('error');
      setFeedback('Incorrect password. Please try again.');
      return;
    }

    const session: ActiveSession = {
      userId: matched.id,
      username: matched.username,
      email: matched.email,
      role: matched.role,
      rememberMe,
      loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    setStatus('success');
    setFeedback(`Welcome back, ${matched.username}!`);

    setTimeout(() => {
      onAuthSuccess(session);
      onClose();
    }, 350);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('');

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 2) {
      setStatus('error');
      setFeedback('Please enter a Username (at least 2 characters).');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setStatus('error');
      setFeedback('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setFeedback('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setStatus('error');
      setFeedback('Passwords do not match.');
      return;
    }

    setStatus('loading');
    const currentDb = ensureSeededUsersDb();

    if (currentDb.some((u) => u.email.toLowerCase() === cleanEmail)) {
      setStatus('error');
      setFeedback('An account with this email already exists. Please log in instead.');
      return;
    }
    if (currentDb.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      setStatus('error');
      setFeedback('That Username is already taken.');
      return;
    }

    const newUser: AppUser = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      email: cleanEmail,
      password,
      role: 'member',
      createdAt: new Date().toISOString(),
    };

    const nextDb = [...currentDb, newUser];
    writeUsersDb(nextDb);

    const session: ActiveSession = {
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: 'member',
      rememberMe: true,
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));

    setStatus('success');
    setFeedback(`Account created! Signed in as ${newUser.username}.`);

    setTimeout(() => {
      onAuthSuccess(session);
      onClose();
    }, 400);
  };

  const handleAutoFillAdmin = () => {
    ensureSeededUsersDb();
    setTab('login');
    setLoginIdentifier(DEFAULT_ADMIN_ACCOUNT.email);
    setLoginPassword(DEFAULT_ADMIN_ACCOUNT.password);
    setStatus('idle');
    setFeedback('');
  };

  const handleResetAccounts = () => {
    localStorage.removeItem(USERS_DB_KEY);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    ensureSeededUsersDb();
    setTab('login');
    setLoginIdentifier('');
    setLoginPassword('');
    setStatus('idle');
    setFeedback('Saved accounts reset.');
  };

  const isAiStudioEnv =
    import.meta.env.DEV ||
    (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.run.app')));

  return (
    <Y3KModalFrame
      onClose={onClose}
      kicker="PARALLEL PARADOX · ACCOUNT ACCESS"
      title={tab === 'login' ? 'Log In to Account' : 'Create Member Account'}
    >
      {/* Smooth Tab Switcher */}
      <div className="flex gap-2 p-1 bg-[#060E24] border border-[#93C5FD]/25 rounded-xl mb-5 font-mono text-xs">
        <button
          type="button"
          onClick={() => {
            setTab('login');
            setStatus('idle');
            setFeedback('');
          }}
          className={`flex-1 py-2 rounded-lg font-semibold cursor-pointer transition-all ${
            tab === 'login' ? 'y2k-aero-btn text-[#060E24]' : 'text-[#CBD5E1] hover:text-white'
          }`}
        >
          LOG IN
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('signup');
            setStatus('idle');
            setFeedback('');
          }}
          className={`flex-1 py-2 rounded-lg font-semibold cursor-pointer transition-all ${
            tab === 'signup' ? 'y2k-aero-btn text-[#060E24]' : 'text-[#CBD5E1] hover:text-white'
          }`}
        >
          SIGN UP
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'login' ? (
          <motion.form
            key="login-form"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleLogin}
            className="space-y-4 font-mono text-xs"
            noValidate
          >
            <div>
              <label htmlFor="login-id" className="block text-[11px] text-[#94A3B8] mb-1.5">
                EMAIL OR USERNAME
              </label>
              <input
                id="login-id"
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="name@domain.com or PRX_KAZ"
                className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none px-3.5 py-2.5 text-white rounded-xl"
              />
            </div>

            <div>
              <label htmlFor="login-pw" className="block text-[11px] text-[#94A3B8] mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  id="login-pw"
                  type={showLoginPw ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none pl-3.5 pr-10 py-2.5 text-white rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPw((v) => !v)}
                  aria-label={showLoginPw ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white p-1 cursor-pointer"
                >
                  {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none text-[#CBD5E1]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[#38BDF8] rounded cursor-pointer"
              />
              <span>Keep session logged in across reloads</span>
            </label>

            {feedback && (
              <div
                className={`p-3 border rounded-xl flex items-center gap-2 ${
                  status === 'success'
                    ? 'border-[#60A5FA] bg-[#0F214D] text-[#BAE6FD]'
                    : 'border-amber-400/50 bg-amber-950/40 text-amber-200'
                }`}
              >
                {status === 'success' ? (
                  <Check className="w-4 h-4 text-[#7DD3FC] shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{feedback}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full py-3 y2k-aero-btn text-[#060E24] font-semibold tracking-[0.12em] rounded-xl disabled:opacity-50 cursor-pointer"
            >
              {status === 'loading' ? 'VERIFYING...' : 'LOG IN'}
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="signup-form"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleSignUp}
            className="space-y-4 font-mono text-xs"
            noValidate
          >
            <div>
              <label htmlFor="signup-user" className="block text-[11px] text-[#94A3B8] mb-1.5">
                USERNAME *
              </label>
              <input
                id="signup-user"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. PRX_KAZ"
                className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none px-3.5 py-2.5 text-white rounded-xl"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-[11px] text-[#94A3B8] mb-1.5">
                EMAIL ADDRESS *
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none px-3.5 py-2.5 text-white rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-pw" className="block text-[11px] text-[#94A3B8] mb-1.5">
                  PASSWORD (MIN. 6) *
                </label>
                <div className="relative">
                  <input
                    id="signup-pw"
                    type={showSignupPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none pl-3.5 pr-10 py-2.5 text-white rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPw((v) => !v)}
                    aria-label={showSignupPw ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white p-1 cursor-pointer"
                  >
                    {showSignupPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="signup-confirm" className="block text-[11px] text-[#94A3B8] mb-1.5">
                  CONFIRM PASSWORD *
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm"
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none pl-3.5 pr-10 py-2.5 text-white rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((v) => !v)}
                    aria-label={showConfirmPw ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white p-1 cursor-pointer"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {feedback && (
              <div
                className={`p-3 border rounded-xl flex items-center gap-2 ${
                  status === 'success'
                    ? 'border-[#60A5FA] bg-[#0F214D] text-[#BAE6FD]'
                    : 'border-amber-400/50 bg-amber-950/40 text-amber-200'
                }`}
              >
                {status === 'success' ? (
                  <Check className="w-4 h-4 text-[#7DD3FC] shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{feedback}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full py-3 y2k-aero-btn text-[#060E24] font-semibold tracking-[0.12em] rounded-xl disabled:opacity-50 cursor-pointer"
            >
              {status === 'loading' ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Modal Footer Utility Helpers */}
      <div className="mt-5 pt-4 border-t border-[#93C5FD]/20 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
        {isAiStudioEnv ? (
          <button
            type="button"
            onClick={handleAutoFillAdmin}
            className="inline-flex items-center gap-1.5 text-[#7DD3FC] hover:text-white cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>[AUTO-FILL ADMIN DEMO]</span>
          </button>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={handleResetAccounts}
          className="inline-flex items-center gap-1.5 text-[#94A3B8] hover:text-red-300 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Saved Accounts</span>
        </button>
      </div>
    </Y3KModalFrame>
  );
}

export function MemberProfileModal({
  member,
  editEnabled,
  onUpdateMember,
  onSwapImage,
  onClose,
}: {
  member: ClanMember;
  editEnabled: boolean;
  onUpdateMember: (id: string, patch: Partial<ClanMember>) => void;
  onSwapImage: (member: ClanMember) => void;
  onClose: () => void;
}) {
  const [copiedUid, setCopiedUid] = useState(false);

  const handleCopyUid = async () => {
    try {
      await navigator.clipboard.writeText(member.uid);
    } catch {
      // Clipboard fallback ignored
    }
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 1800);
  };

  return (
    <Y3KModalFrame
      onClose={onClose}
      kicker={`MEMBER NO. ${member.number} · ${member.division || member.region}`}
      title={`${member.ign} (${member.realName})`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
        <div className="sm:col-span-5 space-y-3">
          <div
            onClick={() => {
              if (editEnabled) onSwapImage(member);
            }}
            title={editEnabled ? 'Click photo to swap image' : undefined}
            className={`aspect-[3/4] rounded-xl overflow-hidden border border-[#93C5FD]/30 bg-[#0F214D] ${
              editEnabled
                ? 'outline-1 outline-dashed outline-[#7DD3FC]/70 hover:outline-[#BAE6FD] cursor-pointer'
                : ''
            }`}
          >
            <img
              src={member.portraitUrl}
              alt={member.ign}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {member.uid && (
            <button
              type="button"
              onClick={handleCopyUid}
              className="w-full flex items-center justify-between px-3 py-2 bg-[#060E24] border border-[#93C5FD]/30 hover:border-[#60A5FA] rounded-xl font-mono text-[11px] text-[#E2E8F0] cursor-pointer"
            >
              <span className="truncate">UID: {member.uid}</span>
              {copiedUid ? (
                <Check className="w-3.5 h-3.5 text-[#93C5FD] shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              )}
            </button>
          )}
        </div>

        <div className="sm:col-span-7 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <InlineEditableText
              value={member.bio}
              onSave={(next) => onUpdateMember(member.id, { bio: next })}
              editEnabled={editEnabled}
              as="p"
              multiline
              className="text-sm text-[#CBD5E1] leading-relaxed"
            />

            <div className="bg-[#060E24]/80 border border-[#93C5FD]/25 rounded-xl p-4 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-[#94A3B8]">IGN</span>
                <InlineEditableText
                  value={member.ign}
                  onSave={(next) => onUpdateMember(member.id, { ign: next })}
                  editEnabled={editEnabled}
                  as="span"
                  className="font-semibold text-white text-right"
                />
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#94A3B8]">ROLE</span>
                <InlineEditableText
                  value={member.role}
                  onSave={(next) => onUpdateMember(member.id, { role: next })}
                  editEnabled={editEnabled}
                  as="span"
                  className="font-semibold text-[#93C5FD] text-right"
                />
              </div>
              {(member.division || editEnabled) && (
                <div className="flex justify-between gap-4">
                  <span className="text-[#94A3B8]">DIVISION</span>
                  <InlineEditableText
                    value={member.division || 'CODM Multiplayer'}
                    onSave={(next) => onUpdateMember(member.id, { division: next })}
                    editEnabled={editEnabled}
                    as="span"
                    className="text-white text-right"
                  />
                </div>
              )}
              <div className="flex justify-between gap-4">
                <span className="text-[#94A3B8]">REGION</span>
                <InlineEditableText
                  value={member.region}
                  onSave={(next) => onUpdateMember(member.id, { region: next })}
                  editEnabled={editEnabled}
                  as="span"
                  className="text-white text-right"
                />
              </div>
            </div>

            {member.tiktok && (
              <div className="flex flex-wrap gap-4 font-mono text-xs">
                <a
                  href={formatSocialHref(member.tiktok)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#93C5FD] hover:text-white"
                >
                  <span>SOCIAL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </Y3KModalFrame>
  );
}

function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 640;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function MemberEditorModal({
  initialMember,
  nextNumber,
  onSave,
  onClose,
}: {
  initialMember: ClanMember | null;
  nextNumber: string;
  onSave: (member: ClanMember) => void;
  onClose: () => void;
}) {
  const isNew = !initialMember;
  const [form, setForm] = useState<ClanMember>(
    initialMember || {
      id: `member-${Date.now()}`,
      number: nextNumber,
      ign: '',
      realName: '',
      uid: '',
      role: 'Member',
      division: 'CODM Multiplayer',
      stats: '',
      region: 'GLOBAL',
      portraitUrl: PRESET_PORTRAITS[0].url,
      bio: '',
      tiktok: '',
      youtube: '',
      x: '',
    }
  );
  const [error, setError] = useState('');

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file);
      setForm((prev) => ({ ...prev, portraitUrl: dataUrl }));
    } catch {
      setError('Could not read that image file. Try another JPG or PNG.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ign.trim()) {
      setError('Please enter an IGN.');
      return;
    }
    onSave({
      ...form,
      ign: form.ign.trim(),
      realName: form.realName.trim() || 'Clan Member',
      role: form.role.trim() || 'Member',
      division: form.division?.trim() || '',
      portraitUrl: form.portraitUrl.trim() || PRESET_PORTRAITS[0].url,
    });
  };

  return (
    <Y3KModalFrame
      onClose={onClose}
      kicker="ADMIN ROSTER EDITOR"
      title={isNew ? 'Add New Player' : `Edit ${initialMember.ign}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
        <div className="bg-[#060E24]/70 border border-[#93C5FD]/25 rounded-xl p-4 space-y-3">
          <div className="font-mono text-[11px] font-semibold text-[#93C5FD]">
            AVATAR IMAGE URL OR DEVICE UPLOAD
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={form.portraitUrl || PRESET_PORTRAITS[0].url}
              alt="Preview"
              className="w-20 h-24 object-cover object-top rounded-xl border border-[#93C5FD]/40 shrink-0"
            />
            <div className="flex-1 space-y-2.5 w-full">
              <input
                type="url"
                value={form.portraitUrl}
                onChange={(e) => setForm((p) => ({ ...p, portraitUrl: e.target.value }))}
                placeholder="https://... or upload photo below"
                className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none px-3 py-2 font-mono text-white rounded-xl"
              />

              <label className="inline-flex items-center gap-2 px-3.5 py-2 y2k-aero-btn text-[#060E24] font-mono font-semibold rounded-xl cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>UPLOAD PHOTO</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div>
            <label className="block text-[11px] text-[#94A3B8] mb-1">IGN *</label>
            <input
              type="text"
              value={form.ign}
              onChange={(e) => setForm((p) => ({ ...p, ign: e.target.value }))}
              placeholder="e.g. PRX·NOVA"
              className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none px-3 py-2 text-white rounded-xl"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#94A3B8] mb-1">GAME DIVISION</label>
            <input
              type="text"
              value={form.division || ''}
              onChange={(e) => setForm((p) => ({ ...p, division: e.target.value }))}
              placeholder="e.g. CODM Multiplayer"
              className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none px-3 py-2 text-white rounded-xl"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#94A3B8] mb-1">ROLE</label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              placeholder="e.g. IGL / Entry / Co-Leader"
              className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none px-3 py-2 text-white rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
          <div>
            <label className="block text-[11px] text-[#94A3B8] mb-1">DISPLAY NAME</label>
            <input
              type="text"
              value={form.realName}
              onChange={(e) => setForm((p) => ({ ...p, realName: e.target.value }))}
              placeholder="e.g. Alex Kim"
              className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none px-3 py-2 text-white rounded-xl"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#94A3B8] mb-1">SOCIAL HANDLE / URL</label>
            <input
              type="text"
              value={form.tiktok || ''}
              onChange={(e) => setForm((p) => ({ ...p, tiktok: e.target.value }))}
              placeholder="@handle or https://..."
              className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none px-3 py-2 text-white rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
          <div>
            <label className="block text-[11px] text-[#94A3B8] mb-1">CODM UID</label>
            <input
              type="text"
              value={form.uid}
              onChange={(e) => setForm((p) => ({ ...p, uid: e.target.value }))}
              placeholder="7194820..."
              className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none px-3 py-2 text-white rounded-xl"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#94A3B8] mb-1">REGION</label>
            <input
              type="text"
              value={form.region}
              onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
              placeholder="NA / SEA / EU"
              className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none px-3 py-2 text-white rounded-xl"
            />
          </div>
        </div>

        <div className="font-mono">
          <label className="block text-[11px] text-[#94A3B8] mb-1">SHORT BIO</label>
          <textarea
            rows={2}
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Write a quick note about this clan member..."
            className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none px-3 py-2 text-white rounded-xl"
          />
        </div>

        {error && (
          <div className="p-3 border border-amber-400/50 bg-amber-950/40 text-amber-200 rounded-xl flex items-center gap-2 font-mono">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 font-mono">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-[#93C5FD]/30 text-[#CBD5E1] hover:text-white rounded-xl cursor-pointer"
          >
            CANCEL
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 y2k-aero-btn text-[#060E24] font-semibold rounded-xl cursor-pointer"
          >
            {isNew ? 'ADD PLAYER' : 'SAVE CHANGES'}
          </button>
        </div>
      </form>
    </Y3KModalFrame>
  );
}

export function SiteSettingsEditorModal({
  settings,
  onSave,
  onClose,
}: {
  settings: ClanSiteSettings;
  onSave: (next: ClanSiteSettings) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ClanSiteSettings>(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      clanName: form.clanName.trim() || 'PARALLEL PARADOX',
      rosterHeading: form.rosterHeading.trim() || 'Official Member Roster',
    });
  };

  return (
    <Y3KModalFrame
      onClose={onClose}
      kicker="ADMIN SITE SETTINGS"
      title="Edit Clan Title & Heading"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        <div>
          <label className="block text-[11px] text-[#94A3B8] mb-1.5">CLAN NAME</label>
          <input
            type="text"
            value={form.clanName}
            onChange={(e) => setForm((p) => ({ ...p, clanName: e.target.value }))}
            className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none px-3.5 py-2.5 text-white rounded-xl"
          />
        </div>
        <div>
          <label className="block text-[11px] text-[#94A3B8] mb-1.5">ROSTER SECTION HEADING</label>
          <input
            type="text"
            value={form.rosterHeading}
            onChange={(e) => setForm((p) => ({ ...p, rosterHeading: e.target.value }))}
            className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none px-3.5 py-2.5 text-white rounded-xl"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-[#93C5FD]/30 text-[#CBD5E1] hover:text-white rounded-xl cursor-pointer"
          >
            CANCEL
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 y2k-aero-btn text-[#060E24] font-semibold rounded-xl cursor-pointer"
          >
            SAVE HEADINGS
          </button>
        </div>
      </form>
    </Y3KModalFrame>
  );
}
