// ═══════════════════════════════════════════════════════════
// ExperienceChooser — the "Choose your experience" screen from the
// mockup. Picks the delivery mode, then continues to the editor.
// ═══════════════════════════════════════════════════════════

import { Link, useNavigate } from 'react-router-dom';
import type { Experience } from '../types/panel';

const EXPERIENCES: { id: Experience; title: string; blurb: string; emoji: string }[] = [
  { id: 'stream', title: 'Online Stream', emoji: '📡', blurb: 'Launch a companion experience for your live stream or simulcast' },
  { id: 'vod', title: 'VOD (On-Demand)', emoji: '🎞️', blurb: 'Build a companion panel for on-demand videos with highlights, chat, and AI Q&A' },
  { id: 'in-person', title: 'In-Person Event', emoji: '🏟️', blurb: 'Bring your event into one hub with logistics assistance, chat, and on-site engagement' },
];

export function ExperienceChooser() {
  const nav = useNavigate();
  return (
    <div className="chooser">
      <div className="chooser__bar">
        <Link className="btn btn--ghost" to="/studio">
          ← Studio
        </Link>
      </div>
      <div className="chooser__logo">BOLT◯S</div>
      <h1 className="chooser__title">Choose your experience</h1>
      <div className="chooser__grid">
        {EXPERIENCES.map((e) => (
          <button
            key={e.id}
            className="chooser__card"
            onClick={() => nav(`/studio/new/${e.id}`)}
          >
            <div className="chooser__emoji">{e.emoji}</div>
            <div className="chooser__cardtitle">{e.title}</div>
            <div className="chooser__blurb">{e.blurb}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
