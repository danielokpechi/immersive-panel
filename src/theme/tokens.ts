// ═══════════════════════════════════════════════════════════
// Brand + module design tokens. Per-sport palettes live in each
// sport pack's `theme`; this file holds the platform-wide brand.
// ═══════════════════════════════════════════════════════════

import type { ModuleId, SportTheme } from '../types/panel';

/** BoltOS brand tokens (carried over from the MCFC case study). */
export const BRAND = {
  sky: '#6CABDD',
  royal: '#7CB5E2',
  gold: '#C9A84C',
  surfaceNavy: '#0D1F35',
  deepNavy: '#0A1628',
  nearBlack: '#0D0D0D',
} as const;

/** Apply a sport theme to a DOM element as CSS custom properties. */
export function applySportTheme(el: HTMLElement, theme: SportTheme) {
  el.style.setProperty('--c-primary', theme.primary);
  el.style.setProperty('--c-accent', theme.accent);
  el.style.setProperty('--c-surface', theme.surface);
  el.style.setProperty('--c-bg', theme.bg);
}

/** Display metadata for each module in the shared library. */
export const MODULE_META: Record<
  ModuleId,
  { label: string; emoji: string; blurb: string }
> = {
  chat: { label: 'Chat Room', emoji: '💬', blurb: 'Live fan chat' },
  'ai-qa': { label: 'AI Q&A', emoji: '🤖', blurb: 'Ask the assistant anything' },
  store: { label: 'Affiliate Store', emoji: '🛍️', blurb: 'Shop drops & merch' },
  highlights: { label: 'Highlights', emoji: '🎬', blurb: 'Moments as they happen' },
  predictions: { label: 'Predictions', emoji: '🔮', blurb: 'Call the next moment' },
  polls: { label: 'Polls & Quizzes', emoji: '📊', blurb: 'Vote and play along' },
  leaderboard: { label: 'Leaderboard', emoji: '🏆', blurb: 'XP, tiers & ranking' },
  moderation: { label: 'AI Moderation', emoji: '🛡️', blurb: 'Keeps chat clean' },
  betting: { label: 'Betting Overlay', emoji: '🎲', blurb: 'Live odds that move' },
};

export const ALL_MODULES = Object.keys(MODULE_META) as ModuleId[];
