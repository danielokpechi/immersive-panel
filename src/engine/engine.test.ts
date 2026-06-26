// Headless proof that panels advance their state machine on their own.
// Drives the pure engine (no React) against each sport's mock timeline.

import { describe, it, expect } from 'vitest';
import { MockAdapter } from './dataAdapter';
import { nextStateId } from './stateMachine';
import type { SportPack } from '../types/panel';
import { football } from '../sports/football';
import { ufc } from '../sports/ufc';
import { SPORT_LIST } from '../sports/registry';

/** Replay a pack forward in sim time and record the states it passes through. */
function runToCompletion(pack: SportPack, stepMs = 5_000, maxMs = 200 * 60_000) {
  const adapter = new MockAdapter(pack.timeline);
  let stateId = pack.initialState;
  let enteredAt = 0;
  const firedSinceState = new Set<string>();
  const visited = [stateId];

  for (let t = 0; t <= maxMs; t += stepMs) {
    for (const e of adapter.poll(t)) firedSinceState.add(e.type);
    let guard = 0;
    while (guard++ < 12) {
      const target = nextStateId(pack, stateId, {
        stateElapsedMs: t - enteredAt,
        firedEventTypes: firedSinceState,
      });
      if (!target || target === stateId) break;
      stateId = target;
      enteredAt = t;
      firedSinceState.clear();
      visited.push(stateId);
    }
  }
  return visited;
}

describe('autonomous state machine', () => {
  it('football advances through the full matchday with no input', () => {
    const visited = runToCompletion(football);
    expect(visited).toEqual([
      'inactive',
      'pre-match',
      'live-1',
      'halftime',
      'live-2',
      'post-match',
    ]);
  });

  it('UFC ends early via the event-driven KO transition (skips round 3)', () => {
    const visited = runToCompletion(ufc);
    expect(visited).toContain('round-2');
    expect(visited).toContain('result');
    expect(visited).not.toContain('round-3'); // KO in R2 jumps straight to result
    expect(visited[visited.length - 1]).toBe('result');
  });

  it('every sport reaches a terminal (post) state on its own', () => {
    for (const pack of SPORT_LIST) {
      const visited = runToCompletion(pack);
      const last = pack.states.find((s) => s.id === visited[visited.length - 1]);
      expect(last?.phase, `${pack.id} ended in ${last?.id}`).toBe('post');
    }
  });
});
