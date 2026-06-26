// ═══════════════════════════════════════════════════════════
// MasterControls — the operator's panel. Sends Commands on the
// ControlBus; reflects the panel's live Telemetry. Drives every sport
// (engine + football) identically.
// ═══════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import type { ModuleId, PanelConfig, SportPack } from '../types/panel';
import type { Command, Telemetry } from '../types/control';
import type { ControlBus } from './bus';
import { MODULE_META } from '../theme/tokens';
import { TRIGGERS } from './triggers';

const SPEEDS = [60, 120, 300, 600];

export function MasterControls({
  bus,
  pack,
  config,
  telemetry,
  onPopOut,
}: {
  bus: ControlBus;
  pack: SportPack;
  config: PanelConfig;
  telemetry: Telemetry | null;
  onPopOut: () => void;
}) {
  const send = (cmd: Command) => bus.send(cmd);
  const mode = telemetry?.mode ?? 'auto';
  const running = telemetry?.running ?? true;
  const speed = telemetry?.speed ?? 60;

  // local view of module on/off (seeded from config, reconciled with telemetry)
  const [mods, setMods] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(config.enabledModules.map((m) => [m, true])),
  );
  useEffect(() => {
    if (telemetry?.enabledModules) {
      setMods(Object.fromEntries(config.enabledModules.map((m) => [m, telemetry.enabledModules.includes(m)])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telemetry?.enabledModules]);

  const toggleMod = (m: ModuleId) => {
    const on = !mods[m];
    setMods((p) => ({ ...p, [m]: on }));
    send({ type: 'setModule', module: m, on });
  };

  return (
    <aside className="mc">
      <div className="mc__livehead">
        <span className={`mc__livedot${telemetry?.phase === 'live' ? ' on' : ''}`} />
        <div>
          <div className="mc__state">{telemetry?.stateLabel ?? '—'}</div>
          <div className="mc__clock">{telemetry?.clockLabel ?? ''}</div>
        </div>
        <button className="btn btn--sm" onClick={onPopOut}>
          ↗ Pop out
        </button>
      </div>

      {/* MODE */}
      <Section title="Mode">
        <div className="mc__seg">
          <button className={mode === 'auto' ? 'is-on' : ''} onClick={() => send({ type: 'setMode', mode: 'auto' })}>
            Auto
          </button>
          <button className={mode === 'manual' ? 'is-on' : ''} onClick={() => send({ type: 'setMode', mode: 'manual' })}>
            Manual
          </button>
        </div>
        <div className="mc__row">
          <button className="mc__btn" onClick={() => send({ type: running ? 'pause' : 'play' })}>
            {running ? '❚❚ Pause' : '▶ Play'}
          </button>
          <button className="mc__btn" onClick={() => send({ type: 'restart' })}>
            ↺ Restart
          </button>
          <div className="mc__speeds">
            {SPEEDS.map((s) => (
              <button key={s} className={speed === s ? 'is-on' : ''} onClick={() => send({ type: 'setSpeed', speed: s })}>
                {s / 60}×
              </button>
            ))}
          </div>
        </div>
        {mode === 'manual' && <div className="mc__hint">Manual — you drive the state & events below.</div>}
      </Section>

      {/* STATE */}
      <Section title="Match state">
        <div className="mc__states">
          {pack.states.map((s) => (
            <button
              key={s.id}
              className={`mc__statebtn${telemetry?.stateId === s.id ? ' is-on' : ''}`}
              onClick={() => send({ type: 'jumpState', stateId: s.id })}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button className="mc__advance" onClick={() => send({ type: 'advance' })}>
          Advance to next state →
        </button>
      </Section>

      {/* COUNTDOWN */}
      <Section title="Kickoff countdown">
        <div className="mc__cd">
          {[
            ['0:30', 30_000],
            ['2:00', 120_000],
            ['5:00', 300_000],
            ['15:00', 900_000],
          ].map(([label, ms]) => (
            <button key={label as string} onClick={() => send({ type: 'setCountdown', ms: ms as number })}>
              {label}
            </button>
          ))}
          <button className="mc__cdclear" onClick={() => send({ type: 'setCountdown', ms: 0 })}>
            Clear
          </button>
        </div>
      </Section>

      {/* TRIGGERS */}
      <Section title="Trigger event">
        <div className="mc__triggers">
          {(TRIGGERS[pack.id] ?? []).map((t) => (
            <button key={t.label} className="mc__trigger" onClick={() => send({ type: 'fireEvent', event: t.event })}>
              <span>{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </Section>

      {/* MODULES */}
      <Section title="Modules (live on/off)">
        <div className="mc__mods">
          {config.enabledModules.map((m) => (
            <button key={m} className={`mc__mod${mods[m] ? ' is-on' : ''}`} onClick={() => toggleMod(m)}>
              <span className="mc__modemoji">{MODULE_META[m].emoji}</span>
              <span className="mc__modlabel">{MODULE_META[m].label}</span>
              <span className="mc__modsw" />
            </button>
          ))}
        </div>
      </Section>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mc__section">
      <div className="mc__title">{title}</div>
      {children}
    </section>
  );
}
