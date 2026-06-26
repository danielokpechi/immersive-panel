// ═══════════════════════════════════════════════════════════
// Share links — make a panel openable on ANY device with no shared
// backend storage. The full PanelConfig is encoded (base64url JSON) into
// the share URL, so a colleague who scans the QR renders the exact panel
// even though their browser has never seen it. The panel id still keys
// the Ably channel, so the admin's live control reaches them.
// ═══════════════════════════════════════════════════════════

import type { PanelConfig } from '../types/panel';
import { appBase } from '../config';

// base64url <-> UTF-8 JSON
function toB64Url(s: string): string {
  const b64 = btoa(unescape(encodeURIComponent(s)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(b64)));
}

/** Encode a panel config for transport in a URL. */
export function encodePanel(cfg: PanelConfig): string {
  return toB64Url(JSON.stringify(cfg));
}

/** Decode a panel config from a share URL. Returns null on any problem. */
export function decodePanel(encoded: string | null | undefined): PanelConfig | null {
  if (!encoded) return null;
  try {
    const cfg = JSON.parse(fromB64Url(encoded)) as PanelConfig;
    if (cfg && typeof cfg.id === 'string' && typeof cfg.sport === 'string') return cfg;
    return null;
  } catch {
    return null;
  }
}

/**
 * Full, self-contained fan URL: opens the chrome-free fan panel and
 * carries the config so it works on a fresh device.
 *   https://host/base/#/p/<id>?c=<encoded>
 */
export function shareUrl(cfg: PanelConfig): string {
  return `${appBase()}/#/p/${encodeURIComponent(cfg.id)}?c=${encodePanel(cfg)}`;
}
