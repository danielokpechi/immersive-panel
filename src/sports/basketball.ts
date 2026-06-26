// Basketball sport pack — four quarters + halftime. Score hero.

import type { SportPack } from '../types/panel';
import { linearTransitions } from '../engine/stateMachine';

const MIN = 60_000;
const T_INACTIVE = 1 * MIN;
const T_PRE = 4 * MIN;
const T_Q = 12 * MIN;
const T_HALF = 5 * MIN;
const Q1 = T_INACTIVE + T_PRE;
const Q3 = Q1 + T_Q * 2 + T_HALF;

export const basketball: SportPack = {
  id: 'basketball',
  name: 'Basketball',
  tagline: 'Metro City vs Coast United · Pro League',
  emoji: '🏀',
  initialState: 'inactive',
  theme: { primary: '#E8741E', accent: '#F2C14E', surface: '#1E140C', bg: '#130D07' },
  defaultModules: ['highlights', 'chat', 'ai-qa', 'predictions', 'polls', 'leaderboard', 'betting', 'store'],
  states: [
    { id: 'inactive', label: 'Game Day', phase: 'idle', durationMs: T_INACTIVE, modules: ['highlights', 'store', 'leaderboard'], headline: 'Tip-off approaching' },
    { id: 'pre', label: 'Pre-Game', phase: 'pre', durationMs: T_PRE, modules: ['predictions', 'ai-qa', 'chat'], headline: 'Starting fives in — predict the MVP' },
    { id: 'q1', label: 'Q1', phase: 'live', durationMs: T_Q, modules: ['highlights', 'chat', 'betting'], headline: 'First quarter underway' },
    { id: 'q2', label: 'Q2', phase: 'live', durationMs: T_Q, modules: ['highlights', 'chat', 'betting'], headline: 'Second quarter' },
    { id: 'halftime', label: 'Halftime', phase: 'break', durationMs: T_HALF, modules: ['store', 'polls', 'ai-qa', 'chat'], headline: 'Halftime show — grab a refill' },
    { id: 'q3', label: 'Q3', phase: 'live', durationMs: T_Q, modules: ['highlights', 'chat', 'betting'], headline: 'Third quarter' },
    { id: 'q4', label: 'Q4', phase: 'live', durationMs: T_Q, modules: ['highlights', 'chat', 'betting', 'polls'], headline: 'Fourth quarter — clutch time' },
    { id: 'final', label: 'Final', phase: 'post', durationMs: 0, modules: ['highlights', 'leaderboard', 'store', 'ai-qa'], headline: 'Final buzzer — recap & rewards' },
  ],
  transitions: [],
  timeline: [
    { atMs: Q1, type: 'tipoff', title: 'Tip-off', detail: 'We are underway.' },
    { atMs: Q1 + 6 * MIN, type: 'dunk', title: 'SLAM DUNK!', detail: 'Throws it down — and one!', takeover: true, meta: { score: '14–10' } },
    { atMs: Q1 + T_Q + 4 * MIN, type: 'three', title: 'Three!', detail: 'From way downtown.', takeover: true, meta: { score: '31–28' } },
    { atMs: Q3 + 8 * MIN, type: 'dunk', title: 'Poster dunk!', detail: 'Right over the big man.', takeover: true, meta: { score: '78–74' } },
    { atMs: Q3 + T_Q + T_Q - 1 * MIN, type: 'buzzer-beater', title: 'BUZZER BEATER!', detail: 'Wins it at the death!', takeover: true, meta: { score: '101–99' } },
  ],
  clockLabel: (simMs, stateId) => {
    const qclock = (start: number, q: string) => {
      const left = Math.max(0, T_Q - ((simMs - start) % T_Q));
      const m = Math.floor(left / MIN);
      const s = String(Math.floor((left % MIN) / 1000)).padStart(2, '0');
      return `${q} ${m}:${s}`;
    };
    switch (stateId) {
      case 'inactive': return 'GAME DAY';
      case 'pre': return 'PRE-GAME';
      case 'q1': return qclock(Q1, 'Q1');
      case 'q2': return qclock(Q1 + T_Q, 'Q2');
      case 'halftime': return 'HALFTIME';
      case 'q3': return qclock(Q3, 'Q3');
      case 'q4': return qclock(Q3 + T_Q, 'Q4');
      default: return 'FINAL';
    }
  },
};

basketball.transitions = linearTransitions(basketball.states);
