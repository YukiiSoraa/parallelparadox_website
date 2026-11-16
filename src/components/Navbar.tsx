import React from 'react';
import { LogOut } from 'lucide-react';
import { ClanSiteSettings } from '../data/paradoxData';
import { InlineEditableText } from './InlineEditor';
import { PrxLogoEmblem } from './ParadoxEmblems';

export interface AppUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'member';
  createdAt: string;
}

export interface ActiveSession {
  userId: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
  rememberMe: boolean;
  loggedInAt: string;
}

interface NavbarProps {
  settings: ClanSiteSettings;
  session: ActiveSession | null;
  editEnabled: boolean;
  onUpdateSetting: <K extends keyof ClanSiteSettings>(key: K, value: ClanSiteSettings[K]) => void;
  onSwapLogo: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

function getInitials(name: string): string {
  const clean = name.replace(/PRX[·.\s-]*/i, '').trim() || name.trim();
  const parts = clean.split(/[\s_-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function Navbar({
  settings,
  session,
  editEnabled,
  onUpdateSetting,
  onSwapLogo,
  onOpenAuth,
  onLogout,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#060E24]/85 backdrop-blur-xl border-b border-[#93C5FD]/25">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Upper-left PRX Logo + Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            if (editEnabled) e.preventDefault();
          }}
          className="flex items-center gap-3 whitespace-nowrap shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] rounded-lg"
        >
          <PrxLogoEmblem
            className="w-8 h-8 transition-transform duration-200 group-hover:scale-105"
            src={settings.logoUrl}
            editEnabled={editEnabled}
            onSwapImage={onSwapLogo}
          />
          <InlineEditableText
            value={settings.clanName}
            onSave={(next) => onUpdateSetting('clanName', next)}
            editEnabled={editEnabled}
            as="span"
            className="font-display text-base md:text-lg font-extrabold tracking-tight text-y3k-ice"
          />
        </a>

        {/* Right Zone: LOGIN / SIGN UP (identical to hero CTA) OR Authenticated State */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!session ? (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 font-mono text-xs font-semibold tracking-[0.14em] text-[#F8FAFC] bg-[#0F214D]/80 hover:bg-[#172F6B] border border-[#93C5FD]/35 hover:border-[#93C5FD] rounded-xl backdrop-blur-md transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD]"
            >
              <span>LOGIN / SIGN UP</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end">
              {/* Username / Gamertag Badge */}
              <div className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 bg-[#0F214D]/85 border border-[#93C5FD]/35 rounded-xl backdrop-blur-md">
                <span className="w-6 h-6 rounded-lg bg-[#1E3A8A] border border-[#93C5FD]/40 text-[#E0F2FE] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                  {getInitials(session.username)}
                </span>
                <span className="font-mono text-xs font-semibold text-[#F8FAFC] max-w-[110px] sm:max-w-[160px] truncate">
                  {session.username}
                </span>
              </div>

              {/* Admin Sky-Blue / Chrome Override Badge */}
              {session.role === 'admin' && (
                <span className="inline-flex items-center px-2.5 py-1.5 rounded-xl font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.08em] text-[#060E24] y3k-aero-btn border border-[#E0F2FE]/80 whitespace-nowrap shrink-0">
                  [ADMIN // OVERRIDE]
                </span>
              )}

              {/* LOG OUT Button */}
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 font-mono text-xs font-semibold tracking-[0.1em] text-[#F8FAFC] bg-[#0F214D]/80 hover:bg-[#172F6B] border border-[#93C5FD]/35 hover:border-[#93C5FD] rounded-xl backdrop-blur-md transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD]"
              >
                <LogOut className="w-3.5 h-3.5 text-[#93C5FD]" />
                <span>LOG OUT</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
