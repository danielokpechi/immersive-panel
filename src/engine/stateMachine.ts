// ═══════════════════════════════════════════════════════════
// Generic, pure state-machine evaluation. Given a sport pack, the
// current state, how long we've been in it, and which event types
// have fired, decide the next state — or null to stay put.
//
// Event transitions win over time transitions (a fight finish should
// jump straight to the result even if the round timer hasn't elapsed).
// ═══════════════════════════════════════════════════════════

import type { SportPack, PanelState, Transition } from '../types/panel';

export interface TransitionContext {
  stateElapsedMs: number;
  firedEventTypes: Set<string>;
}

export function getState(pack: SportPack, id: string): PanelState | undefined {
  return pack.states.find((s) => s.id === id);
}

/** Like nextStateId, but returns the whole transition (so callers can consume its duration). */
export function nextTransition(
  pack: SportPack,
  currentId: string,
  ctx: TransitionContext,
): Transition | null {
  const outgoing = pack.transitions.filter((t) => t.from === currentId);
  for (const t of outgoing) {
    if (t.on.type === 'event' && ctx.firedEventTypes.has(t.on.event)) return t;
  }
  for (const t of outgoing) {
    if (t.on.type === 'time' && ctx.stateElapsedMs >= t.on.afterMs) return t;
  }
  return null;
}

export function nextStateId(
  pack: SportPack,
  currentId: string,
  ctx: TransitionContext,
): string | null {
  const outgoing = pack.transitions.filter((t) => t.from === currentId);

  // 1) event-driven transitions take priority
  for (const t of outgoing) {
    if (t.on.type === 'event' && ctx.firedEventTypes.has(t.on.event)) {
      return t.to;
    }
  }
  // 2) time-driven transitions
  for (const t of outgoing) {
    if (t.on.type === 'time' && ctx.stateElapsedMs >= t.on.afterMs) {
      return t.to;
    }
  }
  return null;
}

/**
 * Build linear time transitions from each state's `durationMs`, for the
 * common "states flow one into the next" case. Packs may add explicit
 * event transitions on top of (or instead of) these.
 */
export function linearTransitions(states: PanelState[]) {
  const out = [];
  for (let i = 0; i < states.length - 1; i++) {
    const s = states[i];
    if (s.durationMs > 0) {
      out.push({
        from: s.id,
        to: states[i + 1].id,
        on: { type: 'time' as const, afterMs: s.durationMs },
      });
    }
  }
  return out;
}
