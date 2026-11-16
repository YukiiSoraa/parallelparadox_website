/**
 * ============================================================================
 * PARALLEL PARADOX — OFFICIAL MEMBER ROSTER DATA
 * ============================================================================
 * Edit this directly on the website by logging into the Admin account and
 * using the Admin Roster Control Bar — no coding required.
 * ============================================================================
 */

export interface ClanMember {
  id: string;
  number: string;
  ign: string;
  realName: string;
  uid: string;
  role: string;
  division?: string;
  stats?: string;
  region: string;
  portraitUrl: string;
  bio: string;
  tiktok?: string;
  youtube?: string;
  x?: string;
}

export interface ClanSiteSettings {
  clanName: string;
  logoUrl: string;
  communityCtaLabel: string;
  rosterCtaLabel: string;
  rosterKicker: string;
  rosterHeading: string;
  footerTagline: string;
  footerCopyright: string;
  footerBadge: string;
  discordLabel: string;
  facebookLabel: string;
  siteUrl: string;
}

export const PRX_BACKGROUND_IMAGE = '/assets/aistudio/prx_a687ed31.jpg';

export const DEFAULT_SITE_SETTINGS: ClanSiteSettings = {
  clanName: 'PARALLEL PARADOX',
  logoUrl: PRX_BACKGROUND_IMAGE,
  communityCtaLabel: 'MESSAGE US TO JOIN OUR COMMUNITY',
  rosterCtaLabel: 'VIEW MEMBER ROSTER',
  rosterKicker: 'OFFICIAL MEMBER ROSTER SHOWCASE',
  rosterHeading: 'Official Member Roster',
  footerTagline: 'Official Call of Duty: Mobile Member Roster Showcase.',
  footerCopyright: '© 2026 PARALLEL PARADOX · CALL OF DUTY: MOBILE CLAN X COMMUNITY',
  footerBadge: 'OFFICIAL MEMBER ROSTER',
  discordLabel: 'DISCORD',
  facebookLabel: 'FACEBOOK',
  siteUrl: 'www.parallelparadox.gg',
};

export const PRESET_PORTRAITS = [
  { label: 'Portrait 01 (Sky Jacket)', url: '/src/assets/images/codm_y2k_kael_1794836286890.jpg' },
  { label: 'Portrait 02 (Blue Stripe)', url: '/src/assets/images/codm_y2k_vesper_clean_1794836319970.jpg' },
  { label: 'Portrait 03 (Ice Fleece)', url: '/src/assets/images/codm_y2k_nyx_1794836288393.jpg' },
  { label: 'Portrait 04 (Cobalt Jacket)', url: '/src/assets/images/codm_y2k_zero_1794836289017.jpg' },
  { label: 'Portrait 05 (Star Hoodie)', url: '/src/assets/images/codm_y2k_sable_1794836289803.jpg' },
  { label: 'Portrait 06 (Silver Knit)', url: '/src/assets/images/codm_y2k_kuro_1794836289082.jpg' },
];

export const DEFAULT_MEMBERS: ClanMember[] = [
  {
    id: 'member-kael',
    number: '01',
    ign: 'PRX·KAEL',
    realName: 'Ren Takahashi',
    uid: '71948204192847102',
    role: 'Co-Leader',
    region: 'JP / NA',
    portraitUrl: '/src/assets/images/codm_y2k_kael_1794836286890.jpg',
    bio: 'Leading ranked lobbies and tournament scrims for Parallel Paradox.',
    tiktok: 'https://tiktok.com',
    youtube: 'https://youtube.com',
    x: 'https://x.com',
  },
  {
    id: 'member-vesper',
    number: '02',
    ign: 'PRX·VESPER',
    realName: 'Chloe Lindqvist',
    uid: '71948204998120411',
    role: 'Clan Leader',
    region: 'SE / EU',
    portraitUrl: '/src/assets/images/codm_y2k_vesper_clean_1794836319970.jpg',
    bio: 'Clan founder and main shotcaller for Parallel Paradox Call of Duty: Mobile.',
    tiktok: 'https://tiktok.com',
    youtube: 'https://youtube.com',
    x: 'https://x.com',
  },
  {
    id: 'member-nyx',
    number: '03',
    ign: 'PRX·NYX',
    realName: 'Kasper Holm',
    uid: '71948205541092834',
    role: 'Member',
    region: 'DK / EU',
    portraitUrl: '/src/assets/images/codm_y2k_nyx_1794836288393.jpg',
    bio: 'Search & Destroy specialist known for fast opening picks.',
    tiktok: 'https://tiktok.com',
    youtube: 'https://youtube.com',
  },
  {
    id: 'member-zero',
    number: '04',
    ign: 'PRX·ZERO',
    realName: 'Devon Sterling',
    uid: '71948206120934812',
    role: 'Member',
    region: 'CA / NA',
    portraitUrl: '/src/assets/images/codm_y2k_zero_1794836289017.jpg',
    bio: 'Dependable Hardpoint and Control anchor keeping spawns locked for the squad.',
    youtube: 'https://youtube.com',
    x: 'https://x.com',
  },
  {
    id: 'member-sable',
    number: '05',
    ign: 'PRX·SABLE',
    realName: 'Camila Reyes',
    uid: '71948207442190552',
    role: 'BR Captain',
    region: 'MX / NA',
    portraitUrl: '/src/assets/images/codm_y2k_sable_1794836289803.jpg',
    bio: 'Alcatraz & Isolated custom lobby captain leading Battle Royale squads.',
    tiktok: 'https://tiktok.com',
    x: 'https://x.com',
  },
  {
    id: 'member-kuro',
    number: '06',
    ign: 'PRX·KURO',
    realName: 'Haruto Sato',
    uid: '71948208812340019',
    role: 'Member',
    region: 'JP / SEA',
    portraitUrl: '/src/assets/images/codm_y2k_kuro_1794836289082.jpg',
    bio: 'Clan Wars contributor keeping Parallel Paradox top-ranked.',
    tiktok: 'https://tiktok.com',
    youtube: 'https://youtube.com',
  },
];
