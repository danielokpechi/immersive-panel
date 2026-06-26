// ═══════════════════════════════════════════════════════════
// PanelPreview — a scaled, live device preview used in the Create-Panel
// wizard. Football previews the real legacy panel (iframe); other sports
// use the same engine renderer the deployed panel uses, so what you see
// is what you ship.
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';
import type { PanelConfig } from '../types/panel';
import { getSport } from '../sports/registry';
import { usePanelRuntime } from '../engine/usePanelRuntime';
import { applySportTheme } from '../theme/tokens';
import { PanelShell } from '../panel/PanelShell';

export function PanelPreview({ config }: { config: PanelConfig }) {
  return <EnginePreview key={config.sport} config={config} />;
}

function EnginePreview({ config }: { config: PanelConfig }) {
  const pack = getSport(config.sport);
  const ref = useRef<HTMLDivElement>(null);
  // key the runtime to sport+modules so it rebuilds when the draft changes
  const runtime = usePanelRuntime(pack, config, { speed: 120 });

  useEffect(() => {
    if (ref.current) {
      applySportTheme(ref.current, {
        ...pack.theme,
        primary: config.branding?.primary ?? pack.theme.primary,
        accent: config.branding?.accent ?? pack.theme.accent,
      });
    }
  }, [pack, config.branding]);

  return (
    <div className="preview">
      <div className="preview__scale">
        <div className="device preview__device" ref={ref}>
          <PanelShell runtime={runtime} pack={pack} config={config} />
        </div>
      </div>
    </div>
  );
}
