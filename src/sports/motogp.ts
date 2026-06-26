// MotoGP sport pack — race day on two wheels. Mirrors F1's rhythm
// (warm-up → grid → race → podium) but with its own events and laps.

import type { SportPack } from '../types/panel';
import { linearTransitions } from '../engine/stateMachine';

const MIN = 60_000;
const T_INACTIVE = 1 * MIN;
const T_WARM = 4 * MIN;
const T_GRID = 2 * MIN;
const T_RACE = 45 * MIN;
const RACE_START = T_INACTIVE + T_WARM + T_GRID;
const LAPS = 28;

export const motogp: SportPack = {
  id: 'motogp',
  name: 'MotoGP',
  tagline: 'Apex Racing · Austrian Grand Prix',
  emoji: '🏍️',
  initialState: 'inactive',
  theme: { primary: '#FF6B00', accent: '#FFD166', surface: '#1B130C', bg: '#120C07' },
  defaultModules: ['highlights', 'chat', 'ai-qa', 'predictions', 'leaderboard', 'betting', 'store'],
  states: [
    { id: 'inactive', label: 'Race Day', phase: 'idle', durationMs: T_INACTIVE, modules: ['highlights', 'store', 'leaderboard'], headline: 'Warm-up lap soon' },
    { id: 'warm-up', label: 'Warm-Up', phase: 'pre', durationMs: T_WARM, modules: ['predictions', 'ai-qa', 'chat'], headline: 'Sighting laps — predict the podium' },
    { id: 'grid', label: 'On the Grid', phase: 'pre', durationMs: T_GRID, modules: ['chat', 'predictions', 'betting'], headline: 'Riders to the grid' },
    { id: 'race', label: 'Race', phase: 'live', durationMs: T_RACE, modules: ['highlights', 'chat', 'predictions', 'betting'], headline: 'Lights out — racing live' },
    { id: 'podium', label: 'Podium', phase: 'post', durationMs: 3 * MIN, modules: ['highlights', 'leaderboard', 'store', 'chat'], headline: 'Chequered flag — to the podium' },
    { id: 'post', label: 'Post-Race', phase: 'post', durationMs: 0, modules: ['highlights', 'leaderboard', 'store', 'ai-qa'], headline: 'Race recap, rider ratings & rewards' },
  ],
  transitions: [],
  timeline: [
    { atMs: RACE_START, type: 'lights-out', title: 'LIGHTS OUT!', detail: 'They are away in Austria.', takeover: true },
    { atMs: RACE_START + 8 * MIN, type: 'overtake', title: 'Overtake — Turn 3', detail: 'A move on the brakes.' },
    { atMs: RACE_START + 20 * MIN, type: 'crash', title: 'Crash at Turn 9', detail: 'Rider down — gravel trap, rider OK.', takeover: true },
    { atMs: RACE_START + 34 * MIN, type: 'fastest-lap', title: 'Fastest lap', detail: 'New race-best pace.' },
    { atMs: RACE_START + T_RACE, type: 'chequered', title: 'CHEQUERED FLAG', detail: 'A thrilling Austrian GP done.', takeover: true },
  ],
  clockLabel: (simMs, stateId) => {
    switch (stateId) {
      case 'inactive': return 'RACE DAY';
      case 'warm-up': return 'WARM-UP';
      case 'grid': return 'ON THE GRID';
      case 'race': {
        const lap = Math.min(LAPS, Math.max(1, Math.floor(((simMs - RACE_START) / T_RACE) * LAPS) + 1));
        return `LAP ${lap}/${LAPS}`;
      }
      case 'podium': return 'PODIUM';
      default: return 'POST-RACE';
    }
  },
};

motogp.transitions = linearTransitions(motogp.states);
