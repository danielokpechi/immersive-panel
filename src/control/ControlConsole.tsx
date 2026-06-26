// ═══════════════════════════════════════════════════════════
// ControlConsole — route /control/:id. The OPERATOR surface only: deploy
// + share (QR/link) and the master controls. No embedded fan panel — the
// fan experience is its own separate, shareable screen (/p/:id). The
// operator drives every connected fan device over the ControlBus (Ably
// cross-device when configured), and can pop out a monitor if they want
// to watch what fans see.
// ═══════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPanel } from '../studio/store';
import { getSport } from '../sports/registry';
import { ControlBus, type ConnState } from './bus';
import type { Telemetry } from '../types/control';
import { MasterControls } from './MasterControls';
import { DeployShare } from './DeployShare';
import { shareUrl } from '../studio/share';

export function ControlConsole() {
  const { id = '' } = useParams();
  const config = getPanel(id);

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

  useEffect(() => {
    const offMsg = bus.subscribe((msg) => {
      if (msg.type === 'state') setTelemetry(msg);
    });
    const offConn = bus.onConnection(setConn);
    return () => {
      offMsg();
      offConn();
      bus.dispose();
    };
  }, [bus]);

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
        <MasterControls bus={bus} pack={pack} config={config} telemetry={telemetry} onPopOut={openFanView} />
      </div>
    </div>
  );
}
