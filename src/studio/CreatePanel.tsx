// ═══════════════════════════════════════════════════════════
// CreatePanel — the redesigned "create a new panel" wizard. A guided,
// responsive flow with a live device preview that updates as you choose:
//   Experience → Sport → Team/preset → Modules → Details & brand → Launch
// Reuses the sport registry, team presets, module library, and the same
// renderer the real panel uses (so the preview is the real thing).
// ═══════════════════════════════════════════════════════════

import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Branding, Experience, ModuleId, PanelConfig, Sport } from '../types/panel';
import { SPORT_LIST, getSport, makePanelConfig } from '../sports/registry';
import { teamsForSport } from '../sports/teams';
import { ALL_MODULES, MODULE_META } from '../theme/tokens';
import { upsertPanel } from './store';
import { PanelPreview } from './PanelPreview';

const EXPERIENCES: { id: Experience; title: string; emoji: string; blurb: string }[] = [
  { id: 'stream', title: 'Online Stream', emoji: '📡', blurb: 'Companion for a live stream or simulcast' },
  { id: 'vod', title: 'VOD (On-Demand)', emoji: '🎞️', blurb: 'Highlights, chat and AI Q&A for on-demand video' },
  { id: 'in-person', title: 'In-Person Event', emoji: '🏟️', blurb: 'One hub for logistics, chat and on-site engagement' },
];

const STEPS = ['Experience', 'Sport', 'Team', 'Modules', 'Brand'];

