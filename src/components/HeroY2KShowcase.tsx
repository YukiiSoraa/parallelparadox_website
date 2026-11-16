import React from 'react';
import { ArrowDown } from 'lucide-react';
import { ClanSiteSettings } from '../data/paradoxData';
import { InlineEditableText } from './InlineEditor';

interface HeroY2KShowcaseProps {
  settings: ClanSiteSettings;
  editEnabled: boolean;
  onUpdateSetting: <K extends keyof ClanSiteSettings>(key: K, value: ClanSiteSettings[K]) => void;
}

export function HeroY2KShowcase({
  settings,
  editEnabled,
  onUpdateSetting,
}: HeroY2KShowcaseProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-[#93C5FD]/20 y2k-navy-grid"
    >
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-8 py-24 md:py-32 flex flex-col items-center text-center">
        <InlineEditableText
          value={settings.clanName}
          onSave={(next) => onUpdateSetting('clanName', next)}
          editEnabled={editEnabled}
          as="h1"
          className="font-display font-extrabold tracking-tight text-y3k-ice uppercase leading-[0.95] max-w-4xl"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.75rem)',
            textWrap: 'balance',
          }}
        />

        {/* Centered Join Community Facebook CTA + Roster Anchor */}
        <div className="mt-9 flex flex-col items-center justify-center gap-4">
          <a
            href="https://www.facebook.com/parallelparadoxx"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              if (editEnabled) e.preventDefault();
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 font-mono text-xs font-semibold tracking-[0.14em] text-[#F8FAFC] bg-[#0F214D]/80 hover:bg-[#172F6B] border border-[#93C5FD]/35 hover:border-[#93C5FD] rounded-xl backdrop-blur-md transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD]"
          >
            <InlineEditableText
              value={settings.communityCtaLabel}
              onSave={(next) => onUpdateSetting('communityCtaLabel', next)}
              editEnabled={editEnabled}
              as="span"
            />
          </a>

          <a
            href="#roster"
            onClick={(e) => {
              if (editEnabled) e.preventDefault();
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 font-mono text-xs font-semibold tracking-[0.14em] text-[#F8FAFC] bg-[#0F214D]/80 hover:bg-[#172F6B] border border-[#93C5FD]/35 hover:border-[#93C5FD] rounded-xl backdrop-blur-md transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD]"
          >
            <InlineEditableText
              value={settings.rosterCtaLabel}
              onSave={(next) => onUpdateSetting('rosterCtaLabel', next)}
              editEnabled={editEnabled}
              as="span"
            />
            <ArrowDown className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
