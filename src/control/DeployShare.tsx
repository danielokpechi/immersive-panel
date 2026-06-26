// ═══════════════════════════════════════════════════════════
// DeployShare — the "send it to fans" card in the control room. Renders
// a QR code + copyable link for the chrome-free fan panel. Colleagues
// scan from any device and join the same Ably channel, so the operator's
// live tweaks reach them. Also shows the realtime connection status.
// ═══════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import * as QRCode from 'qrcode';
import type { PanelConfig } from '../types/panel';
import { shareUrl } from '../studio/share';
import { REALTIME_ENABLED } from '../config';
import type { ConnState } from './bus';

const CONN_LABEL: Record<ConnState, string> = {
  local: 'Local only — set an Ably key for cross-device',
  connecting: 'Connecting live sync…',
  live: 'Live sync active — tweaks push to all fans',
  error: 'Live sync unavailable — check the Ably key',
};

export function DeployShare({
  config,
  conn,
  onOpenFanView,
}: {
  config: PanelConfig;
  conn: ConnState;
  onOpenFanView: () => void;
}) {
  const url = shareUrl(config);
  const [qr, setQr] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(url, { margin: 1, width: 320, color: { dark: '#0b1220', light: '#ffffff' } })
      .then((data) => alive && setQr(data))
      .catch(() => alive && setQr(''));
    return () => {
      alive = false;
    };
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the field is selectable as a fallback */
    }
  };

  const dotClass = conn === 'live' ? 'is-live' : conn === 'error' ? 'is-error' : 'is-wait';

  return (
    <section className="deploy">
      <div className="deploy__head">
        <div>
          <div className="deploy__title">Deploy to fans</div>
          <div className="deploy__sub">Scan or share the link — works on any device, fully responsive.</div>
        </div>
        <span className={`pill pill--${config.status}`}>{config.status}</span>
      </div>

      <div className="deploy__body">
        <div className="deploy__qr">
          {qr ? <img src={qr} alt="Fan panel QR code" /> : <div className="deploy__qrwait">Generating…</div>}
        </div>

        <div className="deploy__share">
          <label className="deploy__label">Fan panel link</label>
          <div className="deploy__linkrow">
            <input className="deploy__link" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
            <button className="btn btn--primary btn--sm" onClick={copy}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          <div className={`deploy__conn ${dotClass}`}>
            <span className="deploy__conndot" />
            {CONN_LABEL[REALTIME_ENABLED ? conn : 'local']}
          </div>

          <div className="deploy__actions">
            <button className="btn btn--sm" onClick={onOpenFanView}>
              ↗ Open fan view
            </button>
            <a className="btn btn--sm" href={url} target="_blank" rel="noreferrer">
              ⚡ Preview as a fan
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
