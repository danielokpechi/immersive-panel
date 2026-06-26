// ═══════════════════════════════════════════════════════════
// ControlConsole — route /control/:id. The operator's cockpit: a live
// MONITOR of what fans see, the master controls that drive it, and the
// deploy/share card. The monitor runs the real panel on the shared
// ControlBus, so every control acts on it instantly AND broadcasts to
// every connected fan device (Ably cross-device when configured).
//
// The monitor starts in MANUAL mode — it sits still until the operator
// drives it (pre-match → live → halftime → full-time), rather than
// auto-advancing on its own. This is separate from the deployable fan
// panel (#/p/:id), which remains its own shareable screen.
// ═══════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPanel } from '../studio/store';
import { getSport } from '../sports/registry';
import { usePanelRuntime } from '../engine/usePanelRuntime';
import { applySportTheme } from '../theme/tokens';
import { legacyUrl } from '../config';
import { PanelShell } from '../panel/PanelShell';
import { ControlBus, type ConnState } from './bus';
import type { Telemetry } from '../types/control';
import type { PanelConfig } from '../types/panel';
import { MasterControls } from './MasterControls';
import { DeployShare } from './DeployShare';
import { shareUrl } from '../studio/share';

export function ControlConsole() {
  const { id = '' } = useParams();
  // Memoize so config keeps a stable reference across renders — getPanel
  // re-parses localStorage and would otherwise hand the runtime a fresh
  // enabledModules array every render, re-firing its telemetry effect.
  const config = useMemo(() => getPanel(id), [id]);

  if (!config) {
    return (
      <div className="page-missing">
        <h2>Panel not found</h2>
        <Link className="btn" to="/studio">
          ← Back to Studio
        </Link>
      </div>
    );
  }

  const pack = getSport(config.sport);
  const bus = useMemo(() => new ControlBus(id), [id]);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [conn, setConn] = useState<ConnState>(bus.connectionState);
  const telemetryRef = useRef<Telemetry | null>(null);

  useEffect(() => {
    const offMsg = bus.subscribe((msg) => {
      if (msg.type === 'state') {
        setTelemetry(msg);
        telemetryRef.current = msg;
      } else if (msg.type === 'requestState') {
        // A panel just joined — tell it the authoritative current state so it
        // snaps to it instead of sitting at its default (late-join sync).
        const t = telemetryRef.current;
        if (t) {
          const modules: Record<string, boolean> = {};
          for (const m of config.enabledModules) modules[m] = t.enabledModules.includes(m);
          bus.send({ type: 'sync', stateId: t.stateId, mode: t.mode, modules });
        }
      }
    });
    const offConn = bus.onConnection(setConn);
    // Ask our own monitor to report state so the controls reconcile on mount.
    bus.send({ type: 'requestState' });
    return () => {
      offMsg();
      offConn();
      bus.dispose();
    };
  }, [bus, config.enabledModules]);

  const openFanView = () => {
    window.open(shareUrl(config), `panel_${id}`, 'width=430,height=900');
  };

  return (
    <div className="console">
      <div className="console__bar">
        <Link className="btn btn--ghost" to="/studio">
          ← Studio
        </Link>
        <div className="console__title">
          🎛 Control Room · {config.branding?.emoji ?? pack.emoji} {config.name}
        </div>
        <button className="btn btn--sm" onClick={openFanView}>
          ↗ Open fan view
        </button>
      </div>

      <div className="console__main">
        <DeployShare config={config} conn={conn} onOpenFanView={openFanView} />

        <div className="console__cockpit">
          <div className="console__monitor">
            <div className="console__monitorbar">
              <span className="console__monitortag">● Live monitor — what fans see</span>
            </div>
            {config.sport === 'football' ? (
              <iframe className="monitor__frame" title={config.name} src={legacyUrl(id, { start: config.startState })} />
            ) : (
              <EngineMonitor config={config} bus={bus} />
            )}
          </div>
          <MasterControls bus={bus} pack={pack} config={config} telemetry={telemetry} onPopOut={openFanView} />
        </div>
      </div>
    </div>
  );
}

/** Engine sports: the real fan panel, bus-connected, starting in manual. */
function EngineMonitor({ config, bus }: { config: PanelConfig; bus: ControlBus }) {
  const pack = getSport(config.sport);
  const deviceRef = useRef<HTMLDivElement>(null);
  const runtime = usePanelRuntime(pack, config, { bus, mode: 'manual' });

  useEffect(() => {
    if (deviceRef.current) {
      applySportTheme(deviceRef.current, {
        ...pack.theme,
        primary: config.branding?.primary ?? pack.theme.primary,
        accent: config.branding?.accent ?? pack.theme.accent,
      });
    }
  }, [pack, config.branding]);

  return (
    <div className="monitor__device" ref={deviceRef}>
      <PanelShell runtime={runtime} pack={pack} config={config} />
    </div>
  );
}
