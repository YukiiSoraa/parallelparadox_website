/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ClanMember,
  ClanSiteSettings,
  DEFAULT_MEMBERS,
  DEFAULT_SITE_SETTINGS,
  PRX_BACKGROUND_IMAGE,
} from './data/paradoxData';
import { ActiveSession, Navbar } from './components/Navbar';
import { HeroY2KShowcase } from './components/HeroY2KShowcase';
import { RosterSection } from './components/RosterSection';
import { Footer } from './components/Footer';
import { ImageSwapModal, ImageSwapTarget } from './components/InlineEditor';
import {
  ACTIVE_SESSION_KEY,
  AuthModal,
  ensureSeededUsersDb,
  MemberEditorModal,
  MemberProfileModal,
} from './components/Modals';

const ROSTERS_DB_KEY = 'paradox_rosters_db';
const SITE_SETTINGS_DB_KEY = 'paradox_site_settings_db';

function loadInitialRoster(): ClanMember[] {
  try {
    const saved = localStorage.getItem(ROSTERS_DB_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as ClanMember[];
      }
      if (parsed && Array.isArray(parsed.members) && parsed.members.length > 0) {
        return parsed.members as ClanMember[];
      }
    }
    localStorage.setItem(ROSTERS_DB_KEY, JSON.stringify(DEFAULT_MEMBERS));
  } catch {
    // Ignore storage error
  }
  return DEFAULT_MEMBERS;
}

function loadInitialSettings(): ClanSiteSettings {
  try {
    const saved = localStorage.getItem(SITE_SETTINGS_DB_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<ClanSiteSettings>;
      if (parsed?.clanName) {
        return { ...DEFAULT_SITE_SETTINGS, ...parsed };
      }
    }
  } catch {
    // Ignore storage error
  }
  return DEFAULT_SITE_SETTINGS;
}

