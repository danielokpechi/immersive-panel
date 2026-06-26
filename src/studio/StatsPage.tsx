// ═══════════════════════════════════════════════════════════
// StatsPage — lightweight mock analytics for a panel (placeholder for
// a real metrics backend).
// ═══════════════════════════════════════════════════════════

import { Link, useParams } from 'react-router-dom';
import { getPanel } from './store';
import { getSport } from '../sports/registry';
import { MODULE_META } from '../theme/tokens';

export function StatsPage() {
  const { id = '' } = useParams();
  const p = getPanel(id);
  if (!p) {
    return (
      <div className="page-missing">
        <h2>Panel not found</h2>
        <Link className="btn" to="/studio">
          ← Back to Studio
        </Link>
      </div>
    );
  }
  const pack = getSport(p.sport);
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const stat = (base: number, spread: number) => base + (seed % spread);

  return (
    <div className="stats">
      <div className="editor__bar">
        <Link className="btn btn--ghost" to="/studio">
          ← Studio
        </Link>
        <div className="editor__step">
          {pack.emoji} {p.name} · stats
        </div>
        <Link className="btn btn--primary" to={`/panel/${p.id}`}>
          Launch panel →
        </Link>
      </div>
      <div className="stats__grid">
        <Kpi label="Active fans" value={stat(8200, 4000).toLocaleString()} delta="+12%" />
        <Kpi label="Messages / min" value={String(stat(140, 90))} delta="+8%" />
        <Kpi label="Avg. session" value={`${stat(22, 18)} min`} delta="+5%" />
        <Kpi label="XP awarded" value={stat(120000, 80000).toLocaleString()} delta="+19%" />
      </div>
      <div className="stats__modbox">
        <h3>Module engagement</h3>
        {p.enabledModules.map((m, i) => {
          const pct = 30 + ((seed + i * 17) % 65);
          return (
            <div className="stats__bar" key={m}>
              <span className="stats__barlabel">
                {MODULE_META[m].emoji} {MODULE_META[m].label}
              </span>
              <span className="stats__bartrack">
                <span className="stats__barfill" style={{ width: `${pct}%` }} />
              </span>
              <span className="stats__barpct">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Kpi({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="kpi">
      <div className="kpi__value">{value}</div>
      <div className="kpi__label">{label}</div>
      <div className="kpi__delta">{delta} vs last event</div>
    </div>
  );
}
