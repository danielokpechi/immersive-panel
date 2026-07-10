// ═══════════════════════════════════════════════════════════
// PanelEditor — the Panel Builder. Edit a panel end-to-end: identity &
// branding, the module library (what this panel can use at all), and the
// SESSIONS — operator-authored, reorderable states, each with an ordered
// module stack. Fans move through the sessions in order as the operator
// drives the event. A live preview mirrors the panel on the right.
// ═══════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { ModuleId, PanelConfig, PanelStateDef } from '../types/panel';
import { getSport, derivePanelStates } from '../sports/registry';
import { getPanel, upsertPanel } from './store';
import { ALL_MODULES, MODULE_META } from '../theme/tokens';
import { ASSET_PACKS } from '../sports/assets';
import { PanelPreview } from './PanelPreview';

const PHASES: { id: PanelStateDef['phase']; label: string }[] = [
  { id: 'idle', label: 'Idle' },
  { id: 'pre', label: 'Pre' },
  { id: 'live', label: 'Live' },
  { id: 'break', label: 'Break' },
  { id: 'post', label: 'Post' },
];

const rid = () => `s_${Math.random().toString(36).slice(2, 8)}`;

export function PanelEditor() {
  const params = useParams();
  const nav = useNavigate();
  const editing = params.id ? getPanel(params.id) : undefined;
  const pack = editing ? getSport(editing.sport) : null;

  // The builder always works against authored `states`. Seed them from the
  // pack the first time an older panel is opened, so ordering is meaningful.
  const [cfg, setCfg] = useState<PanelConfig | null>(() => {
    if (!editing || !pack) return editing ?? null;
    return editing.states?.length ? editing : { ...editing, states: derivePanelStates(editing, pack) };
  });

  if (!editing || !pack || !cfg) {
    return (
      <div className="page-missing">
        <h2>Panel not found</h2>
        <Link className="btn" to="/studio">
          ← Back to Studio
        </Link>
      </div>
    );
  }

  const sessions = cfg.states ?? [];
  const patch = (p: Partial<PanelConfig>) => setCfg((c) => (c ? { ...c, ...p } : c));
  const setSessions = (fn: (s: PanelStateDef[]) => PanelStateDef[]) =>
    setCfg((c) => (c ? { ...c, states: fn(c.states ?? []) } : c));

  // ── module library (what this panel can use at all) ──
  const toggleLibrary = (m: ModuleId) => {
    setCfg((c) => {
      if (!c) return c;
      const on = c.enabledModules.includes(m);
      const enabledModules = on ? c.enabledModules.filter((x) => x !== m) : [...c.enabledModules, m];
      // turning a module off pulls it from every session too
      const states = (c.states ?? []).map((s) =>
        on ? { ...s, modules: s.modules.filter((x) => x !== m) } : s,
      );
      return { ...c, enabledModules, states };
    });
  };

  // ── sessions ──
  const addSession = () =>
    setSessions((s) => [
      ...s,
      { id: rid(), label: `Session ${s.length + 1}`, phase: 'live', modules: [] },
    ]);
  const deleteSession = (id: string) => setSessions((s) => s.filter((x) => x.id !== id));
  const moveSession = (i: number, dir: -1 | 1) =>
    setSessions((s) => {
      const j = i + dir;
      if (j < 0 || j >= s.length) return s;
      const next = [...s];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const editSession = (id: string, p: Partial<PanelStateDef>) =>
    setSessions((s) => s.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const addModule = (id: string, m: ModuleId) =>
    setSessions((s) => s.map((x) => (x.id === id ? { ...x, modules: [...x.modules, m] } : x)));
  const removeModule = (id: string, m: ModuleId) =>
    setSessions((s) => s.map((x) => (x.id === id ? { ...x, modules: x.modules.filter((y) => y !== m) } : x)));
  const moveModule = (id: string, i: number, dir: -1 | 1) =>
    setSessions((s) =>
      s.map((x) => {
        if (x.id !== id) return x;
        const j = i + dir;
        if (j < 0 || j >= x.modules.length) return x;
        const mods = [...x.modules];
        [mods[i], mods[j]] = [mods[j], mods[i]];
        return { ...x, modules: mods };
      }),
    );

  const save = (deploy: boolean) => {
    // Keep moduleStateMap in sync so the renderer still resolves per-state
    // modules by id (authored sessions are the source of truth).
    const moduleStateMap: Record<string, ModuleId[]> = {};
    for (const s of sessions) moduleStateMap[s.id] = [...s.modules];
    const startState = sessions.some((s) => s.id === cfg.startState) ? cfg.startState : sessions[0]?.id;
    upsertPanel({ ...cfg, moduleStateMap, startState, status: deploy ? 'deployed' : cfg.status });
    nav(deploy ? `/control/${cfg.id}` : '/studio');
  };

  const enabled = useMemo(
    () => ALL_MODULES.filter((m) => cfg.enabledModules.includes(m)),
    [cfg.enabledModules],
  );

  return (
    <div className="builder">
      <div className="builder__bar">
        <Link className="btn btn--ghost" to="/studio">
          ← Studio
        </Link>
        <div className="builder__crumb">
          <span className="builder__crumbemoji">{cfg.branding?.emoji ?? pack.emoji}</span>
          <span>{cfg.name || 'Untitled panel'}</span>
          <span className="builder__crumbsport">{pack.name} · {cfg.experience}</span>
        </div>
        <div className="builder__actions">
          <button className="btn" onClick={() => save(false)}>
            Save draft
          </button>
          <button className="btn btn--primary" onClick={() => save(true)}>
            Save &amp; go live →
          </button>
        </div>
      </div>

      <div className="builder__body">
        <div className="builder__main">
          {/* ── identity ── */}
          <section className="bcard">
            <div className="bcard__head">
              <h2>Panel details</h2>
              <p>Name, description and the look fans see.</p>
            </div>
            <div className="bcard__body">
              <div className="bgrid2">
                <label className="field">
                  <span>Panel name</span>
                  <input value={cfg.name} onChange={(e) => patch({ name: e.target.value })} />
                </label>
                <label className="field">
                  <span>Image pack</span>
                  <select
                    value={cfg.assetKey ?? ''}
                    onChange={(e) => patch({ assetKey: e.target.value || undefined })}
                  >
                    <option value="">None (emoji)</option>
                    {Object.keys(ASSET_PACKS).map((k) => (
                      <option key={k} value={k}>
                        {k.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Description</span>
                <textarea
                  rows={2}
                  value={cfg.description}
                  onChange={(e) => patch({ description: e.target.value })}
                />
              </label>
              <div className="bgrid2">
                <label className="field">
                  <span>Primary colour</span>
                  <div className="colorfield">
                    <input
                      type="color"
                      value={cfg.branding?.primary ?? pack.theme.primary}
                      onChange={(e) => patch({ branding: { ...cfg.branding, primary: e.target.value } })}
                    />
                    <code>{cfg.branding?.primary ?? pack.theme.primary}</code>
                  </div>
                </label>
                <label className="field">
                  <span>Accent colour</span>
                  <div className="colorfield">
                    <input
                      type="color"
                      value={cfg.branding?.accent ?? pack.theme.accent}
                      onChange={(e) => patch({ branding: { ...cfg.branding, accent: e.target.value } })}
                    />
                    <code>{cfg.branding?.accent ?? pack.theme.accent}</code>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* ── module library ── */}
          <section className="bcard">
            <div className="bcard__head">
              <h2>Module library</h2>
              <p>The features this panel can use. Turn one on to make it available to every session.</p>
            </div>
            <div className="bcard__body">
              <div className="modgrid">
                {ALL_MODULES.map((m) => {
                  const on = cfg.enabledModules.includes(m);
                  return (
                    <button
                      key={m}
                      className={`modchip${on ? ' is-on' : ''}`}
                      onClick={() => toggleLibrary(m)}
                    >
                      <span className="modchip__emoji">{MODULE_META[m].emoji}</span>
                      <span className="modchip__text">
                        <span className="modchip__label">{MODULE_META[m].label}</span>
                        <span className="modchip__blurb">{MODULE_META[m].blurb}</span>
                      </span>
                      <span className="modchip__sw" />
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── sessions ── */}
          <section className="bcard">
            <div className="bcard__head bcard__head--row">
              <div>
                <h2>Sessions</h2>
                <p>
                  Build the flow the fan moves through — name each session, order them, and stack the
                  modules in the order they appear on screen.
                </p>
              </div>
              <button className="btn btn--primary btn--sm" onClick={addSession}>
                ＋ Add session
              </button>
            </div>
            <div className="bcard__body">
              {sessions.length === 0 && (
                <div className="sessions__empty">No sessions yet — add one to start building the flow.</div>
              )}
              <div className="sessions">
                {sessions.map((s, i) => (
                  <SessionCard
                    key={s.id}
                    index={i}
                    count={sessions.length}
                    session={s}
                    enabled={enabled}
                    isDefault={(cfg.startState ?? sessions[0]?.id) === s.id}
                    onMove={(dir) => moveSession(i, dir)}
                    onEdit={(p) => editSession(s.id, p)}
                    onDelete={() => deleteSession(s.id)}
                    onSetDefault={() => patch({ startState: s.id })}
                    onAddModule={(m) => addModule(s.id, m)}
                    onRemoveModule={(m) => removeModule(s.id, m)}
                    onMoveModule={(mi, dir) => moveModule(s.id, mi, dir)}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── live preview ── */}
        <aside className="builder__preview">
          <div className="builder__previewlabel">● Live preview</div>
          <PanelPreview config={cfg} />
        </aside>
      </div>
    </div>
  );
}

function SessionCard({
  index,
  count,
  session,
  enabled,
  isDefault,
  onMove,
  onEdit,
  onDelete,
  onSetDefault,
  onAddModule,
  onRemoveModule,
  onMoveModule,
}: {
  index: number;
  count: number;
  session: PanelStateDef;
  enabled: ModuleId[];
  isDefault: boolean;
  onMove: (dir: -1 | 1) => void;
  onEdit: (p: Partial<PanelStateDef>) => void;
  onDelete: () => void;
  onSetDefault: () => void;
  onAddModule: (m: ModuleId) => void;
  onRemoveModule: (m: ModuleId) => void;
  onMoveModule: (i: number, dir: -1 | 1) => void;
}) {
  const available = enabled.filter((m) => !session.modules.includes(m));
  return (
    <div className={`session${isDefault ? ' is-default' : ''}`}>
      <div className="session__head">
        <div className="session__reorder">
          <button className="iconbtn" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">
            ↑
          </button>
          <button className="iconbtn" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move down">
            ↓
          </button>
        </div>
        <div className="session__num">{index + 1}</div>
        <input
          className="session__name"
          value={session.label}
          onChange={(e) => onEdit({ label: e.target.value })}
          placeholder="Session name"
        />
        <select
          className="session__phase"
          value={session.phase}
          onChange={(e) => onEdit({ phase: e.target.value as PanelStateDef['phase'] })}
        >
          {PHASES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <button
          className={`session__default${isDefault ? ' is-on' : ''}`}
          onClick={onSetDefault}
          title="Open the panel in this session"
        >
          {isDefault ? '★ Default' : '☆ Default'}
        </button>
        <button className="iconbtn iconbtn--danger" onClick={onDelete} aria-label="Delete session">
          ✕
        </button>
      </div>

      <div className="session__stack">
        {session.modules.length === 0 && (
          <div className="session__hint">Empty — add modules below. They stack top-to-bottom on screen.</div>
        )}
        {session.modules.map((m, mi) => (
          <div className="stackrow" key={m}>
            <div className="stackrow__reorder">
              <button className="iconbtn iconbtn--xs" disabled={mi === 0} onClick={() => onMoveModule(mi, -1)}>
                ↑
              </button>
              <button
                className="iconbtn iconbtn--xs"
                disabled={mi === session.modules.length - 1}
                onClick={() => onMoveModule(mi, 1)}
              >
                ↓
              </button>
            </div>
            <span className="stackrow__pos">{mi + 1}</span>
            <span className="stackrow__emoji">{MODULE_META[m].emoji}</span>
            <span className="stackrow__label">{MODULE_META[m].label}</span>
            <button className="stackrow__x" onClick={() => onRemoveModule(m)} aria-label="Remove">
              ✕
            </button>
          </div>
        ))}
      </div>

      {available.length > 0 && (
        <div className="session__add">
          <span className="session__addlabel">Add module</span>
          {available.map((m) => (
            <button key={m} className="addchip" onClick={() => onAddModule(m)}>
              {MODULE_META[m].emoji} {MODULE_META[m].label} <span className="addchip__plus">＋</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
