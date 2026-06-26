// ═══════════════════════════════════════════════════════════
// Editorial content for the fan panel — news/articles, partner promos and
// the pre-match brief (team news + form). Mirrors the rich Man City build,
// generated per sport from the pack + competitors so every panel feels
// editorial, not empty.
// ═══════════════════════════════════════════════════════════

import type { Sport, SportPack } from '../types/panel';
import { FLAVORS } from './flavor';

export interface Article {
  tag: string;
  title: string;
  meta: string;
}

export interface Partner {
  name: string;
  offer: string;
  emoji: string;
}

// Sport-appropriate wording for the "build-up" feature.
const BUILDUP: Partial<Record<Sport, string>> = {
  football: 'the tactical battle',
  rugby: 'the forward battle',
  f1: 'the qualifying head-to-head',
  motogp: 'the front-row fight',
  ufc: 'the styles clash',
  basketball: 'the backcourt duel',
  tennis: 'the baseline battle',
  cricket: 'the new-ball spell',
  esports: 'the map-pool mind games',
  conference: 'the headline session',
};

export function articlesFor(pack: SportPack, competitors?: [string, string]): Article[] {
  const [c1, c2] = competitors ?? FLAVORS[pack.id].competitors;
  const fixture = c2 ? `${c1} vs ${c2}` : c1;
  return [
    { tag: 'PREVIEW', title: `${fixture}: ${BUILDUP[pack.id] ?? 'the big preview'}`, meta: `${pack.name} · 5 min read` },
    { tag: 'ANALYSIS', title: `The key matchup that decides it tonight`, meta: 'Analytics · 4 min read' },
    { tag: 'FEATURE', title: `Inside the build-up with ${c1}`, meta: 'Official · 3 min read' },
    { tag: 'INTERVIEW', title: `"We're ready" — the pre-game word`, meta: 'Exclusive · 2 min read' },
  ];
}

export const PARTNERS: Partner[] = [
  { name: 'Revolut', offer: 'Fan card — £20 cashback', emoji: '💳' },
  { name: 'Nissan', offer: 'Win a matchday test-drive', emoji: '🚗' },
  { name: 'Puma', offer: '20% off this season’s kit', emoji: '👟' },
];

// A short, sport-aware pre-match brief: squad/form lines + a form guide.
export function briefFor(pack: SportPack, competitors?: [string, string]) {
  const [c1, c2] = competitors ?? FLAVORS[pack.id].competitors;
  const newsBySport: Partial<Record<Sport, string[]>> = {
    football: ['Star striker passed fit and starts', 'Key midfielder returns from suspension', 'Opponent missing first-choice keeper'],
    rugby: ['Captain named in the starting XV', 'Bench stacked with finishers', 'Set-piece coach: "scrum is our weapon"'],
    f1: ['New floor upgrade fitted overnight', 'Both cars start on the soft tyre', 'Strategy: one-stop looks marginal'],
    ufc: ['Champion made weight at first attempt', 'Challenger looked sharp on the scales', 'Corner change confirmed for tonight'],
    conference: ['Keynote demo confirmed live', 'Surprise guest added to the panel', 'Q&A will be fully audience-driven'],
  };
  const news = newsBySport[pack.id] ?? [
    `${c1} arrive in form`,
    'Full-strength line-up expected',
    'Conditions look perfect for a classic',
  ];
  return {
    title: c2 ? `${c1} vs ${c2} — matchday brief` : `${c1} — matchday brief`,
    news,
    form: { left: { name: c1, results: ['W', 'W', 'D', 'W', 'L'] }, right: { name: c2 || 'Field', results: ['W', 'L', 'W', 'D', 'W'] } },
  };
}
