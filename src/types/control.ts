// ═══════════════════════════════════════════════════════════
// Control-room message contract. The console sends Commands; each panel
// is the source of truth and echoes Telemetry. Same-browser transport
// today (BroadcastChannel); the same shape works over a backend later.
// ═══════════════════════════════════════════════════════════

import type { ModuleId, TimelineEvent } from './panel';

export type RunMode = 'auto' | 'manual';

/** Console → panel. */
export type Command =
  | { type: 'setMode'; mode: RunMode }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'restart' }
  | { type: 'setSpeed'; speed: number }
  | { type: 'jumpState'; stateId: string }
  | { type: 'advance' }
  | { type: 'setCountdown'; ms: number }
  | { type: 'fireEvent'; event: TimelineEvent }
  | { type: 'setModule'; module: ModuleId; on: boolean }
  | { type: 'requestState' }
  // Late-join: the operator answers a requestState with the authoritative
  // current state so a freshly-joined panel snaps to it.
  | { type: 'sync'; stateId: string; mode?: RunMode; modules?: Record<string, boolean> };

/** Panel → console. */
export interface Telemetry {
  type: 'state';
  stateId: string;
  stateLabel: string;
  phase: string;
  clockLabel: string;
  simMs: number;
  running: boolean;
  mode: RunMode;
  speed: number;
  enabledModules: ModuleId[];
}

export type BusMessage = Command | Telemetry;
