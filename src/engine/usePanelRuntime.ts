// ═══════════════════════════════════════════════════════════
// usePanelRuntime — wires SimClock + MockAdapter + state machine for one
// PanelConfig. Runs autonomously by default (auto mode); a control bus +
// manual mode let an operator drive it live: advance states, fire events,
// set the countdown, and toggle modules on/off.
// ═══════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ModuleId, PanelConfig, PanelState, SportPack, TimelineEvent } from '../types/panel';
import type { RunMode, Command, Telemetry } from '../types/control';
import type { ControlBus } from '../control/bus';
import { SimClock } from './clock';
import { MockAdapter, type FiredEvent } from './dataAdapter';
import { getState, nextTransition } from './stateMachine';

const MAX_EVENTS = 40;

export interface PanelRuntime {
  stateId: string;
  state: PanelState;
  simMs: number;
  clockLabel: string;
  events: FiredEvent[]; // newest first
  overlay: FiredEvent | null;
  dismissOverlay: () => void;
  running: boolean;
  speed: number;
  mode: RunMode;
  countdownMs: number;
  enabledModules: ModuleId[];
  controls: {
    toggle: () => void;
    play: () => void;
    pause: () => void;
    setSpeed: (n: number) => void;
    jumpTo: (stateId: string) => void;
    advance: () => void;
    restart: () => void;
    setMode: (m: RunMode) => void;
    fireEvent: (ev: TimelineEvent) => void;
    setCountdown: (ms: number) => void;
    setModule: (id: ModuleId, on: boolean) => void;
  };
}

function stateStartMs(pack: SportPack, stateId: string): number {
  let acc = 0;
  for (const s of pack.states) {
    if (s.id === stateId) return acc;
    acc += s.durationMs;
  }
  return acc;
}

