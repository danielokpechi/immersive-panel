// ═══════════════════════════════════════════════════════════
// Rugby sport pack — two 40-minute halves. inactive → pre → first
// half → halftime → second half → full time. Tries, conversions and
// penalties fire on the timeline.
// ═══════════════════════════════════════════════════════════

import type { SportPack } from '../types/panel';
import { linearTransitions } from '../engine/stateMachine';

const MIN = 60_000;
const T_INACTIVE = 1 * MIN;
const T_PRE = 4 * MIN;
const T_HALF1 = 40 * MIN;
const T_BREAK = 5 * MIN;
const T_HALF2 = 40 * MIN;
const H1_START = T_INACTIVE + T_PRE;
const H2_START = H1_START + T_HALF1 + T_BREAK;

export const rugby: SportPack = {
  id: 'rugby',
  name: 'Rugby',
  tagline: 'National Side · Autumn International',
  emoji: '🏉',
  initialState: 'inactive',
  theme: {
    primary: '#1E8E5A',
    accent: '#EAD27A',
    surface: '#10241B',
    bg: '#0A1812',
  },
  defaultModules: ['highlights', 'chat', 'ai-qa', 'predictions', 'polls', 'leaderboard', 'store'],
  states: [
    { id: 'inactive', label: 'Match Day', phase: 'idle', durationMs: T_INACTIVE, modules: ['highlights', 'store', 'leaderboard'], headline: 'Anthems approaching' },
    { id: 'pre', label: 'Pre-Match', phase: 'pre', durationMs: T_PRE, modules: ['predictions', 'ai-qa', 'chat', 'store'], headline: 'Team sheets in — predict the first try' },
    { id: 'first-half', label: 'First Half', phase: 'live', durationMs: T_HALF1, modules: ['highlights', 'chat', 'predictions'], headline: 'Live — first half' },
    { id: 'halftime', label: 'Half Time', phase: 'break', durationMs: T_BREAK, modules: ['store', 'polls', 'ai-qa', 'chat'], headline: 'Half time — grab a pint, beat the queue' },
    { id: 'second-half', label: 'Second Half', phase: 'live', durationMs: T_HALF2, modules: ['highlights', 'chat', 'predictions'], headline: 'Live — second half' },
    { id: 'full-time', label: 'Full Time', phase: 'post', durationMs: 0, modules: ['highlights', 'leaderboard', 'store', 'ai-qa'], headline: 'Full time — recap & rewards' },
  ],
  transitions: [],
  timeline: [
    { atMs: H1_START, type: 'kickoff', title: 'Kick off', detail: 'High ball, chase is on.', takeover: true },
    { atMs: H1_START + 14 * MIN, type: 'try', title: 'TRY!', detail: 'Driven over from the maul. 5–0.', takeover: true, meta: { score: '5–0' } },
    { atMs: H1_START + 15 * MIN, type: 'conversion', title: 'Conversion good', detail: 'Off the tee — 7–0.' },
    { atMs: H1_START + 28 * MIN, type: 'penalty', title: 'Penalty kicked', detail: 'Three points — 7–3.' },
    { atMs: H1_START + T_HALF1, type: 'half-time', title: 'Half-time whistle', detail: '7–3 at the break.' },
    { atMs: H2_START + 22 * MIN, type: 'try', title: 'TRY — counter attack', detail: 'Length of the field! 14–3.', takeover: true, meta: { score: '14–3' } },
    { atMs: H2_START + T_HALF2, type: 'full-time', title: 'Full time', detail: '14–3 — job done.' },
  ],
  clockLabel: (simMs, stateId) => {
    switch (stateId) {
      case 'inactive': return 'MATCH DAY';
      case 'pre': return 'PRE-MATCH';
      case 'first-half': {
        const m = Math.min(40, Math.max(1, Math.floor((simMs - H1_START) / MIN) + 1));
        return `${m}'`;
      }
      case 'halftime': return 'HALF TIME';
      case 'second-half': {
        const m = Math.min(80, Math.max(41, 41 + Math.floor((simMs - H2_START) / MIN)));
        return `${m}'`;
      }
      case 'full-time': return 'FULL TIME';
      default: return '';
    }
  },
};

rugby.transitions = linearTransitions(rugby.states);