export function CreatePanel() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [experience, setExperience] = useState<Experience>('stream');
  const [sport, setSport] = useState<Sport>('football');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState<ModuleId[]>([]);
  const [branding, setBranding] = useState<Branding>({});

  const idRef = useRef('pnl_' + Math.random().toString(36).slice(2, 9));
  const pack = getSport(sport);
  const teams = teamsForSport(sport);

  // draft config used for the live preview + final save (stable id)
  const draft: PanelConfig = useMemo(() => {
    const base = makePanelConfig(sport, { experience, id: idRef.current });
    return {
      ...base,
      name: name || base.name,
      description: description || base.description,
      enabledModules: enabled.length ? enabled : base.enabledModules,
      branding: Object.keys(branding).length ? branding : undefined,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sport, experience, name, description, enabled, branding]);

  const pickSport = (s: Sport) => {
    setSport(s);
    setTeamId(null);
    setBranding({});
    setEnabled([...getSport(s).defaultModules]);
    setName('');
    setDescription('');
  };

  const pickTeam = (id: string | null) => {
    setTeamId(id);
    const t = teams.find((x) => x.id === id);
    if (t) {
      setBranding(t.branding);
      setName(t.panelName);
    } else {
      setBranding({});
    }
  };

  const toggle = (m: ModuleId) =>
    setEnabled((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const launch = () => {
    const cfg = { ...draft, status: 'deployed' as const };
    upsertPanel(cfg);
    nav(`/control/${cfg.id}`);
  };

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const canNext = step < STEPS.length - 1;

  return (
    <div className="wiz">
      <div className="wiz__bar">
        <Link className="btn btn--ghost" to="/studio">
          ← Studio
        </Link>
        <div className="wiz__steps">
          {STEPS.map((s, i) => (
            <button
              key={s}
              className={`wiz__step${i === step ? ' is-on' : ''}${i < step ? ' is-done' : ''}`}
              onClick={() => setStep(i)}
            >
              <span className="wiz__num">{i < step ? '✓' : i + 1}</span>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="wiz__body">
        <div className="wiz__main">
          {step === 0 && (
            <Step title="Choose your experience" hint="How will fans reach this panel?">
              <div className="wiz__grid">
                {EXPERIENCES.map((e) => (
                  <button
                    key={e.id}
                    className={`wiz__card${experience === e.id ? ' is-sel' : ''}`}
                    onClick={() => setExperience(e.id)}
                  >
                    <div className="wiz__cardemoji">{e.emoji}</div>
                    <div className="wiz__cardtitle">{e.title}</div>
                    <div className="wiz__cardblurb">{e.blurb}</div>
                  </button>
                ))}
              </div>
            </Step>
          )}

          {step === 1 && (
            <Step title="What is this panel for?" hint="Pick the event type — each has its own live states.">
              <div className="wiz__sports">
                {SPORT_LIST.map((s) => (
                  <button
                    key={s.id}
                    className={`wiz__sport${sport === s.id ? ' is-sel' : ''}`}
                    onClick={() => pickSport(s.id)}
                  >
                    <span className="wiz__sportemoji">{s.emoji}</span>
                    <span className="wiz__sportname">{s.name}</span>
                  </button>
                ))}
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step title="Team or preset" hint="Brand the panel — or keep the default look.">
              <div className="wiz__grid">
                <button className={`wiz__card${!teamId ? ' is-sel' : ''}`} onClick={() => pickTeam(null)}>
                  <div className="wiz__cardemoji">{pack.emoji}</div>
                  <div className="wiz__cardtitle">Default {pack.name}</div>
                  <div className="wiz__cardblurb">Use the standard {pack.name} theme</div>
                </button>
                {teams.map((t) => (
                  <button
                    key={t.id}
                    className={`wiz__card${teamId === t.id ? ' is-sel' : ''}`}
                    onClick={() => pickTeam(t.id)}
                  >
                    <div className="wiz__cardemoji" style={{ color: t.branding.primary }}>
                      {t.branding.emoji ?? pack.emoji}
                    </div>
                    <div className="wiz__cardtitle">{t.name}</div>
                    <div className="wiz__cardblurb" style={{ color: t.branding.primary }}>
                      {t.panelName}
                    </div>
                  </button>
                ))}
              </div>
              {teams.length === 0 && <p className="wiz__note">No presets for {pack.name} yet — the default theme is used.</p>}
            </Step>
          )}

          {step === 3 && (
            <Step title="Modules" hint="Pick the features fans get. You can toggle these live later.">
              <div className="wiz__mods">
                {ALL_MODULES.map((m) => {
                  const on = (enabled.length ? enabled : pack.defaultModules).includes(m);
                  return (
                    <button key={m} className={`modtoggle${on ? ' is-on' : ''}`} onClick={() => toggle(m)}>
                      <span className="modtoggle__emoji">{MODULE_META[m].emoji}</span>
                      <span className="modtoggle__label">{MODULE_META[m].label}</span>
                      <span className="modtoggle__sw" />
                    </button>
                  );
                })}
              </div>
            </Step>
          )}

          {step === 4 && (
            <Step title="Details & brand" hint="Name it and fine-tune the colours.">
              <label className="field">
                <span>Panel name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={`${pack.name} Fan Hub`} />
              </label>
              <label className="field">
                <span>Description</span>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={pack.tagline} />
              </label>
              <div className="wiz__colors">
                <label className="wiz__color">
                  <span>Primary</span>
                  <input type="color" value={branding.primary ?? pack.theme.primary} onChange={(e) => setBranding((b) => ({ ...b, primary: e.target.value }))} />
                </label>
                <label className="wiz__color">
                  <span>Accent</span>
                  <input type="color" value={branding.accent ?? pack.theme.accent} onChange={(e) => setBranding((b) => ({ ...b, accent: e.target.value }))} />
                </label>
              </div>
            </Step>
          )}

          <div className="wiz__actions">
            {step > 0 && (
              <button className="btn" onClick={back}>
                ← Back
              </button>
            )}
            {canNext ? (
              <button className="btn btn--primary" onClick={next}>
                Next →
              </button>
            ) : (
              <button className="btn btn--primary" onClick={launch}>
                🎛 Create & go live →
              </button>
            )}
          </div>
        </div>

        <div className="wiz__preview">
          <div className="wiz__previewlabel">Live preview</div>
          <PanelPreview config={draft} />
        </div>
      </div>
    </div>
  );
}

function Step({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="wiz__panel">
      <h1 className="wiz__h1">{title}</h1>
      <p className="wiz__hint">{hint}</p>
      {children}
    </div>
  );
}
