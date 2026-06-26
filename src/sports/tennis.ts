// Tennis sport pack — best-of-three sets. Score hero (games).

import type { SportPack } from '../types/panel';
import { linearTransitions } from '../engine/stateMachine';

const MIN = 60_000;
const T_INACTIVE = 1 * MIN;
const T_WARM = 3 * MIN;
const T_SET = 16 * MIN;
const S1 = T_INACTIVE + T_WARM;

export const tennis: SportPack = {
  id: 'tennis',
  name: 'Tennis',
  tagline: 'Centre Court · Grand Slam',
  emoji: '🎾',
  initialState: 'inactive',
  theme: { primary: '#5BBA3A', accent: '#D7F25B', surface: '#10210F', bg: '#0A160A' },
  defaultModules: ['highlights', 'chat', 'ai-qa', 'predictions', 'polls', 'leaderboard', 'betting'],
  states: [
    { id: 'inactive', label: 'Match Day', phase: 'idle', durationMs: T_INACTIVE, modules: ['highlights', 'store', 'leaderboard'], headline: 'Players to the court soon' },
    { id: 'warmup', label: 'Warm-Up', phase: 'pre', durationMs: T_WARM, modules: ['predictions', 'ai-qa', 'chat'], headline: 'Knock-up — predict the winner' },
    { id: 'set-1', label: 'Set 1', phase: 'live', durationMs: T_SET, modules: ['highlights', 'chat', 'betting'], headline: 'First set underway' },
    { id: 'set-2', label: 'Set 2', phase: 'live', durationMs: T_SET, modules: ['highlights', 'chat', 'betting'], headline: 'Second set' },
    { id: 'set-3', label: 'Set 3', phase: 'live', durationMs: T_SET, modules: ['highlights', 'chat', 'betting', 'polls'], headline: 'Deciding set' },
    { id: 'done', label: 'Match Over', phase: 'post', durationMs: 0, modules: ['highlights', 'leaderboard', 'store', 'ai-qa'], headline: 'Game, set, match — recap & rewards' },
  ],
  transitions: [],
  timeline: [
    { atMs: S1 + 2 * MIN, type: 'ace', title: 'ACE!', detail: 'Out wide, unreturnable.', takeover: true },
    { atMs: S1 + 9 * MIN, type: 'break', title: 'Break of serve', detail: 'Crucial break to lead the set.', takeover: true, meta: { score: '6–4' } },
    { atMs: S1 + T_SET + 7 * MIN, type: 'set', title: 'Set point saved', detail: 'Huge serve under pressure.' },
    { atMs: S1 + 2 * T_SET + 10 * MIN, type: 'match', title: 'MATCH POINT', detail: 'Serving for the championship.', takeover: true, meta: { score: '6–4 3–6 6–4' } },
  ],
  clockLabel: (_simMs, stateId) => {
    switch (stateId) {
      case 'inactive': return 'MATCH DAY';
      case 'warmup': return 'WARM-UP';
      case 'set-1': return 'SET 1';
      case 'set-2': return 'SET 2';
      case 'set-3': return 'SET 3';
      default: return 'MATCH OVER';
    }
  },
};

tennis.transitions = linearTransitions(tennis.states);
