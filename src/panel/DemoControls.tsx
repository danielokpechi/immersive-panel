// ═══════════════════════════════════════════════════════════
// DemoControls — presenter aid. The panel runs autonomously by
// default; these let you pause, change sim speed, jump to a state, or
// restart for a clean run-through. Not part of the fan experience.
// ═══════════════════════════════════════════════════════════

import type { PanelRuntime } from '../engine/usePanelRuntime';
import type { SportPack } from '../types/panel';

const SPEEDS = [60, 120, 300, 600];

export function DemoControls({ runtime, pack }: { runtime: PanelRuntime; pack: SportPack }) {
  return (
    <div className="demo">
      <div className="demo__row">
        <button className="demo__btn" onClick={runtime.controls.toggle}>
          {runtime.running ? '❚❚ Pause' : '▶ Play'}
        </button>
        <button className="demo__btn" onClick={runtime.controls.restart}>
          ↺ Restart
        </button>
        <div className="demo__speeds">
          {SPEEDS.map((s) => (
            <button
              key={s}
              className={`demo__speed${runtime.speed === s ? ' is-on' : ''}`}
              onClick={() => runtime.controls.setSpeed(s)}
            >
              {s / 60}×
            </button>
          ))}
        </div>
      </div>
      <div className="demo__states">
        <span className="demo__label">Jump to state:</span>
        {pack.states.map((s) => (
          <button
            key={s.id}
            className={`demo__state${runtime.stateId === s.id ? ' is-on' : ''}`}
            onClick={() => runtime.controls.jumpTo(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
