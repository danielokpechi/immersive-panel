// ═══════════════════════════════════════════════════════════
// Formula 1 sport pack — race weekend. inactive → build-up →
// formation lap → race (lights out, laps, pit windows, overtakes) →
// podium → post. Different rhythm from football: laps, not minutes.
// ═══════════════════════════════════════════════════════════

import type { SportPack } from '../types/panel';
import { linearTransitions } from '../engine/stateMachine';

const MIN = 60_000;
const T_INACTIVE = 1 * MIN;
const T_BUILD = 5 * MIN;
const T_FORM = 2 * MIN;
const T_RACE = 50 * MIN;
const RACE_START = T_INACTIVE + T_BUILD + T_FORM;
const TOTAL_LAPS = 57;

export const f1: SportPack = {
  id: 'f1',
  name: 'Formula 1',
  tagline: 'TGR Haas · Austrian Grand Prix',
  emoji: '🏎️',
  initialState: 'inactive',
  theme: {
    primary: '#E10600',
    accent: '#FFFFFF',
    surface: '#1A1418',
    bg: '#120C10',
  },
  defaultModules: ['highlights', 'chat', 'ai-qa', 'predictions', 'leaderboard', 'store', 'betting'],
  states: [
    { id: 'inactive', label: 'Race Day', phase: 'idle', durationMs: T_INACTIVE, modules: ['highlights', 'store', 'leaderboard'], headline: 'Lights out in under an hour' },
    { id: 'build-up', label: 'Build-Up', phase: 'pre', durationMs: T_BUILD, modules: ['predictions', 'ai-qa', 'chat', 'leaderboard'], headline: 'Grid set. Soft tyres all round — predict the podium.' },
    { id: 'formation', label: 'Formation Lap', phase: 'pre', durationMs: T_FORM, modules: ['chat', 'predictions', 'betting'], headline: 'Formation lap underway — cars to the grid' },
    { id: 'race', label: 'Race', phase: 'live', durationMs: T_RACE, modules: ['highlights', 'chat', 'predictions', 'betting'], headline: 'Lights out — racing live' },
    { id: 'podium', label: 'Podium', phase: 'post', durationMs: 3 * MIN, modules: ['highlights', 'leaderboard', 'store', 'chat'], headline: 'Chequered flag — to the podium' },
    { id: 'post', label: 'Post-Race', phase: 'post', durationMs: 0, modules: ['highlights', 'leaderboard', 'store', 'ai-qa'], headline: 'Race recap, driver ratings & rewards' },
  ],
  transitions: [],
  timeline: [
    { atMs: 1.5 * MIN, type: 'grid', title: 'Grid confirmed', detail: 'Verstappen on pole; Haas P8 and P11.' },
    { atMs: RACE_START, type: 'lights-out', title: 'LIGHTS OUT!', detail: 'The Austrian GP is GO.', takeover: true },
    { atMs: RACE_START + 6 * MIN, type: 'overtake', title: 'Overtake — Turn 4', detail: 'Haas gains a place into the hairpin.' },
    { atMs: RACE_START + 18 * MIN, type: 'pit', title: 'Pit window opens', detail: 'Leaders box for hards — 2.3s stop.', takeover: true, meta: { stop: '2.3s' } },
    { atMs: RACE_START + 30 * MIN, type: 'safety-car', title: 'Safety Car deployed', detail: 'Debris at Turn 6 — field bunches up.', takeover: true },
    { atMs: RACE_START + 42 * MIN, type: 'fastest-lap', title: 'Fastest lap', detail: 'Purple sector — new race-best.' },
    { atMs: RACE_START + T_RACE, type: 'chequered', title: 'CHEQUERED FLAG', detail: 'Verstappen wins; Haas scores points.', takeover: true },
  ],
  clockLabel: (simMs, stateId) => {
    switch (stateId) {
      case 'inactive': return 'RACE DAY';
      case 'build-up': return 'BUILD-UP';
      case 'formation': return 'FORMATION';
      case 'race': {
        const lap = Math.min(TOTAL_LAPS, Math.max(1, Math.floor(((simMs - RACE_START) / T_RACE) * TOTAL_LAPS) + 1));
        return `LAP ${lap}/${TOTAL_LAPS}`;
      }
      case 'podium': return 'PODIUM';
      case 'post': return 'POST-RACE';
      default: return '';
    }
  },
};

f1.transitions = linearTransitions(f1.states);
