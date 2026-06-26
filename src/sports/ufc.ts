// ═══════════════════════════════════════════════════════════
// UFC / Combat sport pack — fight night. inactive → prelims →
// walkouts → round 1 → round 2 → round 3 → result. Demonstrates an
// EVENT-driven transition: a KO in round 2 jumps straight to the
// result before the round timer elapses.
// ═══════════════════════════════════════════════════════════

import type { SportPack } from '../types/panel';
import { linearTransitions } from '../engine/stateMachine';

const MIN = 60_000;
const T_INACTIVE = 1 * MIN;
const T_PRELIMS = 4 * MIN;
const T_WALK = 2 * MIN;
const T_ROUND = 5 * MIN;
const R1_START = T_INACTIVE + T_PRELIMS + T_WALK;
const R2_START = R1_START + T_ROUND;

export const ufc: SportPack = {
  id: 'ufc',
  name: 'UFC / Combat',
  tagline: 'Main Event · Championship Bout',
  emoji: '🥊',
  initialState: 'inactive',
  theme: {
    primary: '#D20A0A',
    accent: '#E8B23A',
    surface: '#1C1614',
    bg: '#100B0A',
  },
  defaultModules: ['highlights', 'chat', 'ai-qa', 'predictions', 'polls', 'leaderboard', 'betting', 'store'],
  states: [
    { id: 'inactive', label: 'Fight Night', phase: 'idle', durationMs: T_INACTIVE, modules: ['highlights', 'store', 'leaderboard'], headline: 'Main card starting soon' },
    { id: 'prelims', label: 'Prelims', phase: 'pre', durationMs: T_PRELIMS, modules: ['highlights', 'chat', 'predictions', 'store'], headline: 'Prelims underway — early finishes already' },
    { id: 'walkouts', label: 'Walkouts', phase: 'pre', durationMs: T_WALK, modules: ['predictions', 'chat', 'betting', 'polls'], headline: 'Walkouts — pick your winner & method' },
    { id: 'round-1', label: 'Round 1', phase: 'live', durationMs: T_ROUND, modules: ['highlights', 'chat', 'betting', 'polls'], headline: 'Round 1 — feeling each other out' },
    { id: 'round-2', label: 'Round 2', phase: 'live', durationMs: T_ROUND, modules: ['highlights', 'chat', 'betting', 'polls'], headline: 'Round 2 — pressure building' },
    { id: 'round-3', label: 'Round 3', phase: 'live', durationMs: T_ROUND, modules: ['highlights', 'chat', 'betting', 'polls'], headline: 'Round 3 — championship rounds' },
    { id: 'result', label: 'Result', phase: 'post', durationMs: 0, modules: ['highlights', 'leaderboard', 'ai-qa', 'store'], headline: 'And the winner is… — recap & rewards' },
  ],
  transitions: [],
  timeline: [
    { atMs: R1_START, type: 'bell', title: 'Round 1 — fight!', detail: 'Touch of gloves, here we go.', takeover: true },
    { atMs: R1_START + 2 * MIN, type: 'takedown', title: 'Takedown landed', detail: 'Champion works for position.' },
    { atMs: R2_START, type: 'bell', title: 'Round 2', detail: 'Back to centre.' },
    {
      atMs: R2_START + 2.5 * MIN,
      type: 'ko',
      title: 'KNOCKOUT!',
      detail: 'Left hook, clean — it is all over in the 2nd.',
      takeover: true,
      meta: { method: 'KO, Round 2 2:30' },
    },
  ],
  clockLabel: (simMs, stateId) => {
    const round = (start: number, label: string) => {
      const t = Math.max(0, simMs - start);
      const sec = Math.floor(t / 1000);
      const mm = Math.floor(sec / 60);
      const ss = String(sec % 60).padStart(2, '0');
      return `${label} ${mm}:${ss}`;
    };
    switch (stateId) {
      case 'inactive': return 'FIGHT NIGHT';
      case 'prelims': return 'PRELIMS';
      case 'walkouts': return 'WALKOUTS';
      case 'round-1': return round(R1_START, 'R1');
      case 'round-2': return round(R2_START, 'R2');
      case 'round-3': return round(R2_START + T_ROUND, 'R3');
      case 'result': return 'RESULT';
      default: return '';
    }
  },
};

ufc.transitions = [
  ...linearTransitions(ufc.states),
  // event-driven early finish: a KO in round 2 ends the fight immediately
  { from: 'round-2', to: 'result', on: { type: 'event', event: 'ko' } },
];