export default function App() {
  const [members, setMembers] = useState<ClanMember[]>(loadInitialRoster);
  const [siteSettings, setSiteSettings] = useState<ClanSiteSettings>(loadInitialSettings);

  // Restore active session from localStorage on initial load
  const [session, setSession] = useState<ActiveSession | null>(() => {
    try {
      const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as ActiveSession;
    } catch {
      return null;
    }
  });

  const [authOpen, setAuthOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<ClanMember | null | undefined>(undefined);
  const [imageSwapTarget, setImageSwapTarget] = useState<ImageSwapTarget | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string>('');

  // Automatically seed default Admin account in paradox_users_db and normalize path to /roster
  useEffect(() => {
    ensureSeededUsersDb();
    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.history.replaceState(
        null,
        '',
        `/roster${window.location.search}${window.location.hash}`
      );
    }
  }, []);

  const isAdmin = session?.role === 'admin';
  const selectedMember = selectedMemberId
    ? members.find((m) => m.id === selectedMemberId) || null
    : null;

  const handleAuthSuccess = (nextSession: ActiveSession) => {
    setSession(nextSession);
  };

  const handleLogout = () => {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setSession(null);
    setEditingMember(undefined);
    setImageSwapTarget(null);
  };

  const persistRosters = (nextMembers: ClanMember[]) => {
    if (!isAdmin) return;
    try {
      localStorage.setItem(ROSTERS_DB_KEY, JSON.stringify(nextMembers));
      setSaveFeedback('Roster saved.');
      setTimeout(() => setSaveFeedback(''), 2200);
    } catch {
      setSaveFeedback('Storage quota exceeded.');
    }
  };

  const persistSettings = (nextSettings: ClanSiteSettings) => {
    if (!isAdmin) return;
    try {
      localStorage.setItem(SITE_SETTINGS_DB_KEY, JSON.stringify(nextSettings));
      setSaveFeedback('Settings saved.');
      setTimeout(() => setSaveFeedback(''), 2200);
    } catch {
      setSaveFeedback('Storage quota exceeded.');
    }
  };

  const handleUpdateSetting = <K extends keyof ClanSiteSettings>(
    key: K,
    value: ClanSiteSettings[K]
  ) => {
    if (!isAdmin) return;
    const nextSettings = { ...siteSettings, [key]: value };
    setSiteSettings(nextSettings);
    persistSettings(nextSettings);
  };

  const handleUpdateMember = (id: string, patch: Partial<ClanMember>) => {
    if (!isAdmin) return;
    const nextMembers = members.map((m) => (m.id === id ? { ...m, ...patch } : m));
    setMembers(nextMembers);
    persistRosters(nextMembers);
  };

  const handleSaveMember = (savedMember: ClanMember) => {
    if (!isAdmin) return;
    const exists = members.some((m) => m.id === savedMember.id);
    const nextMembers = exists
      ? members.map((m) => (m.id === savedMember.id ? savedMember : m))
      : [...members, savedMember];
    setMembers(nextMembers);
    persistRosters(nextMembers);
    setEditingMember(undefined);
  };

  const handleDeleteMember = (id: string) => {
    if (!isAdmin) return;
    const nextMembers = members.filter((m) => m.id !== id);
    setMembers(nextMembers);
    persistRosters(nextMembers);
    if (selectedMemberId === id) {
      setSelectedMemberId(null);
    }
  };

  const handleResetDefaults = () => {
    if (!isAdmin) return;
    setMembers(DEFAULT_MEMBERS);
    setSiteSettings(DEFAULT_SITE_SETTINGS);
    persistRosters(DEFAULT_MEMBERS);
    persistSettings(DEFAULT_SITE_SETTINGS);
  };

  const handleSwapLogo = () => {
    if (!isAdmin) return;
    setImageSwapTarget({
      label: 'Clan Logo Emblem',
      currentUrl: siteSettings.logoUrl,
      defaultUrl: PRX_BACKGROUND_IMAGE,
      onApply: (nextUrl) => handleUpdateSetting('logoUrl', nextUrl),
    });
  };

  const handleSwapMemberImage = (member: ClanMember) => {
    if (!isAdmin) return;
    const defaultMatch = DEFAULT_MEMBERS.find((m) => m.id === member.id);
    setImageSwapTarget({
      label: `${member.ign} Portrait`,
      currentUrl: member.portraitUrl,
      defaultUrl: defaultMatch?.portraitUrl || member.portraitUrl,
      showPresets: true,
      onApply: (nextUrl) => handleUpdateMember(member.id, { portraitUrl: nextUrl }),
    });
  };

  const nextMemberNumber = String(members.length + 1).padStart(2, '0');

  return (
    <div className="relative min-h-screen bg-[#060E24] text-[#F8FAFC] flex flex-col">
      {/* Faded PRX Ice Logo Background using Navy Blue Y3K Aesthetic */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      >
        <img
          src={PRX_BACKGROUND_IMAGE}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-[0.14] brightness-75 contrast-125 saturate-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060E24]/75 via-[#081229]/65 to-[#060E24]/92" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          settings={siteSettings}
          session={session}
          editEnabled={isAdmin}
          onUpdateSetting={handleUpdateSetting}
          onSwapLogo={handleSwapLogo}
          onOpenAuth={() => setAuthOpen(true)}
          onLogout={handleLogout}
        />

        {saveFeedback && (
          <div
            role="status"
            className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-[#0F214D] border border-[#60A5FA] text-[#E0F2FE] font-mono text-xs rounded-xl shadow-lg"
          >
            {saveFeedback}
          </div>
        )}

        <main className="flex-1">
          <HeroY2KShowcase
            settings={siteSettings}
            editEnabled={isAdmin}
            onUpdateSetting={handleUpdateSetting}
          />

          <RosterSection
            settings={siteSettings}
            members={members}
            editEnabled={isAdmin}
            onUpdateSetting={handleUpdateSetting}
            onUpdateMember={handleUpdateMember}
            onSwapMemberImage={handleSwapMemberImage}
            onSelectMember={(m) => setSelectedMemberId(m.id)}
            onAddMember={() => setEditingMember(null)}
            onEditMember={(m) => setEditingMember(m)}
            onDeleteMember={handleDeleteMember}
            onResetDefaults={handleResetDefaults}
          />
        </main>

        <Footer clanName={siteSettings.clanName} />
      </div>

      {authOpen && (
        <AuthModal
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setAuthOpen(false)}
        />
      )}

      {selectedMember && (
        <MemberProfileModal
          member={selectedMember}
          editEnabled={isAdmin}
          onUpdateMember={handleUpdateMember}
          onSwapImage={handleSwapMemberImage}
          onClose={() => setSelectedMemberId(null)}
        />
      )}

      {isAdmin && editingMember !== undefined && (
        <MemberEditorModal
          initialMember={editingMember}
          nextNumber={nextMemberNumber}
          onSave={handleSaveMember}
          onClose={() => setEditingMember(undefined)}
        />
      )}

      {isAdmin && imageSwapTarget && (
        <ImageSwapModal
          target={imageSwapTarget}
          onClose={() => setImageSwapTarget(null)}
        />
      )}
    </div>
  );
}
