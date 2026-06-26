// eSports sport pack — best-of-three maps, round-based. Score hero (rounds).

import type { SportPack } from '../types/panel';
import { linearTransitions } from '../engine/stateMachine';

const MIN = 60_000;
const T_INACTIVE = 1 * MIN;
const T_PRE = 4 * MIN;
const T_MAP = 22 * MIN;
const T_BREAK = 4 * MIN;
const M1 = T_INACTIVE + T_PRE;
const M2 = M1 + T_MAP + T_BREAK;

export const esports: SportPack = {
  id: 'esports',
  name: 'eSports',
  tagline: 'Nova vs Apex · Major Final',
  emoji: '🎮',
  initialState: 'inactive',
  theme: { primary: '#00D1FF', accent: '#FF4DD2', surface: '#0C1626', bg: '#070D18' },
  defaultModules: ['highlights', 'chat', 'ai-qa', 'predictions', 'polls', 'leaderboard', 'betting', 'store', 'moderation'],
  states: [
    { id: 'inactive', label: 'Match Day', phase: 'idle', durationMs: T_INACTIVE, modules: ['highlights', 'store', 'leaderboard'], headline: 'Players warming up' },
    { id: 'pre', label: 'Pre-Game', phase: 'pre', durationMs: T_PRE, modules: ['predictions', 'ai-qa', 'chat', 'moderation'], headline: 'Veto done — predict the score' },
    { id: 'map-1', label: 'Map 1', phase: 'live', durationMs: T_MAP, modules: ['highlights', 'chat', 'betting', 'polls'], headline: 'Map 1 live' },
    { id: 'map-break', label: 'Map Break', phase: 'break', durationMs: T_BREAK, modules: ['store', 'polls', 'ai-qa', 'chat'], headline: 'Between maps — stretch & shop' },
    { id: 'map-2', label: 'Map 2', phase: 'live', durationMs: T_MAP, modules: ['highlights', 'chat', 'betting', 'polls'], headline: 'Map 2 live' },
    { id: 'result', label: 'Result', phase: 'post', durationMs: 0, modules: ['highlights', 'leaderboard', 'store', 'ai-qa'], headline: 'GG — recap, MVP & rewards' },
  ],
  transitions: [],
  timeline: [
    { atMs: M1 + 5 * MIN, type: 'round-win', title: 'Round won', detail: 'Clean execute on B.', meta: { score: '4–2' } },
    { atMs: M1 + 12 * MIN, type: 'ace', title: 'ACE!', detail: 'Whole team down — insane 1v5!', takeover: true, meta: { score: '8–5' } },
    { atMs: M1 + 19 * MIN, type: 'clutch', title: 'CLUTCH 1v3!', detail: 'Wins it from nothing.', takeover: true, meta: { score: '13–9' } },
    { atMs: M2 + 16 * MIN, type: 'map-point', title: 'MAP POINT', detail: 'Serving for the series.', takeover: true },
  ],
  clockLabel: (_simMs, stateId) => {
    switch (stateId) {
      case 'inactive': return 'MATCH DAY';
      case 'pre': return 'PRE-GAME';
      case 'map-1': return 'MAP 1 · LIVE';
      case 'map-break': return 'MAP BREAK';
      case 'map-2': return 'MAP 2 · LIVE';
      default: return 'RESULT';
    }
  },
};

esports.transitions = linearTransitions(esports.states);
