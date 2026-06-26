// ═══════════════════════════════════════════════════════════
// PanelPage — the FAN surface (routes /p/:id and /panel/:id). This is the
// chrome-free, fully-responsive panel a fan opens after scanning the QR.
// It runs autonomously AND joins the panel's ControlBus, so the
// operator's live tweaks (Ably, cross-device) land in real time.
//
// The config is resolved from, in order: the self-contained ?c= payload
// in the share link (works on a fresh device), then local store by id.
// Football reuses the original prototype verbatim, served full-screen.
// ═══════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { PanelConfig } from '../types/panel';
import { getPanel, upsertPanel } from '../studio/store';
import { decodePanel } from '../studio/share';
import { getSport } from '../sports/registry';
import { assetsFor } from '../sports/assets';
import { reskinNamesFor } from './legacyReskin';
import { usePanelRuntime } from '../engine/usePanelRuntime';
import { applySportTheme } from '../theme/tokens';
import { ControlBus } from '../control/bus';
import { legacyUrl } from '../config';
import { PanelShell } from './PanelShell';

export function PanelPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();

  // Resolve the panel: self-contained share payload first (so a colleague
  // on a brand-new device still gets the exact panel), then local store.
  const config = useMemo<PanelConfig | undefined>(() => {
    const shared = decodePanel(params.get('c'));
    if (shared) {
      upsertPanel(shared); // cache locally so refreshes & theming persist
      return shared;
    }
    return getPanel(id);
  }, [id, params]);

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

  return (
    <div className="fan">
      {config.sport === 'football' && config.renderer !== 'engine' ? (
        <LegacyFanPanel config={config} />
      ) : (
        <FanPanel config={config} />
      )}
    </div>
  );
}

/**
 * The original Man City matchday prototype (image slider, live score/clock,
 * countdown, shop, quests). Runs its full self-playing matchday and still
 * takes operator commands relayed from the bus via postMessage.
 */
function LegacyFanPanel({ config }: { config: PanelConfig }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const bus = useMemo(() => new ControlBus(config.id), [config.id]);
  useEffect(() => {
    const off = bus.subscribe((msg) => {
      if (msg.type !== 'state' && msg.type !== 'chat') ref.current?.contentWindow?.postMessage(msg, '*');
    });
    return () => {
      off();
      bus.dispose();
    };
  }, [bus]);
  return (
    <iframe
      ref={ref}
      className="fan__legacy"
      title={config.name}
      src={legacyUrl(config.id, { auto: true, bridge: 'post', ...legacyTeam(config) })}
    />
  );
}

/** Map a panel's branding + image pack onto the legacy reskin params. */
function legacyTeam(config: PanelConfig) {
  const b = config.branding;
  return {
    team: b?.name,
    opp: b?.competitors?.[1],
    color: b?.primary,
    imgs: assetsFor(config.assetKey),
    names: reskinNamesFor(b?.name),
  };
}

/** Non-legacy sports (and engine-rendered clubs): the generic engine panel. */
function FanPanel({ config }: { config: PanelConfig }) {
  const pack = getSport(config.sport);
  const deviceRef = useRef<HTMLDivElement>(null);
  // Every fan joins the panel's bus so the operator can drive them live.
  // Starts in MANUAL so it waits for the operator instead of auto-advancing.
  const bus = useMemo(() => new ControlBus(config.id), [config.id]);
  useEffect(() => {
    // Late join: ask the operator for the current state so we snap to it.
    bus.send({ type: 'requestState' });
    return () => bus.dispose();
  }, [bus]);
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
    <div className="fan__device" ref={deviceRef}>
      <PanelShell runtime={runtime} pack={pack} config={config} bus={bus} />
    </div>
  );
}
