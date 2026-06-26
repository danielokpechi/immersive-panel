// ═══════════════════════════════════════════════════════════
// StudioHome — the admin dashboard. Lists saved panels as cards
// (mirrors the BoltOS Panel Studio mockup) with Deploy / Quick launch
// / Settings / Stats. "Create new panel" starts the experience flow.
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { PanelConfig } from '../types/panel';
import { loadPanels, upsertPanel, deletePanel, resetPanels } from './store';
import { getSport } from '../sports/registry';
import { assetsFor } from '../sports/assets';
import { MODULE_META } from '../theme/tokens';

export function StudioHome() {
  const [panels, setPanels] = useState<PanelConfig[]>(() => loadPanels());
  const nav = useNavigate();

  const deploy = (p: PanelConfig) => {
    setPanels(upsertPanel({ ...p, status: 'deployed' }));
    nav(`/control/${p.id}`);
  };
  const remove = (id: string) => setPanels(deletePanel(id));
  const reset = () => setPanels(resetPanels());

  return (
    <div className="studio">
      <header className="studio__top">
        <div className="studio__brand">
          <div className="studio__logo">B</div>
          <div>
            <div className="studio__title">BoltOS Panel Studio</div>
            <div className="studio__sub">Manage and launch immersive panels in one place</div>
          </div>
        </div>
        <div className="studio__user">
          <span className="chip">johan@bolt.global</span>
          <button className="btn btn--ghost" onClick={reset}>
            Reset demo
          </button>
        </div>
      </header>

      <section className="studio__hero">
        <div>
          <h1>Your immersive panels</h1>
          <p>You have {panels.length} panel{panels.length === 1 ? '' : 's'} ready to deploy</p>
          <div className="studio__stats">
            <span className="hstat">
              <strong>{panels.length}</strong> total
            </span>
            <span className="hstat">
              <strong>{panels.filter((p) => p.status === 'deployed').length}</strong> live
            </span>
            <span className="hstat">
              <strong>{new Set(panels.map((p) => p.sport)).size}</strong> sports
            </span>
          </div>
        </div>
        <Link className="btn btn--primary" to="/studio/new">
          ＋ Create new panel
        </Link>
      </section>

      <div className="studio__grid">
        {[...panels]
          .sort((a, b) => (b.assetKey ? 1 : 0) - (a.assetKey ? 1 : 0))
          .map((p) => {
          const pack = getSport(p.sport);
          const mods = p.enabledModules;
          const fans = (2 + (p.id.length % 8)) + '.' + (p.id.charCodeAt(2) % 9) + 'k';
          const accent = p.branding?.primary ?? pack.theme.primary;
          const emoji = p.branding?.emoji ?? pack.emoji;
          const cover = assetsFor(p.assetKey)[0];
          return (
            <article className="pcard" key={p.id} style={{ ['--sport' as string]: accent }}>
              <div
                className="pcard__cover"
                style={{ background: `linear-gradient(135deg, ${accent}, ${pack.theme.surface})` }}
              >
                {cover && <img className="pcard__coverimg" src={cover} alt="" loading="lazy" />}
                <span className="pcard__coveremoji">{emoji}</span>
                <span className="pcard__sport">{p.branding?.name ?? pack.name}</span>
                <button className="pcard__x" title="Delete" onClick={() => remove(p.id)}>
                  ✕
                </button>
              </div>
              <div className="pcard__head">
                <div className="pcard__title">{p.name}</div>
                <span className={`pill pill--${p.experience}`}>{p.experience}</span>
              </div>
              <p className="pcard__desc">{p.description}</p>

              <div className="pcard__metrics">
                <span className={`pcard__dot pcard__dot--${p.status}`} />
                {p.status === 'deployed' ? (
                  <>
                    <strong>Live</strong> · {fans} fans · {mods.length} modules
                  </>
                ) : (
                  <>
                    <strong>Draft</strong> · {mods.length} modules configured
                  </>
                )}
              </div>

              <div className="pcard__mods">
                {mods.slice(0, 5).map((m) => (
                  <span className="tag" key={m}>
                    {MODULE_META[m].label}
                  </span>
                ))}
                {mods.length > 5 && <span className="tag tag--more">+{mods.length - 5} more</span>}
              </div>

              <div className="pcard__meta">
                <span>Updated {new Date(p.updatedAt).toLocaleDateString()} · ID: <code>{p.id}</code></span>
              </div>

              <div className="pcard__actions">
                <button className="btn btn--primary btn--sm" onClick={() => deploy(p)}>
                  🎛 Go live
                </button>
                <Link className="btn btn--sm" to={`/panel/${p.id}`}>
                  ⚡ Fan view
                </Link>
                <Link className="btn btn--sm" to={`/studio/${p.id}/edit`}>
                  ⚙ Settings
                </Link>
                <Link className="btn btn--sm" to={`/studio/${p.id}/stats`}>
                  📈 Stats
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <footer className="studio__footer">
        © 2026 BoltOS Panel Studio. All rights reserved. · Contact support:{' '}
        <strong>johan@bolt.global</strong>
      </footer>
    </div>
  );
}
