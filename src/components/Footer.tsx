import React from 'react';
import { ExternalLink } from 'lucide-react';
import { PrxLogoEmblem } from './ParadoxEmblems';

interface FooterProps {
  clanName: string;
}

const SOCIAL_LINKS = [
  { label: 'DISCORD', href: 'https://discord.gg/nj64e3E9Gr' },
  { label: 'FACEBOOK', href: 'https://www.facebook.com/parallelparadoxx' },
];

export function Footer({ clanName }: FooterProps) {
  return (
    <footer
      id="clan-info"
      className="bg-[#050C1D]/90 backdrop-blur-md border-t border-[#93C5FD]/25 pt-14 pb-10"
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-[#93C5FD]/20">
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-3">
              <PrxLogoEmblem className="w-8 h-8" />
              <span className="font-display text-lg font-extrabold tracking-tight text-y3k-ice">
                {clanName}
              </span>
            </div>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Official Call of Duty: Mobile Member Roster Showcase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-[#CBD5E1]">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[#93C5FD] transition-colors"
              >
                <span>{s.label}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px] text-[#94A3B8]">
          <span>&copy; 2026 {clanName} · CALL OF DUTY: MOBILE CLAN X COMMUNITY</span>
          <span>www.parallelparadox.com/roster</span>
        </div>
      </div>
    </footer>
  );
}
