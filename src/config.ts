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

/** URL of the bundled legacy football prototype, base-path aware. */
export function legacyUrl(id: string): string {
  return `${BASE_URL}legacy/index.html?v=4&auto=1&id=${encodeURIComponent(id)}`;
}
