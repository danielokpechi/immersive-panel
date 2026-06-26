// ═══════════════════════════════════════════════════════════
// PanelShell — engine-driven fan panel for non-football sports, built
// to match the original prototype's design system: status bar, header,
// phase-aware hero, live-stats strip, 2-col action-grid of module
// tiles (tap to open), live event feed, pill nav + IRIS, overlays.
// Themed and content-aware per sport via flavor.ts.
// ═══════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import type { PanelConfig, SportPack, ModuleId } from '../types/panel';
import type { PanelRuntime } from '../engine/usePanelRuntime';
import type { ControlBus } from '../control/bus';
import { MODULE_COMPONENTS } from '../modules/library';
import { MODULE_META } from '../theme/tokens';
import { FLAVORS } from './flavor';
import { Overlay } from './Overlay';

interface Props {
  runtime: PanelRuntime;
  pack: SportPack;
  config: PanelConfig;
  bus?: ControlBus;
}

export function PanelShell({ runtime, pack, config, bus }: Props) {
  const phase = runtime.state.phase;
  const isLive = phase === 'live' || phase === 'break';

  const score = useMemo(() => {
    const ev = runtime.events.find((e) => e.meta && 'score' in e.meta);
    return (ev?.meta?.score as string | undefined) ?? null;
  }, [runtime.events]);
  const lastBig = useMemo(
    () => runtime.events.find((e) => e.takeover) ?? runtime.events[0] ?? null,
    [runtime.events],
  );

  const active = (config.moduleStateMap[runtime.stateId] ?? runtime.state.modules).filter((m) =>
    runtime.enabledModules.includes(m),
  ) as ModuleId[];

  const [open, setOpen] = useState<ModuleId | null>(null);
  const openId = open && active.includes(open) ? open : active[0] ?? null;

  return (
    <div className="ip" data-phase={phase}>
      <div className="ip-status">
        <span className="ip-status__time">9:41</span>
        {phase === 'live' ? (
          <span className="ip-live">
            <i /> LIVE
          </span>
        ) : (
          <span className="ip-status__badge">{runtime.clockLabel}</span>
        )}
        <span className="ip-status__sig">▂▄▆</span>
      </div>

      <div className="ip-header">
        <div className="ip-header__brand">
          <span className="ip-header__logo">{pack.emoji}</span>
          <span className="ip-header__name">{config.name}</span>
        </div>
        <div className="ip-header__icons">
          <span className="ip-icon">🔔</span>
          <span className="ip-icon">👤</span>
        </div>
      </div>

      <div className="ip-body">
        <Hero runtime={runtime} pack={pack} phase={phase} score={score} />

        <div className="ip-iris">
          <div className="ip-iris__tag">
            <IrisGlyph /> IRIS · {phase === 'live' ? 'Live read' : pack.name}
          </div>
          <div className="ip-iris__text">{lastBig?.detail ?? runtime.state.headline}</div>
        </div>

        {isLive && <LiveStats runtime={runtime} pack={pack} />}

        {/* action grid of module tiles */}
        <div className="ip-section__title">Your panel</div>
        <div className="ip-grid">
          {active.map((id) => (
            <button
              key={id}
              className={`ip-tile${openId === id ? ' is-open' : ''}`}
              onClick={() => setOpen(id)}
            >
              <span className="ip-tile__bar" />
              <span className="ip-tile__emoji">{MODULE_META[id].emoji}</span>
              <span className="ip-tile__title">{MODULE_META[id].label}</span>
              <span className="ip-tile__sub">{MODULE_META[id].blurb}</span>
            </button>
          ))}
        </div>

        {/* opened module content */}
        {openId && (
          <div className="ip-card" id={`mod-${openId}`}>
            <div className="ip-card__bar" />
            <div className="ip-card__head">
              <span className="ip-card__emoji">{MODULE_META[openId].emoji}</span>
              <span className="ip-card__label">{MODULE_META[openId].label}</span>
            </div>
            <div className="ip-card__body">
              {(() => {
                const Comp = MODULE_COMPONENTS[openId];
                return <Comp runtime={runtime} pack={pack} config={config} bus={bus} />;
              })()}
            </div>
          </div>
        )}

        {/* live event feed */}
        {runtime.events.length > 0 && (
          <section className="ip-feed">
            <div className="ip-section__title">Live timeline</div>
            <div className="ip-feed__list">
              {runtime.events.slice(0, 6).map((e) => (
                <div className="ip-feed__row" key={e.seq}>
                  <span className="ip-feed__dot" data-takeover={e.takeover ? '1' : '0'} />
                  <span className="ip-feed__title">{e.title}</span>
                  {e.meta && 'score' in e.meta && (
                    <span className="ip-feed__score">{String(e.meta.score)}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <nav className="ip-nav">
        <NavItem icon="⌂" label="Home" on />
        <NavItem icon="💬" label="Chat" onClick={() => active.includes('chat') && setOpen('chat')} />
        <span className="ip-nav__gap" />
        <NavItem icon="🛍" label="Shop" onClick={() => active.includes('store') && setOpen('store')} />
        <NavItem icon="◎" label="Me" />
      </nav>
      <button
        className={`ip-irisbtn${phase === 'live' ? ' is-live' : ''}`}
        onClick={() => active.includes('ai-qa') && setOpen('ai-qa')}
        aria-label="Ask IRIS"
      >
        <IrisGlyph />
        <span>IRIS</span>
      </button>

      <Overlay runtime={runtime} pack={pack} />
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────
function Hero({
  runtime,
  pack,
  phase,
  score,
}: {
  runtime: PanelRuntime;
  pack: SportPack;
  phase: string;
  score: string | null;
}) {
  const flavor = FLAVORS[pack.id];
  const [c1, c2] = flavor.competitors;

  // pre / idle → fixture card (+ live countdown when the operator sets one)
  if (phase === 'idle' || phase === 'pre') {
    const cd = runtime.countdownMs;
    const hh = Math.floor(cd / 3_600_000);
    const mm = Math.floor((cd % 3_600_000) / 60_000);
    const ss = Math.floor((cd % 60_000) / 1000);
    return (
      <div className="ip-hero ip-hero--pre">
        <div className="ip-hero__label">Up next · {runtime.clockLabel}</div>
        <div className="ip-hero__fixture">{pack.tagline}</div>
        {cd > 0 ? (
          <div className="ip-cd">
            {[
              [hh, 'Hrs'],
              [mm, 'Min'],
              [ss, 'Sec'],
            ].map(([v, l]) => (
              <div className="ip-cd__cell" key={l as string}>
                <div className="ip-cd__num">{String(v).padStart(2, '0')}</div>
                <div className="ip-cd__lbl">{l}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ip-hero__pills">
            <span className="ip-hero__pill">
              {pack.emoji} {pack.name}
            </span>
            <span className="ip-hero__pill ip-hero__pill--soon">● Starting soon</span>
          </div>
        )}
      </div>
    );
  }

  const live = phase === 'live' || phase === 'break';

  // F1 position hero
  if (flavor.heroKind === 'position') {
    return (
      <div className="ip-hero ip-hero--live">
        <div className="ip-hero__comp">{pack.tagline}</div>
        <div className="ip-hero__big">
          <span className="ip-hero__pos">P8</span>
          <span className="ip-hero__min">{runtime.clockLabel}</span>
        </div>
        <div className="ip-hero__sub">{live ? 'Haas on a charge — points in sight' : runtime.state.headline}</div>
      </div>
    );
  }

  // UFC round hero
  if (flavor.heroKind === 'round') {
    return (
      <div className="ip-hero ip-hero--live">
        <div className="ip-hero__comp">{c1} vs {c2}</div>
        <div className="ip-hero__big">
          <span className="ip-hero__pos">{runtime.clockLabel}</span>
        </div>
        <div className="ip-hero__sub">{runtime.state.headline}</div>
      </div>
    );
  }

  // conference session hero
  if (flavor.heroKind === 'session') {
    return (
      <div className="ip-hero ip-hero--live">
        <div className="ip-hero__comp">{pack.tagline}</div>
        <div className="ip-hero__big">
          <span className="ip-hero__pos" style={{ fontSize: 28 }}>{runtime.clockLabel}</span>
        </div>
        <div className="ip-hero__sub">{runtime.state.headline}</div>
      </div>
    );
  }

  // score hero (football handled by legacy; rugby etc.)
  const [home, away] = (score ?? '0–0').split('–');
  const scorer = runtime.events.find((e) => e.meta && 'scorer' in e.meta)?.meta?.scorer as
    | string
    | undefined;
  if (phase === 'post') {
    return (
      <div className="ip-hero ip-hero--post">
        <div className="ip-hero__comp">{runtime.clockLabel}</div>
        <div className="ip-hero__score">
          <span className="ip-hero__num">{home}</span>
          <span className="ip-hero__vs">FT</span>
          <span className="ip-hero__num">{away}</span>
        </div>
        <div className="ip-hero__sub">{runtime.state.headline}</div>
      </div>
    );
  }
  return (
    <div className="ip-hero ip-hero--live">
      <div className="ip-hero__comp">{c1} · {c2}</div>
      <div className="ip-hero__score">
        <span className="ip-hero__num">{home}</span>
        <span className="ip-hero__min">{runtime.clockLabel}</span>
        <span className="ip-hero__num ip-hero__num--dim">{away}</span>
      </div>
      {scorer && <div className="ip-hero__scorer">{pack.emoji} {scorer}</div>}
    </div>
  );
}

function LiveStats({ runtime, pack }: { runtime: PanelRuntime; pack: SportPack }) {
  const flavor = FLAVORS[pack.id];
  const bar = flavor.splitBar?.(runtime);
  const tiles = flavor.stats(runtime);
  return (
    <div className="ip-stats">
      <div className="ip-section__title">Live stats</div>
      {bar && (
        <div className="ip-stats__bar">
          <span className="ip-stats__pct">{bar.leftLabel}</span>
          <span className="ip-stats__track">
            <span className="ip-stats__fill" style={{ width: `${bar.left}%` }} />
          </span>
          <span className="ip-stats__pct ip-stats__pct--r">{bar.rightLabel}</span>
        </div>
      )}
      <div className="ip-stats__tiles">
        {tiles.map((t) => (
          <div className="ip-stats__tile" key={t.label}>
            <div className={`ip-stats__val${t.hot ? ' is-hot' : ''}`}>{t.value}</div>
            <div className="ip-stats__lbl">{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  on,
  onClick,
}: {
  icon: string;
  label: string;
  on?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className={`ip-nav__item${on ? ' is-on' : ''}`} onClick={onClick}>
      <span className="ip-nav__icon">{icon}</span>
      <small>{label}</small>
    </button>
  );
}

function IrisGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.95" />
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1" opacity="0.38" />
    </svg>
  );
}
