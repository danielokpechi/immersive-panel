// ═══════════════════════════════════════════════════════════
// Takeover overlay — reproduces the original prototype's slide-up
// scorer / VAR card: a dark sheet rising from the bottom with the
// moment, key meta chips, and an IRIS analysis block.
// ═══════════════════════════════════════════════════════════

import { useEffect } from 'react';
import type { PanelRuntime } from '../engine/usePanelRuntime';
import type { SportPack } from '../types/panel';

export function Overlay({ runtime, pack }: { runtime: PanelRuntime; pack: SportPack }) {
  const ev = runtime.overlay;

  useEffect(() => {
    if (!ev) return;
    const t = setTimeout(() => runtime.dismissOverlay(), 5200);
    return () => clearTimeout(t);
  }, [ev, runtime]);

  if (!ev) return null;

  return (
    <div className="ovl" onClick={runtime.dismissOverlay}>
      <div className="ovl__scrim" />
      <div className="ovl__sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ovl__handle" />
        <div className="ovl__id">
          <div className="ovl__avatar">{pack.emoji}</div>
          <div>
            <div className="ovl__title">{ev.title}</div>
            {ev.detail && <div className="ovl__detail">{ev.detail}</div>}
          </div>
        </div>

        {ev.meta && (
          <div className="ovl__chips">
            {Object.entries(ev.meta).map(([k, v]) => (
              <span className="ovl__chip" key={k}>
                {String(v)}
              </span>
            ))}
          </div>
        )}

        <div className="ovl__iris">
          <div className="ovl__iristag">IRIS · Analysis</div>
          <div className="ovl__iristext">{ev.detail ?? 'IRIS is reading the moment for you.'}</div>
        </div>

        <button className="ovl__cta" onClick={runtime.dismissOverlay}>
          Back to panel
        </button>
      </div>
    </div>
  );
}
