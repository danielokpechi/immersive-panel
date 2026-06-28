// ═══════════════════════════════════════════════════════════
// Fan identity — the missing "who is this fan" layer.
//
// A fan has ONE identity across every panel and every match (a fan graph),
// it accrues XP and a tier over time (the retention loop), and it captures
// first-party data + marketing consent (the asset a club actually wants).
//
// This is the client-side SEAM for a real product: in production the store
// below is replaced by an auth provider (Clerk/Auth0) + a fan profile in
// Postgres + a consent/CRM record. Nothing else has to change — the app
// only ever talks to getFan()/useFan()/awardXp().
// ═══════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';

export interface FanIdentity {
  id: string;
  name: string;
  /** favourite player / club / interest — first-party signal */
  favorite?: string;
  /** optional contact for updates — the CRM hook */
  email?: string;
  /** explicit marketing consent */
  optIn: boolean;
  /** true when the fan skipped the join form (still tracked, not converted) */
  guest: boolean;
  xp: number;
  /** panel ids this fan has joined — breadth of the fan graph */
  panels: string[];
  createdAt: number;
}

const KEY = 'boltos.fan.v1';

export const TIERS = [
  { name: 'Rookie', min: 0 },
  { name: 'Supporter', min: 250 },
  { name: 'Regular', min: 750 },
  { name: 'Legend', min: 2000 },
] as const;

export function tierFor(xp: number): (typeof TIERS)[number] {
  let t: (typeof TIERS)[number] = TIERS[0];
  for (const tier of TIERS) if (xp >= tier.min) t = tier;
  return t;
}
export function nextTier(xp: number) {
  return TIERS.find((t) => t.min > xp) ?? null;
}

// ── reactive store (one fan, app-wide) ──
let fan: FanIdentity | null = load();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function load(): FanIdentity | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FanIdentity) : null;
  } catch {
    return null;
  }
}
function persist() {
  try {
    if (fan) localStorage.setItem(KEY, JSON.stringify(fan));
  } catch {
    /* ignore */
  }
}

export function getFan(): FanIdentity | null {
  return fan;
}

/** Subscribe a component to identity changes. */
export function useFan(): FanIdentity | null {
  const [, bump] = useState(0);
  useEffect(() => {
    const l = () => bump((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return fan;
}

const FAN_ADJ = ['Blue', 'Gold', 'North', 'Loyal', 'Roaring', 'Electric'];
const FAN_NOUN = ['Fan', 'Supporter', 'Stand', 'Faithful', 'Ultra'];

export function createFan(data: Partial<FanIdentity> & { guest?: boolean }): FanIdentity {
  const name =
    data.name?.trim() ||
    `${FAN_ADJ[Math.floor(Math.random() * FAN_ADJ.length)]}${FAN_NOUN[Math.floor(Math.random() * FAN_NOUN.length)]}${Math.floor(Math.random() * 90) + 10}`;
  fan = {
    id: `f_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`,
    name,
    favorite: data.favorite?.trim() || undefined,
    email: data.email?.trim() || undefined,
    optIn: Boolean(data.optIn),
    guest: Boolean(data.guest),
    xp: 100, // welcome bonus
    panels: [],
    createdAt: Date.now(),
  };
  persist();
  emit();
  return fan;
}

export function awardXp(n: number) {
  if (!fan || n <= 0) return;
  fan = { ...fan, xp: fan.xp + n };
  persist();
  emit();
}

/** Record that this fan joined a panel (fan-graph breadth) + a one-time bonus. */
export function joinPanel(panelId: string) {
  if (!fan || fan.panels.includes(panelId)) return;
  fan = { ...fan, panels: [...fan.panels, panelId], xp: fan.xp + 50 };
  persist();
  emit();
}

export function signOut() {
  fan = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  emit();
}
