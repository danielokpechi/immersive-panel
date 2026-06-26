// ═══════════════════════════════════════════════════════════
// Core domain model for the multi-sport Immersive Panel platform
// ═══════════════════════════════════════════════════════════

/** Event types the platform knows how to build a panel for. */
export type Sport =
  | 'football'
  | 'f1'
  | 'motogp'
  | 'ufc'
  | 'rugby'
  | 'basketball'
  | 'tennis'
  | 'cricket'
  | 'esports'
  | 'conference';

/** Delivery mode chosen on the "Choose your experience" screen. */
export type Experience = 'stream' | 'vod' | 'in-person';

/** The shared, reusable feature module library (one library across all sports). */
export type ModuleId =
  | 'chat'
  | 'ai-qa'
  | 'store'
  | 'highlights'
  | 'predictions'
  | 'polls'
  | 'leaderboard'
  | 'moderation'
  | 'betting';

/** A single state in a sport's state machine (e.g. "pre-match", "live"). */
export interface PanelState {
  id: string;
  label: string;
  /** Coarse phase grouping used for theming/nav: pre | live | break | post. */
  phase: 'idle' | 'pre' | 'live' | 'break' | 'post';
  /** Sim duration before the default time-transition fires (ms). 0 = terminal. */
  durationMs: number;
  /** Modules the sport suggests for this state (admin can override per panel). */
  modules: ModuleId[];
  /** Short banner describing what's happening "now". */
  headline: string;
}

/** What causes a transition between states. */
export type Trigger =
  | { type: 'time'; afterMs: number }
  | { type: 'event'; event: string };

export interface Transition {
  from: string;
  to: string;
  on: Trigger;
}

/** A scripted moment on the simulated timeline (drives in-state drama + modules). */
export interface TimelineEvent {
  /** Sim time from panel start, in ms. */
  atMs: number;
  /** e.g. 'goal' | 'var' | 'sub' | 'lap' | 'pit' | 'round-end' | 'ko' | 'talk'. */
  type: string;
  title: string;
  detail?: string;
  /** If true, the fan panel shows a full-screen takeover overlay for this event. */
  takeover?: boolean;
  meta?: Record<string, unknown>;
}

export interface SportTheme {
  primary: string;
  accent: string;
  surface: string;
  bg: string;
}

/** A fully data-driven definition of one sport / event type. */
export interface SportPack {
  id: Sport;
  name: string;
  tagline: string;
  emoji: string;
  initialState: string;
  states: PanelState[];
  transitions: Transition[];
  timeline: TimelineEvent[];
  theme: SportTheme;
  /** Modules enabled by default when a new panel of this sport is created. */
  defaultModules: ModuleId[];
  /** Renders the running clock label for a given sim time (sport-specific). */
  clockLabel: (simMs: number, stateId: string) => string;
}

/** Optional team/preset branding that overrides the sport pack's theme. */
export interface Branding {
  name?: string;
  emoji?: string;
  primary?: string;
  accent?: string;
}

/** A saved panel created in the admin Studio. */
export interface PanelConfig {
  id: string;
  name: string;
  sport: Sport;
  experience: Experience;
  description: string;
  enabledModules: ModuleId[];
  /** stateId -> modules to render in that state (defaults seeded from the sport pack). */
  moduleStateMap: Record<string, ModuleId[]>;
  /** optional team-preset branding (e.g. McLaren papaya). */
  branding?: Branding;
  status: 'draft' | 'deployed';
  createdAt: number;
  updatedAt: number;
}
