// ═══════════════════════════════════════════════════════════
// Sport registry — the single place that knows every sport pack.
// Adding a new sport = drop a pack file and register it here.
// ═══════════════════════════════════════════════════════════

import type { Sport, SportPack, PanelConfig, Experience } from '../types/panel';
import { football } from './football';
import { f1 } from './f1';
import { motogp } from './motogp';
import { ufc } from './ufc';
import { rugby } from './rugby';
import { basketball } from './basketball';
import { tennis } from './tennis';
import { cricket } from './cricket';
import { esports } from './esports';
import { conference } from './conference';

export const SPORTS: Record<Sport, SportPack> = {
  football,
  f1,
  motogp,
  ufc,
  rugby,
  basketball,
  tennis,
  cricket,
  esports,
  conference,
};

export const SPORT_LIST: SportPack[] = [
  football,
  f1,
  motogp,
  ufc,
  rugby,
  basketball,
  tennis,
  cricket,
  esports,
  conference,
];

export function getSport(id: Sport): SportPack {
  return SPORTS[id];
}

/** Seed a fresh PanelConfig from a sport pack with sensible defaults. */
export function makePanelConfig(
  sport: Sport,
  partial: Partial<PanelConfig> = {},
): PanelConfig {
  const pack = SPORTS[sport];
  const moduleStateMap: Record<string, typeof pack.defaultModules> = {};
  for (const s of pack.states) moduleStateMap[s.id] = [...s.modules];

  const now = Date.now();
  return {
    id: partial.id ?? `pnl_${Math.random().toString(36).slice(2, 9)}`,
    name: partial.name ?? `${pack.name} Fan Hub`,
    sport,
    experience: (partial.experience ?? 'stream') as Experience,
    description: partial.description ?? pack.tagline,
    enabledModules: partial.enabledModules ?? [...pack.defaultModules],
    moduleStateMap: partial.moduleStateMap ?? moduleStateMap,
    branding: partial.branding,
    startState: partial.startState,
    assetKey: partial.assetKey,
    status: partial.status ?? 'draft',
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
  };
}
