// ═══════════════════════════════════════════════════════════
// PanelEditor — create or edit a panel. New panels: pick a sport, then
// configure. All panels: name/description, toggle modules from the
// shared library, and map which modules appear in which state (the
// state × module matrix). Save persists to localStorage.
// ═══════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Experience, ModuleId, PanelConfig, Sport } from '../types/panel';
import { SPORT_LIST, getSport, makePanelConfig } from '../sports/registry';
import { getPanel, upsertPanel } from './store';
import { ALL_MODULES, MODULE_META } from '../theme/tokens';

export function PanelEditor() {
  const params = useParams();
  const nav = useNavigate();
  const editing = params.id ? getPanel(params.id) : undefined;
  const experience = (params.experience as Experience | undefined) ?? editing?.experience ?? 'stream';

  const [sport, setSport] = useState<Sport | null>(editing ? editing.sport : null);
  const [cfg, setCfg] = useState<PanelConfig | null>(editing ?? null);

  const pack = sport ? getSport(sport) : null;

  // ── step 1: pick a sport (new panels only) ──
  if (!sport || !cfg) {
    return (
      <div className="editor">
        <div className="editor__bar">
          <Link className="btn btn--ghost" to="/studio/new">
            ← Experience
          </Link>
          <div className="editor__step">New {experience} panel · pick an event type</div>
        </div>
        <h1 className="editor__h1">What is this panel for?</h1>
        <div className="sportgrid">
          {SPORT_LIST.map((s) => (
            <button
              key={s.id}
              className="sportgrid__card"
              onClick={() => {
                setSport(s.id);
                setCfg(makePanelConfig(s.id, { experience }));
              }}
            >
              <div className="sportgrid__emoji">{s.emoji}</div>
              <div className="sportgrid__name">{s.name}</div>
              <div className="sportgrid__tag">{s.tagline}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── step 2: configure ──
  const toggleModule = (m: ModuleId) => {
    setCfg((c) => {
      if (!c) return c;
      const on = c.enabledModules.includes(m);
      const enabledModules = on
        ? c.enabledModules.filter((x) => x !== m)
        : [...c.enabledModules, m];
      // also drop from every state map if disabling
      const moduleStateMap = { ...c.moduleStateMap };
      if (on) {
        for (const k of Object.keys(moduleStateMap)) {
          moduleStateMap[k] = moduleStateMap[k].filter((x) => x !== m);
        }
      }
      return { ...c, enabledModules, moduleStateMap };
    });
  };

  const toggleCell = (stateId: string, m: ModuleId) => {
    setCfg((c) => {
      if (!c) return c;
      const cur = c.moduleStateMap[stateId] ?? [];
      const next = cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m];
      return { ...c, moduleStateMap: { ...c.moduleStateMap, [stateId]: next } };
    });
  };

  const save = (deploy: boolean) => {
    if (!cfg) return;
    const final = { ...cfg, status: deploy ? ('deployed' as const) : cfg.status };
    upsertPanel(final);
    nav(deploy ? `/panel/${final.id}` : '/studio');
  };

  return (
    <EditorForm
      cfg={cfg}
      setCfg={setCfg}
      pack={pack!}
      toggleModule={toggleModule}
      toggleCell={toggleCell}
      onSave={save}
    />
  );
}

function EditorForm({
  cfg,
  setCfg,
  pack,
  toggleModule,
  toggleCell,
  onSave,
}: {
  cfg: PanelConfig;
  setCfg: React.Dispatch<React.SetStateAction<PanelConfig | null>>;
  pack: ReturnType<typeof getSport>;
  toggleModule: (m: ModuleId) => void;
  toggleCell: (stateId: string, m: ModuleId) => void;
  onSave: (deploy: boolean) => void;
}) {
  const enabled = useMemo(
    () => ALL_MODULES.filter((m) => cfg.enabledModules.includes(m)),
    [cfg.enabledModules],
  );

  return (
    <div className="editor">
      <div className="editor__bar">
        <Link className="btn btn--ghost" to="/studio">
          ← Studio
        </Link>
        <div className="editor__step">
          {pack.emoji} {pack.name} · {cfg.experience}
        </div>
        <div className="editor__actions">
          <button className="btn" onClick={() => onSave(false)}>
            Save draft
          </button>
          <button className="btn btn--primary" onClick={() => onSave(true)}>
            Save & deploy →
          </button>
        </div>
      </div>

      <div className="editor__cols">
        <section className="editor__panel">
          <h2>Details</h2>
          <label className="field">
            <span>Panel name</span>
            <input
              value={cfg.name}
              onChange={(e) => setCfg((c) => (c ? { ...c, name: e.target.value } : c))}
            />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea
              rows={3}
              value={cfg.description}
              onChange={(e) => setCfg((c) => (c ? { ...c, description: e.target.value } : c))}
            />
          </label>

          <h2>Modules</h2>
          <p className="editor__hint">Toggle features from the shared library.</p>
          <div className="modtoggles">
            {ALL_MODULES.map((m) => {
              const on = cfg.enabledModules.includes(m);
              return (
                <button
                  key={m}
                  className={`modtoggle${on ? ' is-on' : ''}`}
                  onClick={() => toggleModule(m)}
                >
                  <span className="modtoggle__emoji">{MODULE_META[m].emoji}</span>
                  <span className="modtoggle__label">{MODULE_META[m].label}</span>
                  <span className="modtoggle__sw" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="editor__panel">
          <h2>State → module map</h2>
          <p className="editor__hint">
            Choose which modules appear in each state. The panel switches between these
            automatically as the event unfolds.
          </p>
          <div className="matrix">
            <div className="matrix__row matrix__row--head">
              <div className="matrix__state">State</div>
              {enabled.map((m) => (
                <div className="matrix__col" key={m} title={MODULE_META[m].label}>
                  {MODULE_META[m].emoji}
                </div>
              ))}
            </div>
            {pack.states.map((s) => (
              <div className="matrix__row" key={s.id}>
                <div className="matrix__state">
                  <strong>{s.label}</strong>
                  <small>{s.phase}</small>
                </div>
                {enabled.map((m) => {
                  const on = (cfg.moduleStateMap[s.id] ?? []).includes(m);
                  return (
                    <button
                      key={m}
                      className={`matrix__cell${on ? ' is-on' : ''}`}
                      onClick={() => toggleCell(s.id, m)}
                      aria-label={`${MODULE_META[m].label} in ${s.label}`}
                    >
                      {on ? '●' : ''}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
