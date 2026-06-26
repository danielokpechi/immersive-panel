// ═══════════════════════════════════════════════════════════
// Conference / live event pack — proves the platform is NOT just for
// sport. inactive → doors → keynote → session → break → session →
// closing. Agenda items fire on the timeline; Q&A and networking
// modules shine here.
// ═══════════════════════════════════════════════════════════

import type { SportPack } from '../types/panel';
import { linearTransitions } from '../engine/stateMachine';

const MIN = 60_000;
const T_INACTIVE = 1 * MIN;
const T_DOORS = 3 * MIN;
const T_KEYNOTE = 20 * MIN;
const T_SESSION1 = 20 * MIN;
const T_BREAK = 10 * MIN;
const T_SESSION2 = 20 * MIN;
const KEY_START = T_INACTIVE + T_DOORS;

export const conference: SportPack = {
  id: 'conference',
  name: 'Conference',
  tagline: 'BoltOS Summit · Main Stage',
  emoji: '🎤',
  initialState: 'inactive',
  theme: {
    primary: '#7C5CFC',
    accent: '#34D6C4',
    surface: '#171528',
    bg: '#0F0E1C',
  },
  defaultModules: ['ai-qa', 'chat', 'polls', 'highlights', 'store', 'leaderboard', 'moderation'],
  states: [
    { id: 'inactive', label: 'Event Day', phase: 'idle', durationMs: T_INACTIVE, modules: ['highlights', 'store', 'leaderboard'], headline: 'Doors open shortly — grab your seat' },
    { id: 'doors', label: 'Doors Open', phase: 'pre', durationMs: T_DOORS, modules: ['chat', 'ai-qa', 'store'], headline: 'Welcome — agenda & venue map inside' },
    { id: 'keynote', label: 'Keynote', phase: 'live', durationMs: T_KEYNOTE, modules: ['ai-qa', 'polls', 'chat', 'highlights'], headline: 'Keynote live — ask questions in-app' },
    { id: 'session-1', label: 'Session', phase: 'live', durationMs: T_SESSION1, modules: ['ai-qa', 'polls', 'chat'], headline: 'Breakout session — live Q&A open' },
    { id: 'break', label: 'Networking Break', phase: 'break', durationMs: T_BREAK, modules: ['store', 'chat', 'leaderboard'], headline: 'Coffee & networking — find your people' },
    { id: 'session-2', label: 'Panel', phase: 'live', durationMs: T_SESSION2, modules: ['ai-qa', 'polls', 'chat', 'highlights'], headline: 'Closing panel — submit your questions' },
    { id: 'closing', label: 'Closing', phase: 'post', durationMs: 0, modules: ['highlights', 'ai-qa', 'store', 'leaderboard'], headline: 'That’s a wrap — recap, slides & rewards' },
  ],
  transitions: [],
  timeline: [
    { atMs: T_INACTIVE + 1 * MIN, type: 'doors-open', title: 'Doors are open', detail: 'Main stage seating now available.' },
    { atMs: KEY_START, type: 'talk', title: 'Keynote begins', detail: '“Event-driven experiences” — the BoltOS vision.', takeover: true },
    { atMs: KEY_START + 12 * MIN, type: 'demo', title: 'Live demo', detail: 'Panels reacting in real time on stage.', takeover: true },
    { atMs: KEY_START + T_KEYNOTE + 8 * MIN, type: 'qa', title: 'Top question upvoted', detail: '“How do panels handle real feeds?”' },
    { atMs: KEY_START + T_KEYNOTE + T_SESSION1 + T_BREAK + 6 * MIN, type: 'talk', title: 'Panel highlight', detail: 'Spicy take on the future of fan tech.' },
  ],
  clockLabel: (_simMs, stateId) => {
    switch (stateId) {
      case 'inactive': return 'EVENT DAY';
      case 'doors': return 'DOORS OPEN';
      case 'keynote': return 'KEYNOTE · LIVE';
      case 'session-1': return 'SESSION · LIVE';
      case 'break': return 'BREAK';
      case 'session-2': return 'PANEL · LIVE';
      case 'closing': return 'CLOSING';
      default: return '';
    }
  },
};

conference.transitions = linearTransitions(conference.states);
