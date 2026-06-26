// ═══════════════════════════════════════════════════════════
// Runtime configuration. The one place that reads build-time env so the
// rest of the app stays env-agnostic.
//
//  • VITE_ABLY_KEY — Ably API key. When present, the ControlBus bridges
//    commands/telemetry across DEVICES (admin phone ↔ fans' phones) via
//    Ably. When absent, control falls back to same-browser only
//    (BroadcastChannel), which is fine for local dev on one machine.
// ═══════════════════════════════════════════════════════════

export const ABLY_KEY: string | undefined =
  (import.meta.env.VITE_ABLY_KEY as string | undefined)?.trim() || undefined;

/** True when cross-device realtime is configured. */
export const REALTIME_ENABLED = Boolean(ABLY_KEY);

/** Vite's public base path (e.g. "/immersive-panel/" on GitHub Pages). */
export const BASE_URL: string = import.meta.env.BASE_URL || '/';

/** Absolute origin + base, no trailing slash. Used to build share links. */
export function appBase(): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${BASE_URL}`.replace(/\/+$/, '');
}

/**
 * URL of the bundled legacy football prototype, base-path aware.
 *  • auto   — run the self-advancing demo timeline (used only for previews).
 *             Off by default so deployed panels wait for the operator.
 *  • bridge — 'post' makes the panel take commands from its parent window
 *             (so React can relay cross-device Ably commands into it).
 */
export function legacyUrl(
  id: string,
  opts: {
    auto?: boolean;
    bridge?: 'post';
    start?: string;
    /** reskin the prototype for another club */
    team?: string;
    opp?: string;
    color?: string;
    /** team photo pool — swaps the baked-in Man City images */
    imgs?: string[];
  } = {},
): string {
  const p = new URLSearchParams({ v: '4', id });
  if (opts.auto) p.set('auto', '1');
  if (opts.bridge) p.set('bridge', opts.bridge);
  if (opts.start) p.set('start', opts.start);
  if (opts.team) p.set('team', opts.team);
  if (opts.opp) p.set('opp', opts.opp);
  if (opts.color) p.set('color', opts.color.replace('#', ''));
  if (opts.imgs && opts.imgs.length) p.set('imgs', opts.imgs.join('|'));
  return `${BASE_URL}legacy/index.html?${p.toString()}`;
}
