// ═══════════════════════════════════════════════════════════
// SimClock — a fast-forwardable simulated clock. Drives the whole
// panel runtime: every tick advances "sim time", which the state
// machine and data adapter read to auto-advance with no human input.
// ═══════════════════════════════════════════════════════════

export type ClockListener = (simMs: number) => void;

export class SimClock {
  private rafId = 0;
  private lastReal = 0;
  private elapsed = 0;
  private running = false;
  /** sim-ms produced per real-ms. 60 => 1 real second = 1 sim minute. */
  private speed: number;
  private listeners = new Set<ClockListener>();

  constructor(speed = 60) {
    this.speed = speed;
  }

  get simMs() {
    return this.elapsed;
  }
  get isRunning() {
    return this.running;
  }
  get currentSpeed() {
    return this.speed;
  }

  setSpeed(speed: number) {
    this.speed = Math.max(0, speed);
  }

  subscribe(fn: ClockListener) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  /** Jump the clock to an absolute sim time and notify listeners. */
  seek(simMs: number) {
    this.elapsed = Math.max(0, simMs);
    this.emit();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastReal = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dReal = now - this.lastReal;
      this.lastReal = now;
      this.elapsed += dReal * this.speed;
      this.emit();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  reset() {
    this.elapsed = 0;
    this.emit();
  }

  dispose() {
    this.stop();
    this.listeners.clear();
  }

  private emit() {
    for (const fn of this.listeners) fn(this.elapsed);
  }
}
