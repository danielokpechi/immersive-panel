// ═══════════════════════════════════════════════════════════
// Team / club presets — pick one in the Create-Panel wizard to brand a
// panel (name, emoji, colours, competitors). A preset just produces a
// PanelConfig.branding override on top of the sport pack.
// ═══════════════════════════════════════════════════════════

import type { Branding, Sport } from '../types/panel';

export interface TeamPreset {
  id: string;
  sport: Sport;
  name: string;
  branding: Branding;
  /** suggested panel name / tagline */
  panelName: string;
}

export const TEAM_PRESETS: TeamPreset[] = [
  // Formula 1
  { id: 'f1-mclaren', sport: 'f1', name: 'McLaren', panelName: 'McLaren F1 Fan Hub', branding: { name: 'McLaren', emoji: '🟠', primary: '#FF8000', accent: '#47C7FC' } },
  { id: 'f1-haas', sport: 'f1', name: 'Haas', panelName: 'TGR Haas F1 Fan Hub', branding: { name: 'Haas', emoji: '🏎️', primary: '#E10600', accent: '#B6BABD' } },
  { id: 'f1-ferrari', sport: 'f1', name: 'Ferrari', panelName: 'Scuderia Fan Hub', branding: { name: 'Ferrari', emoji: '🔴', primary: '#D40000', accent: '#FFEB00' } },
  // MotoGP
  { id: 'motogp-apex', sport: 'motogp', name: 'Apex Racing', panelName: 'Apex MotoGP Hub', branding: { name: 'Apex Racing', emoji: '🏍️', primary: '#FF6B00', accent: '#FFD166' } },
  // Basketball
  { id: 'bball-metro', sport: 'basketball', name: 'Metro City', panelName: 'Metro City Courtside', branding: { name: 'Metro City', emoji: '🏀', primary: '#1D77E8', accent: '#F2C14E' } },
  // Football clubs (engine note: the seeded football panels use the legacy MCFC prototype)
  { id: 'fb-generic', sport: 'football', name: 'Your Club', panelName: 'Club Fan Hub', branding: { name: 'Club', emoji: '⚽', primary: '#6CABDD', accent: '#C9A84C' } },
];

export function teamsForSport(sport: Sport): TeamPreset[] {
  return TEAM_PRESETS.filter((t) => t.sport === sport);
}
