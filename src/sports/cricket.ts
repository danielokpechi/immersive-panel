// Cricket sport pack — two innings (T20-ish). Score hero (runs/wkts).

import type { SportPack } from '../types/panel';
import { linearTransitions } from '../engine/stateMachine';

const MIN = 60_000;
const T_INACTIVE = 1 * MIN;
const T_PRE = 4 * MIN;
const T_INN = 30 * MIN;
const T_BREAK = 6 * MIN;
const I1 = T_INACTIVE + T_PRE;
const I2 = I1 + T_INN + T_BREAK;
const OVERS = 20;

export const cricket: SportPack = {
  id: 'cricket',
  name: 'Cricket',
  tagline: 'City Strikers vs Coastal Kings · T20',
  emoji: '🏏',
  initialState: 'inactive',
  theme: { primary: '#1FA0A0', accent: '#F2C14E', surface: '#0E2020', bg: '#091616' },
  defaultModules: ['highlights', 'chat', 'ai-qa', 'predictions', 'polls', 'leaderboard', 'betting', 'store'],
  states: [
    { id: 'inactive', label: 'Match Day', phase: 'idle', durationMs: T_INACTIVE, modules: ['highlights', 'store', 'leaderboard'], headline: 'Toss done — play soon' },
    { id: 'pre', label: 'Pre-Match', phase: 'pre', durationMs: T_PRE, modules: ['predictions', 'ai-qa', 'chat'], headline: 'Line-ups in — predict the total' },
    { id: 'innings-1', label: '1st Innings', phase: 'live', durationMs: T_INN, modules: ['highlights', 'chat', 'betting', 'predictions'], headline: 'First innings underway' },
    { id: 'innings-break', label: 'Innings Break', phase: 'break', durationMs: T_BREAK, modules: ['store', 'polls', 'ai-qa', 'chat'], headline: 'Innings break — beat the queue' },
    { id: 'innings-2', label: '2nd Innings', phase: 'live', durationMs: T_INN, modules: ['highlights', 'chat', 'betting', 'predictions'], headline: 'The chase is on' },
    { id: 'result', label: 'Result', phase: 'post', durationMs: 0, modules: ['highlights', 'leaderboard', 'store', 'ai-qa'], headline: 'Match done — recap & rewards' },
  ],
  transitions: [],
  timeline: [
    { atMs: I1 + 6 * MIN, type: 'four', title: 'FOUR!', detail: 'Driven to the cover boundary.', meta: { score: '48/1' } },
    { atMs: I1 + 14 * MIN, type: 'six', title: 'SIX!', detail: 'Into the stands over long-on!', takeover: true, meta: { score: '96/2' } },
    { atMs: I1 + 22 * MIN, type: 'wicket', title: 'WICKET!', detail: 'Bowled him — big breakthrough.', takeover: true, meta: { score: '142/4' } },
    { atMs: I2 + 12 * MIN, type: 'six', title: 'SIX to win it?', detail: 'Huge over long-off!', takeover: true, meta: { score: '150/5' } },
    { atMs: I2 + 24 * MIN, type: 'wicket', title: 'WICKET — last over!', detail: 'It goes to the wire.', takeover: true },
  ],
  clockLabel: (simMs, stateId) => {
    const overs = (start: number) => {
      const frac = Math.min(1, Math.max(0, (simMs - start) / T_INN));
      const balls = Math.floor(frac * OVERS * 6);
      return `${Math.floor(balls / 6)}.${balls % 6} OV`;
    };
    switch (stateId) {
      case 'inactive': return 'MATCH DAY';
      case 'pre': return 'PRE-MATCH';
      case 'innings-1': return overs(I1);
      case 'innings-break': return 'INNINGS BREAK';
      case 'innings-2': return overs(I2);
      default: return 'RESULT';
    }
  },
};

cricket.transitions = linearTransitions(cricket.states);