export function usePanelRuntime(
  pack: SportPack,
  config: PanelConfig,
  opts: { autostart?: boolean; speed?: number; mode?: RunMode; bus?: ControlBus | null } = {},
): PanelRuntime {
  const { autostart = true, speed = 60, mode: initialMode = 'auto', bus = null } = opts;

  const clock = useMemo(() => new SimClock(speed), [pack.id, config.id]);
  const adapter = useMemo(() => new MockAdapter(pack.timeline), [pack.id, config.id]);

  // the state the panel opens in: operator's configured default, else the pack's.
  const initialStateId =
    config.startState && pack.states.some((s) => s.id === config.startState)
      ? config.startState
      : pack.initialState;

  const [stateId, setStateId] = useState(initialStateId);
  const [simMs, setSimMs] = useState(0);
  const [events, setEvents] = useState<FiredEvent[]>([]);
  const [overlay, setOverlay] = useState<FiredEvent | null>(null);
  const [running, setRunning] = useState(autostart && initialMode === 'auto');
  const [speedState, setSpeedState] = useState(speed);
  const [mode, setModeState] = useState<RunMode>(initialMode);
  const [countdownMs, setCountdownMs] = useState(0);
  const [moduleOverrides, setModuleOverrides] = useState<Partial<Record<ModuleId, boolean>>>({});

  const stateRef = useRef(initialStateId);
  const stateEnteredRef = useRef(0);
  const firedSinceStateRef = useRef<Set<string>>(new Set());
  const manualSeqRef = useRef(1_000_000);
  const modeRef = useRef<RunMode>(initialMode);
  const lastTelemetryRef = useRef<Telemetry | null>(null);

  const enterState = useCallback((id: string, atMs: number) => {
    stateRef.current = id;
    stateEnteredRef.current = atMs;
    firedSinceStateRef.current = new Set();
    setStateId(id);
  }, []);

  // main tick loop (auto mode advances the machine from the clock)
  useEffect(() => {
    const unsub = clock.subscribe((ms) => {
      const fired = adapter.poll(ms);
      if (fired.length) {
        setEvents((prev) => [...fired.reverse(), ...prev].slice(0, MAX_EVENTS));
        for (const e of fired) firedSinceStateRef.current.add(e.type);
        const takeover = fired.find((e) => e.takeover);
        if (takeover) setOverlay(takeover);
      }
      if (modeRef.current === 'auto') {
        let guard = 0;
        while (guard++ < 64) {
          const tr = nextTransition(pack, stateRef.current, {
            stateElapsedMs: ms - stateEnteredRef.current,
            firedEventTypes: firedSinceStateRef.current,
          });
          if (!tr || tr.to === stateRef.current) break;
          if (tr.on.type === 'time') {
            stateRef.current = tr.to;
            stateEnteredRef.current = stateEnteredRef.current + tr.on.afterMs;
            firedSinceStateRef.current = new Set();
            setStateId(tr.to);
          } else {
            enterState(tr.to, ms);
          }
        }
      }
      setSimMs(ms);
    });
    return unsub;
  }, [clock, adapter, pack, enterState]);

  useEffect(() => {
    if (autostart && initialMode === 'auto') clock.start();
    return () => clock.dispose();
  }, [clock, autostart, initialMode]);

  // countdown ticker (1s) — purely cosmetic for the pre-match hero
  useEffect(() => {
    if (countdownMs <= 0) return;
    const t = setInterval(() => setCountdownMs((ms) => Math.max(0, ms - 1000)), 1000);
    return () => clearInterval(t);
  }, [countdownMs]);

  const dismissOverlay = useCallback(() => setOverlay(null), []);

  const controls = useMemo(() => {
    const jumpTo = (id: string) => {
      const start = stateStartMs(pack, id);
      adapter.reset();
      adapter.poll(start);
      setEvents([]);
      setOverlay(null);
      clock.seek(start);
      enterState(id, start);
      setSimMs(start);
    };
    const setMode = (m: RunMode) => {
      modeRef.current = m;
      setModeState(m);
      if (m === 'manual') {
        clock.stop();
        setRunning(false);
      } else {
        clock.start();
        setRunning(true);
      }
    };
    return {
      play: () => {
        clock.start();
        setRunning(true);
      },
      pause: () => {
        clock.stop();
        setRunning(false);
      },
      toggle: () => {
        if (clock.isRunning) {
          clock.stop();
          setRunning(false);
        } else {
          clock.start();
          setRunning(true);
        }
      },
      setSpeed: (n: number) => {
        clock.setSpeed(n);
        setSpeedState(n);
      },
      jumpTo,
      advance: () => {
        const idx = pack.states.findIndex((s) => s.id === stateRef.current);
        const next = pack.states[idx + 1];
        if (next) jumpTo(next.id);
      },
      restart: () => {
        adapter.reset();
        setEvents([]);
        setOverlay(null);
        clock.reset();
        enterState(initialStateId, 0);
        setSimMs(0);
      },
      setMode,
      fireEvent: (ev: TimelineEvent) => {
        const fe: FiredEvent = { ...ev, atMs: clock.simMs, seq: manualSeqRef.current++ };
        setEvents((prev) => [fe, ...prev].slice(0, MAX_EVENTS));
        firedSinceStateRef.current.add(ev.type);
        if (ev.takeover) setOverlay(fe);
        const tr = nextTransition(pack, stateRef.current, {
          stateElapsedMs: clock.simMs - stateEnteredRef.current,
          firedEventTypes: firedSinceStateRef.current,
        });
        if (tr && tr.on.type === 'event' && tr.to !== stateRef.current) {
          enterState(tr.to, clock.simMs);
        }
      },
      setCountdown: (ms: number) => setCountdownMs(Math.max(0, ms)),
      setModule: (id: ModuleId, on: boolean) =>
        setModuleOverrides((prev) => ({ ...prev, [id]: on })),
    };
  }, [clock, adapter, pack, enterState]);

  // ── control bus: apply commands, broadcast telemetry ──
  useEffect(() => {
    if (!bus) return;
    const apply = (cmd: Command) => {
      switch (cmd.type) {
        case 'setMode': controls.setMode(cmd.mode); break;
        case 'play': controls.play(); break;
        case 'pause': controls.pause(); break;
        case 'restart': controls.restart(); break;
        case 'setSpeed': controls.setSpeed(cmd.speed); break;
        case 'jumpState': controls.jumpTo(cmd.stateId); break;
        case 'advance': controls.advance(); break;
        case 'setCountdown': controls.setCountdown(cmd.ms); break;
        case 'fireEvent': controls.fireEvent(cmd.event); break;
        case 'setModule': controls.setModule(cmd.module, cmd.on); break;
        // A late joiner (or the console on mount) asks who's there — reply
        // with our current telemetry so controls/monitors reconcile.
        case 'requestState':
          if (lastTelemetryRef.current) bus.send(lastTelemetryRef.current);
          break;
        // Snap to the operator's authoritative state. The guard makes this a
        // no-op for the operator's own monitor (it's already in that state).
        case 'sync':
          if (cmd.stateId && cmd.stateId !== stateRef.current) controls.jumpTo(cmd.stateId);
          if (cmd.mode) controls.setMode(cmd.mode);
          if (cmd.modules) {
            for (const [m, on] of Object.entries(cmd.modules)) controls.setModule(m as ModuleId, on);
          }
          break;
      }
    };
    const off = bus.subscribe((msg) => {
      if (msg.type !== 'state' && msg.type !== 'chat') apply(msg as Command);
    });
    return off;
  }, [bus, controls]);

  const enabledModules = useMemo(
    () => config.enabledModules.filter((m) => moduleOverrides[m] !== false),
    [config.enabledModules, moduleOverrides],
  );

  const state = getState(pack, stateId) ?? pack.states[0];
  const clockLabel = pack.clockLabel(simMs, stateId);

  // broadcast telemetry on meaningful change
  useEffect(() => {
    const t: Telemetry = {
      type: 'state',
      stateId,
      stateLabel: state.label,
      phase: state.phase,
      clockLabel,
      simMs,
      running,
      mode,
      speed: speedState,
      enabledModules,
    };
    lastTelemetryRef.current = t;
    if (bus) bus.send(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bus, stateId, running, mode, speedState, enabledModules]);

  return {
    stateId,
    state,
    simMs,
    clockLabel,
    events,
    overlay,
    dismissOverlay,
    running,
    speed: speedState,
    mode,
    countdownMs,
    enabledModules,
    controls,
  };
}
