import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Pencil, Plus, RotateCcw, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { ClanMember, ClanSiteSettings } from '../data/paradoxData';
import { InlineEditableText } from './InlineEditor';

export type SortOption = 'name_asc' | 'name_desc' | 'number_asc';

interface RosterSectionProps {
  settings: ClanSiteSettings;
  members: ClanMember[];
  editEnabled: boolean;
  onUpdateSetting: <K extends keyof ClanSiteSettings>(key: K, value: ClanSiteSettings[K]) => void;
  onUpdateMember: (id: string, patch: Partial<ClanMember>) => void;
  onSwapMemberImage: (member: ClanMember) => void;
  onSelectMember: (member: ClanMember) => void;
  onAddMember?: () => void;
  onEditMember?: (member: ClanMember) => void;
  onDeleteMember?: (id: string) => void;
  onResetDefaults?: () => void;
}

export function RosterSection({
  settings,
  members,
  editEnabled,
  onUpdateSetting,
  onUpdateMember,
  onSwapMemberImage,
  onSelectMember,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onResetDefaults,
}: RosterSectionProps) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const visibleMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = members.filter((m) => {
      if (!q) return true;
      return (
        m.ign.toLowerCase().includes(q) ||
        m.realName.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        (m.division && m.division.toLowerCase().includes(q)) ||
        m.region.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name_asc') return a.ign.localeCompare(b.ign);
      if (sortBy === 'name_desc') return b.ign.localeCompare(a.ign);
      if (sortBy === 'number_asc') {
        return (parseInt(a.number, 10) || 999) - (parseInt(b.number, 10) || 999);
      }
      return 0;
    });
  }, [members, query, sortBy]);

  return (
    <section
      id="roster"
      className="relative py-16 md:py-24 y2k-navy-grid border-b border-[#93C5FD]/20"
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <InlineEditableText
              value={settings.rosterKicker}
              onSave={(next) => onUpdateSetting('rosterKicker', next)}
              editEnabled={editEnabled}
              as="p"
              className="font-mono text-xs font-semibold tracking-[0.18em] text-[#93C5FD] mb-2"
            />
            <InlineEditableText
              value={settings.rosterHeading}
              onSave={(next) => onUpdateSetting('rosterHeading', next)}
              editEnabled={editEnabled}
              as="h2"
              className="font-display font-extrabold text-y3k-ice tracking-tight"
              style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.6rem)', textWrap: 'balance' }}
            />
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-[#CBD5E1]">
            <span className="tabular-nums">{visibleMembers.length} MEMBERS</span>
          </div>
        </div>

        {/* Admin Roster Control Bar */}
        {editEnabled && (
          <div className="mb-8 y2k-navy-card border border-[#7DD3FC]/55 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#7DD3FC] shrink-0 mt-0.5" />
              <div>
                <div className="font-mono text-xs font-bold tracking-[0.08em] text-[#7DD3FC]">
                  ADMIN ROSTER CONTROL BAR
                </div>
                <p className="text-sm text-[#E2E8F0] mt-1">
                  Click any text or photo to edit inline, or use the buttons to add/edit/remove players.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 font-mono text-xs">
              {onAddMember && (
                <button
                  type="button"
                  onClick={onAddMember}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 y2k-aero-btn text-[#060E24] font-bold rounded-xl cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ ADD PLAYER</span>
                </button>
              )}
              {onResetDefaults && (
                <button
                  type="button"
                  onClick={onResetDefaults}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#060E24] hover:bg-red-950/60 text-[#CBD5E1] hover:text-red-200 border border-[#93C5FD]/25 hover:border-red-400/50 rounded-xl cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET DEFAULT ROSTERS</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search & Sort Directory Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-9">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#93C5FD] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <label htmlFor="member-search" className="sr-only">
              Search members by their IGN
            </label>
            <input
              id="member-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members by their IGN"
              className="w-full bg-[#0F214D]/80 backdrop-blur-md border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8]"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <label htmlFor="member-sort" className="font-mono text-xs text-[#94A3B8] whitespace-nowrap">
              SORT BY:
            </label>
            <select
              id="member-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-[#0F214D]/90 border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#F8FAFC] cursor-pointer"
            >
              <option value="name_asc">Name (A &rarr; Z)</option>
              <option value="name_desc">Name (Z &rarr; A)</option>
              <option value="number_asc">Member # (01 &rarr; 99)</option>
            </select>
          </div>
        </div>

        {/* Member Grid */}
        {visibleMembers.length === 0 ? (
          <div className="y2k-navy-card border border-[#93C5FD]/25 rounded-2xl p-12 text-center">
            <p className="font-display text-lg font-bold text-white">
              No matching members found
            </p>
            <p className="text-sm text-[#94A3B8] mt-1">
              Try clearing your search filter.
            </p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mt-4 px-5 py-2 font-mono text-xs font-semibold text-[#060E24] y2k-aero-btn rounded-xl cursor-pointer"
            >
              CLEAR SEARCH
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleMembers.map((member) => {
              const isBroken = brokenImages[member.id];
              return (
                <motion.article
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="group y2k-navy-card border border-[#93C5FD]/25 hover:border-[#60A5FA] rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5"
                >
                  {/* Portrait Container */}
                  <div
                    className={`relative aspect-[3/4] w-full overflow-hidden bg-[#0F214D] border-b border-[#93C5FD]/20 ${
                      editEnabled
                        ? 'outline-1 outline-dashed outline-[#7DD3FC]/60 hover:outline-[#BAE6FD]'
                        : ''
                    }`}
                  >
                    {!isBroken && member.portraitUrl ? (
                      <img
                        src={member.portraitUrl}
                        alt={`${member.ign} — ${member.role}`}
                        referrerPolicy="no-referrer"
                        onClick={(e) => {
                          if (editEnabled) {
                            e.preventDefault();
                            e.stopPropagation();
                            onSwapMemberImage(member);
                          }
                        }}
                        title={editEnabled ? 'Click photo to swap image' : undefined}
                        onError={() =>
                          setBrokenImages((prev) => ({ ...prev, [member.id]: true }))
                        }
                        className={`w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03] ${
                          editEnabled ? 'cursor-pointer' : ''
                        }`}
                      />
                    ) : (
                      <div
                        onClick={() => {
                          if (editEnabled) onSwapMemberImage(member);
                        }}
                        className={`w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#1E3A8A] to-[#060E24] ${
                          editEnabled ? 'cursor-pointer' : ''
                        }`}
                      >
                        <span className="font-display text-3xl font-extrabold text-[#93C5FD]">
                          {member.ign.slice(0, 3)}
                        </span>
                        <span className="font-mono text-xs text-[#CBD5E1] mt-2">
                          {member.ign}
                        </span>
                      </div>
                    )}

                    {/* Contrast Scrim */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#060E24]/95 via-[#060E24]/55 to-transparent pointer-events-none"
                    />

                    {/* Top Member Number & Profile Action */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 font-mono text-[11px] pointer-events-none">
                      <span className="pointer-events-auto bg-[#060E24]/80 backdrop-blur-md text-[#E2E8F0] border border-[#93C5FD]/35 px-2.5 py-1 rounded-lg font-semibold truncate inline-flex items-center gap-1">
                        <span>NO.</span>
                        <InlineEditableText
                          value={member.number}
                          onSave={(next) => onUpdateMember(member.id, { number: next })}
                          editEnabled={editEnabled}
                          as="span"
                        />
                        <span>·</span>
                        <InlineEditableText
                          value={member.division || member.region}
                          onSave={(next) =>
                            onUpdateMember(
                              member.id,
                              member.division ? { division: next } : { region: next }
                            )
                          }
                          editEnabled={editEnabled}
                          as="span"
                        />
                      </span>

                      <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
                        {editEnabled && onEditMember && (
                          <button
                            type="button"
                            onClick={() => onEditMember(member)}
                            aria-label={`Edit ${member.ign}`}
                            title={`Edit ${member.ign}`}
                            className="inline-flex items-center justify-center bg-[#7DD3FC] hover:bg-white text-[#060E24] p-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {editEnabled && onDeleteMember && (
                          <button
                            type="button"
                            onClick={() => onDeleteMember(member.id)}
                            aria-label={`Delete ${member.ign}`}
                            title={`Delete ${member.ign}`}
                            className="inline-flex items-center justify-center bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onSelectMember(member)}
                          className="inline-flex items-center gap-1 bg-white/90 hover:bg-[#60A5FA] text-[#060E24] px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0"
                        >
                          <span>PROFILE</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Portrait Identity */}
                    <div className="absolute bottom-3.5 left-4 right-4">
                      <InlineEditableText
                        value={member.role}
                        onSave={(next) => onUpdateMember(member.id, { role: next })}
                        editEnabled={editEnabled}
                        as="div"
                        className="font-mono text-[11px] tracking-[0.12em] text-[#93C5FD] inline-block"
                      />
                      <InlineEditableText
                        value={member.ign}
                        onSave={(next) => onUpdateMember(member.id, { ign: next })}
                        editEnabled={editEnabled}
                        as="h3"
                        className="font-display text-2xl font-extrabold tracking-tight text-white"
                      />
                      <InlineEditableText
                        value={member.realName}
                        onSave={(next) => onUpdateMember(member.id, { realName: next })}
                        editEnabled={editEnabled}
                        as="div"
                        className="font-mono text-xs text-[#CBD5E1] mt-0.5 inline-block"
                      />
                    </div>
                  </div>

                  {/* Clean Bio & Profile Action Footer */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <InlineEditableText
                        value={member.bio || 'Official Parallel Paradox member.'}
                        onSave={(next) => onUpdateMember(member.id, { bio: next })}
                        editEnabled={editEnabled}
                        as="p"
                        multiline
                        className="text-xs text-[#CBD5E1] leading-relaxed line-clamp-2"
                      />
                      {member.stats && (
                        <InlineEditableText
                          value={member.stats}
                          onSave={(next) => onUpdateMember(member.id, { stats: next })}
                          editEnabled={editEnabled}
                          as="div"
                          className="font-mono text-[11px] text-[#7DD3FC]"
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#93C5FD]/15 font-mono text-[11px]">
                      <span className="text-[#94A3B8] truncate inline-flex items-center gap-1">
                        {member.uid ? (
                          <>
                            <span>UID</span>
                            <InlineEditableText
                              value={member.uid}
                              onSave={(next) => onUpdateMember(member.id, { uid: next })}
                              editEnabled={editEnabled}
                              as="span"
                            />
                          </>
                        ) : (
                          <InlineEditableText
                            value={member.region}
                            onSave={(next) => onUpdateMember(member.id, { region: next })}
                            editEnabled={editEnabled}
                            as="span"
                          />
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectMember(member)}
                        className="font-semibold text-[#93C5FD] hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        VIEW PROFILE &rarr;
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
