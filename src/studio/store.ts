// ═══════════════════════════════════════════════════════════
// Panel store — localStorage-backed CRUD for panels created in the
// admin Studio. Seeds the four panels from the Panel Studio mockup on
// first load so the dashboard isn't empty.
// ═══════════════════════════════════════════════════════════

import type { PanelConfig } from '../types/panel';
import { makePanelConfig } from '../sports/registry';

const KEY = 'boltos.panels.v1';

function seed(): PanelConfig[] {
  return [
    makePanelConfig('football', {
      id: 'pnl_mcfc',
      name: 'Manchester City FanZone',
      experience: 'stream',
      description: 'Welcome to the exclusive Manchester City FanZone.',
      status: 'deployed',
    }),
    makePanelConfig('f1', {
      id: 'pnl_haas',
      name: 'TGR Haas F1 Fan Hub',
      experience: 'stream',
      description: "TGR Haas F1's exclusive community space.",
      status: 'deployed',
    }),
    makePanelConfig('football', {
      id: 'pnl_qpr',
      name: 'QPR Exclusive Fan Chat',
      experience: 'stream',
      description: 'QPR Exclusive Fan Chat.',
      status: 'deployed',
    }),
    makePanelConfig('football', {
      id: 'pnl_austria',
      name: 'Austria National Football Fan Hub',
      experience: 'in-person',
      description: "Austria National Football team's central fan hub.",
      status: 'deployed',
    }),
    makePanelConfig('ufc', {
      id: 'pnl_ufc',
      name: 'Apex Fight Night',
      experience: 'stream',
      description: 'Championship main card — round-by-round with the fans.',
      status: 'deployed',
    }),
    makePanelConfig('rugby', {
      id: 'pnl_rugby',
      name: 'Autumn Internationals Hub',
      experience: 'in-person',
      description: 'Matchday companion for the autumn test series.',
      status: 'deployed',
    }),
    makePanelConfig('conference', {
      id: 'pnl_conf',
      name: 'BoltOS Summit 2026',
      experience: 'in-person',
      description: 'Main-stage companion: agenda, live Q&A and polls.',
      status: 'deployed',
    }),
  ];
}

export function loadPanels(): PanelConfig[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const seeded = seed();
      localStorage.setItem(KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as PanelConfig[];
  } catch {
    return seed();
  }
}

function persist(list: PanelConfig[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getPanel(id: string): PanelConfig | undefined {
  return loadPanels().find((p) => p.id === id);
}

export function upsertPanel(cfg: PanelConfig): PanelConfig[] {
  const list = loadPanels();
  const idx = list.findIndex((p) => p.id === cfg.id);
  const next = { ...cfg, updatedAt: Date.now() };
  if (idx >= 0) list[idx] = next;
  else list.unshift(next);
  persist(list);
  return list;
}

export function deletePanel(id: string): PanelConfig[] {
  const list = loadPanels().filter((p) => p.id !== id);
  persist(list);
  return list;
}

export function resetPanels(): PanelConfig[] {
  const seeded = seed();
  persist(seeded);
  return seeded;
}
