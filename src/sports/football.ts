// ═══════════════════════════════════════════════════════════
// Football sport pack — the reference experience (Man City vs Real
// Madrid). Drives itself: inactive → pre-match → live → halftime →
// live → full-time, with goals, VAR and subs firing on the timeline.
// ═══════════════════════════════════════════════════════════

import type { SportPack } from '../types/panel';
import { linearTransitions } from '../engine/stateMachine';

const MIN = 60_000; // one sim minute in ms

// state durations (sim ms)
const T_INACTIVE = 1 * MIN;
const T_PRE = 5 * MIN;
const T_HALF1 = 45 * MIN;
const T_BREAK = 5 * MIN;
const T_HALF2 = 45 * MIN;

const LIVE1_START = T_INACTIVE + T_PRE; // 6'
const LIVE2_START = LIVE1_START + T_HALF1 + T_BREAK;

export const football: SportPack = {
  id: 'football',
  name: 'Football',
  tagline: 'Man City vs Real Madrid · Champions League',
  emoji: '⚽',
  initialState: 'inactive',
  theme: {
    primary: '#6CABDD',
    accent: '#C9A84C',
    surface: '#0D1F35',
    bg: '#0A1628',
  },
  defaultModules: [
    'highlights',
    'chat',
    'ai-qa',
    'predictions',
    'polls',
    'store',
    'leaderboard',
    'betting',
    'moderation',
  ],
  states: [
    {
      id: 'inactive',
      label: 'Pre-Match',
      phase: 'idle',
      durationMs: T_INACTIVE,
      modules: ['highlights', 'store', 'leaderboard'],
      headline: 'Matchday hub — preview, articles and the build-up',
    },
    {
      id: 'pre-match',
      label: 'Matchday',
      phase: 'pre',
      durationMs: T_PRE,
      modules: ['predictions', 'ai-qa', 'chat', 'store'],
      headline: 'Team news is in. Predict the first scorer.',
    },
    {
      id: 'live-1',
      label: 'First Half',
      phase: 'live',
      durationMs: T_HALF1,
      modules: ['highlights', 'chat', 'predictions', 'betting'],
      headline: 'Live — reacting to every touch',
    },
    {
      id: 'halftime',
      label: 'Half Time',
      phase: 'break',
      durationMs: T_BREAK,
      modules: ['store', 'polls', 'ai-qa', 'chat'],
      headline: '15 minutes — beat the queue, order ahead',
    },
    {
      id: 'live-2',
      label: 'Second Half',
      phase: 'live',
      durationMs: T_HALF2,
      modules: ['highlights', 'chat', 'predictions', 'betting'],
      headline: 'Live — second half underway',
    },
    {
      id: 'post-match',
      label: 'Full Time',
      phase: 'post',
      durationMs: 0,
      modules: ['highlights', 'leaderboard', 'store', 'ai-qa'],
      headline: 'Full time — your matchday recap & rewards',
    },
  ],
  transitions: [], // filled below from durations
  timeline: [
    { atMs: 2 * MIN, type: 'lineup', title: 'Starting XI confirmed', detail: 'Haaland leads the line; Rodri returns to midfield.' },
    { atMs: LIVE1_START, type: 'kickoff', title: 'Kick off!', detail: 'We are underway at the Etihad.' },
    {
      atMs: LIVE1_START + 12 * MIN,
      type: 'goal',
      title: 'GOAL — Haaland 12’',
      detail: 'Tap-in from six yards. City lead 1–0.',
      takeover: true,
      meta: { scorer: 'Erling Haaland', score: '1–0' },
    },
    {
      atMs: LIVE1_START + 31 * MIN,
      type: 'var',
      title: 'VAR Check — possible handball',
      detail: 'Real Madrid appeal. Contact on Rúben Dias inside the box.',
      takeover: true,
      meta: { verdict: 'No penalty (78%)' },
    },
    { atMs: LIVE1_START + 38 * MIN, type: 'chance', title: 'Big chance — Vinícius', detail: 'Ederson saves low to his right.' },
    { atMs: LIVE1_START + T_HALF1, type: 'half-time', title: 'Half-time whistle', detail: 'City 1–0 Real Madrid.' },
    {
      atMs: LIVE2_START + 15 * MIN,
      type: 'sub',
      title: 'Substitution — 60’',
      detail: 'Foden replaces Bernardo Silva.',
      takeover: true,
      meta: { on: 'Phil Foden', off: 'Bernardo Silva' },
    },
    {
      atMs: LIVE2_START + 33 * MIN,
      type: 'goal',
      title: 'GOAL — Foden 78’',
      detail: 'Curled into the top corner. City 2–0.',
      takeover: true,
      meta: { scorer: 'Phil Foden', score: '2–0' },
    },
    { atMs: LIVE2_START + T_HALF2, type: 'full-time', title: 'Full time', detail: 'Manchester City 2–0 Real Madrid.' },
  ],
  clockLabel: (simMs, stateId) => {
    switch (stateId) {
      case 'inactive':
        return 'PRE-MATCH';
      case 'pre-match':
        return 'MATCHDAY';
      case 'live-1': {
        const m = Math.min(45, Math.max(1, Math.floor((simMs - LIVE1_START) / MIN) + 1));
        return `${m}'`;
      }
      case 'halftime':
        return 'HALF TIME';
      case 'live-2': {
        const m = Math.min(90, Math.max(46, 46 + Math.floor((simMs - LIVE2_START) / MIN)));
        return `${m}'`;
      }
      case 'post-match':
        return 'FULL TIME';
      default:
        return '';
    }
  },
};

football.transitions = linearTransitions(football.states);
