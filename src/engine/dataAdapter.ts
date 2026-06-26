// ═══════════════════════════════════════════════════════════
// DataAdapter — the single seam between the panel runtime and a
// source of live events. Round 1 ships MockAdapter (replays a
// scripted timeline against the SimClock). A real sports-data feed
// implements the same interface later; nothing else changes.
// ═══════════════════════════════════════════════════════════

import type { TimelineEvent } from '../types/panel';

export interface FiredEvent extends TimelineEvent {
  /** Monotonic id so consumers can dedupe / key React lists. */
  seq: number;
}

export interface DataAdapter {
  /** Called by the runtime every tick. Returns events whose time has arrived. */
  poll(simMs: number): FiredEvent[];
  reset(): void;
}

/** Replays a fixed, time-stamped timeline as the sim clock advances. */
export class MockAdapter implements DataAdapter {
  private nextIdx = 0;
  private seq = 0;
  private timeline: TimelineEvent[];

  constructor(timeline: TimelineEvent[]) {
    // defensive copy, sorted by time
    this.timeline = [...timeline].sort((a, b) => a.atMs - b.atMs);
  }

  poll(simMs: number): FiredEvent[] {
    const out: FiredEvent[] = [];
    while (
      this.nextIdx < this.timeline.length &&
      this.timeline[this.nextIdx].atMs <= simMs
    ) {
      out.push({ ...this.timeline[this.nextIdx], seq: this.seq++ });
      this.nextIdx++;
    }
    return out;
  }

  reset() {
    this.nextIdx = 0;
    this.seq = 0;
  }
}
