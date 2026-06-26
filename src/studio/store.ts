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
      assetKey: 'manchester_city',
      branding: { name: 'Man City', emoji: '🩵', primary: '#6CABDD', accent: '#C9A84C', competitors: ['Man City', 'Real Madrid'] },
    }),
    makePanelConfig('football', {
      id: 'pnl_manutd',
      name: 'Manchester United Fan Hub',
      experience: 'stream',
      description: 'Old Trafford matchday companion for the Red Devils.',
      status: 'deployed',
      assetKey: 'manchester_united',
      branding: { name: 'Man Utd', emoji: '🔴', primary: '#DA291C', accent: '#FBE122', competitors: ['Man Utd', 'Liverpool'] },
    }),
    makePanelConfig('f1', {
      id: 'pnl_haas',
      name: 'TGR Haas F1 Fan Hub',
      experience: 'stream',
      description: "TGR Haas F1's exclusive community space.",
      status: 'deployed',
      assetKey: 'f1_haas',
    }),
    makePanelConfig('football', {
      id: 'pnl_qpr',
      name: 'QPR Exclusive Fan Chat',
      experience: 'stream',
      description: 'QPR Exclusive Fan Chat.',
      status: 'deployed',
      branding: { name: 'QPR', emoji: '🔵', primary: '#1D5BA4', accent: '#E03A3E', competitors: ['QPR', 'Watford'] },
    }),
    makePanelConfig('football', {
      id: 'pnl_austria',
      name: 'Austria National Football Fan Hub',
      experience: 'in-person',
      description: "Austria National Football team's central fan hub.",
      status: 'deployed',
      branding: { name: 'Austria', emoji: '🔴', primary: '#C8102E', accent: '#FFFFFF', competitors: ['Austria', 'Germany'] },
    }),
    makePanelConfig('ufc', {
      id: 'pnl_ufc',
      name: 'Apex Fight Night',
      experience: 'stream',
      description: 'Championship main card — round-by-round with the fans.',
      status: 'deployed',
      assetKey: 'ufc',
    }),
    makePanelConfig('rugby', {
      id: 'pnl_rugby',
      name: 'Autumn Internationals Hub',
      experience: 'in-person',
      description: 'Matchday companion for the autumn test series.',
      status: 'deployed',
      assetKey: 'rugby',
    }),
    makePanelConfig('f1', {
      id: 'pnl_mclaren',
      name: 'McLaren F1 Fan Hub',
      experience: 'stream',
      description: "McLaren's papaya community space.",
      status: 'deployed',
      assetKey: 'f1_mclaren',
      branding: { name: 'McLaren', emoji: '🟠', primary: '#FF8000', accent: '#47C7FC' },
    }),
    makePanelConfig('f1', {
      id: 'pnl_ferrari',
      name: 'Scuderia Ferrari Fan Hub',
      experience: 'stream',
      description: 'Forza Ferrari — tifosi central.',
      status: 'deployed',
      assetKey: 'f1_ferrari',
      branding: { name: 'Ferrari', emoji: '🔴', primary: '#D40000', accent: '#FFEB00' },
    }),
    makePanelConfig('f1', {
      id: 'pnl_mercedes',
      name: 'Mercedes-AMG F1 Hub',
      experience: 'stream',
      description: 'The Silver Arrows fan space.',
      status: 'deployed',
      assetKey: 'f1_mercedes',
      branding: { name: 'Mercedes', emoji: '⚪', primary: '#00D2BE', accent: '#C0C0C0' },
    }),
    makePanelConfig('ufc', {
      id: 'pnl_mayweather',
      name: 'Mayweather — The Money Fight',
      experience: 'stream',
      description: 'TMT fight-night companion.',
      status: 'deployed',
      assetKey: 'mayweather',
      branding: { name: 'Mayweather', emoji: '🥊', primary: '#C9A227', accent: '#111111' },
    }),
    makePanelConfig('ufc', {
      id: 'pnl_mcgregor',
      name: 'McGregor — Notorious Fan Hub',
      experience: 'stream',
      description: 'The Notorious match-night hub.',
      status: 'deployed',
      assetKey: 'mcgregor',
      branding: { name: 'McGregor', emoji: '🥊', primary: '#0A5C36', accent: '#C9A227' },
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
