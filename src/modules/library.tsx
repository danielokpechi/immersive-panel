// ═══════════════════════════════════════════════════════════
// Shared module library — reusable feature modules that work across
// every sport. Each reads the live runtime (current state + events)
// so the same component behaves correctly for football, F1, UFC, etc.
// ═══════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ModuleId, PanelConfig, SportPack } from '../types/panel';
import type { PanelRuntime } from '../engine/usePanelRuntime';
import { MODULE_META } from '../theme/tokens';

export interface ModuleProps {
  runtime: PanelRuntime;
  pack: SportPack;
  config: PanelConfig;
}

// ── Chat Room ──────────────────────────────────────────────
const CHAT_NAMES = ['Jamie_P', 'BlueMoon_77', 'CityTilIDie', 'KDB_Stan', 'EtihadElla', 'NorthStand'];
function ChatRoom({ runtime }: ModuleProps) {
  const [msgs, setMsgs] = useState<{ id: number; user: string; text: string }[]>([
    { id: 0, user: 'BlueMoon_77', text: 'here we go 🔵' },
    { id: 1, user: 'EtihadElla', text: 'atmosphere is unreal today' },
  ]);
  const idRef = useRef(2);
  const lastSeq = useRef(-1);
  const [draft, setDraft] = useState('');

  // react to live events with auto chatter
  useEffect(() => {
    const latest = runtime.events[0];
    if (latest && latest.seq !== lastSeq.current) {
      lastSeq.current = latest.seq;
      const user = CHAT_NAMES[latest.seq % CHAT_NAMES.length];
      const text = latest.takeover ? `${latest.title} 🔥🔥` : latest.title;
      setMsgs((m) => [...m.slice(-30), { id: idRef.current++, user, text }]);
    }
  }, [runtime.events]);

  const send = () => {
    if (!draft.trim()) return;
    setMsgs((m) => [...m.slice(-30), { id: idRef.current++, user: 'You', text: draft.trim() }]);
    setDraft('');
  };

  return (
    <div className="mod-chat">
      <div className="mod-chat__feed">
        {msgs.map((m) => (
          <div key={m.id} className={`mod-chat__msg${m.user === 'You' ? ' is-me' : ''}`}>
            <span className="mod-chat__user">{m.user}</span>
            <span className="mod-chat__text">{m.text}</span>
          </div>
        ))}
      </div>
      <div className="mod-chat__compose">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Say something…"
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}

// ── AI Q&A ─────────────────────────────────────────────────
function AiQa({ runtime, pack }: ModuleProps) {
  const suggestions = useMemo(
    () => [
      `What just happened?`,
      `Who's the standout performer?`,
      `What are the odds now?`,
      `Summarise the last 10 minutes`,
    ],
    [],
  );
  const [answer, setAnswer] = useState<string | null>(null);
  const latest = runtime.events[0];
  const ask = (q: string) => {
    const ctx = latest ? `${latest.title}. ${latest.detail ?? ''}` : `${runtime.state.headline}`;
    setAnswer(`IRIS · ${pack.name}: ${ctx} (${runtime.clockLabel})`);
    void q;
  };
  return (
    <div className="mod-aiqa">
      <div className="mod-aiqa__chips">
        {suggestions.map((s) => (
          <button key={s} onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>
      {answer && <div className="mod-aiqa__answer">{answer}</div>}
    </div>
  );
}

// ── Affiliate Store ────────────────────────────────────────
const STORE_ITEMS: Record<string, { name: string; price: string; tag?: string }[]> = {
  football: [
    { name: 'Home Kit 25/26', price: '£80', tag: 'Matchday' },
    { name: 'Haaland #9 Shirt', price: '£95', tag: 'Hot' },
    { name: 'Scarf — Champions', price: '£20' },
  ],
  f1: [
    { name: 'Team Cap', price: '£35', tag: 'Race' },
    { name: 'Pit Crew Tee', price: '£45' },
    { name: '1:43 Car Model', price: '£60', tag: 'Hot' },
  ],
  ufc: [
    { name: 'Champion Walkout Tee', price: '£50', tag: 'Hot' },
    { name: 'Fight Night Gloves', price: '£70' },
    { name: 'Event Poster', price: '£15' },
  ],
  rugby: [
    { name: 'Home Jersey', price: '£75', tag: 'Matchday' },
    { name: 'Supporter Beanie', price: '£18' },
    { name: 'Match Programme', price: '£8' },
  ],
  conference: [
    { name: 'Summit Hoodie', price: '£55', tag: 'Hot' },
    { name: 'Notebook + Pen Set', price: '£14' },
    { name: 'Digital Slide Pack', price: 'Free', tag: 'Attendee' },
  ],
};
function AffiliateStore({ pack }: ModuleProps) {
  const items = STORE_ITEMS[pack.id] ?? STORE_ITEMS.football;
  return (
    <div className="mod-store">
      {items.map((it) => (
        <div className="mod-store__item" key={it.name}>
          <div className="mod-store__thumb">{pack.emoji}</div>
          <div className="mod-store__info">
            <div className="mod-store__name">
              {it.name}
              {it.tag && <span className="mod-store__tag">{it.tag}</span>}
            </div>
            <div className="mod-store__price">{it.price}</div>
          </div>
          <button className="mod-store__buy">Add</button>
        </div>
      ))}
    </div>
  );
}

// ── Highlights ─────────────────────────────────────────────
function Highlights({ runtime, pack }: ModuleProps) {
  const clips = runtime.events.filter((e) =>
    ['goal', 'try', 'ko', 'overtake', 'pit', 'safety-car', 'chequered', 'lights-out', 'demo', 'talk', 'penalty', 'fastest-lap', 'bell'].includes(e.type),
  );
  if (!clips.length) {
    return <div className="mod-empty">Highlights will appear here as the action unfolds…</div>;
  }
  return (
    <div className="mod-highlights">
      {clips.map((c) => (
        <div className="mod-highlights__clip" key={c.seq}>
          <div className="mod-highlights__play">{pack.emoji}</div>
          <div className="mod-highlights__meta">
            <div className="mod-highlights__title">{c.title}</div>
            {c.detail && <div className="mod-highlights__detail">{c.detail}</div>}
          </div>
          <span className="mod-highlights__live">▶</span>
        </div>
      ))}
    </div>
  );
}

// ── Predictions ────────────────────────────────────────────
const PRED_OPTIONS: Record<string, string[]> = {
  football: ['Haaland', 'Foden', 'Vinícius', 'No more goals'],
  f1: ['Verstappen', 'Norris', 'Haas points', 'Safety car ends it'],
  ufc: ['KO / TKO', 'Submission', 'Decision', 'Round 2 finish'],
  rugby: ['Home win', 'Away win', 'Over 20.5 pts', 'A red card'],
  conference: ['Product launch', 'New partnership', 'Live demo wows', 'Standing ovation'],
};
function Predictions({ pack }: ModuleProps) {
  const opts = PRED_OPTIONS[pack.id] ?? PRED_OPTIONS.football;
  const [pick, setPick] = useState<string | null>(null);
  const pct = useMemo(() => opts.map((_, i) => 15 + ((i * 27 + 11) % 60)), [opts]);
  return (
    <div className="mod-pred">
      <div className="mod-pred__q">Call the next big moment</div>
      {opts.map((o, i) => (
        <button
          key={o}
          className={`mod-pred__opt${pick === o ? ' is-picked' : ''}`}
          onClick={() => setPick(o)}
        >
          <span className="mod-pred__bar" style={{ width: `${pct[i]}%` }} />
          <span className="mod-pred__label">{o}</span>
          <span className="mod-pred__pct">{pct[i]}%</span>
        </button>
      ))}
      {pick && <div className="mod-pred__locked">Locked in: {pick} · +25 XP</div>}
    </div>
  );
}

// ── Polls & Quizzes ────────────────────────────────────────
function Polls({ pack }: ModuleProps) {
  const [voted, setVoted] = useState<string | null>(null);
  const q = pack.id === 'conference' ? 'How useful is this session?' : 'Who’s your MVP so far?';
  const opts = pack.id === 'conference' ? ['🔥 Loved it', '👍 Good', '😐 Meh'] : ['Player A', 'Player B', 'Player C'];
  return (
    <div className="mod-poll">
      <div className="mod-poll__q">{q}</div>
      <div className="mod-poll__opts">
        {opts.map((o) => (
          <button
            key={o}
            className={`mod-poll__opt${voted === o ? ' is-voted' : ''}`}
            onClick={() => setVoted(o)}
          >
            {o}
          </button>
        ))}
      </div>
      {voted && <div className="mod-poll__thanks">Thanks for voting! +10 XP</div>}
    </div>
  );
}

// ── Leaderboard ────────────────────────────────────────────
function Leaderboard() {
  const rows = [
    { rank: 1, name: 'NorthStand', xp: 4820, tier: 'Legend' },
    { rank: 2, name: 'KDB_Stan', xp: 4110, tier: 'Legend' },
    { rank: 3, name: 'You', xp: 3650, tier: 'Regular', me: true },
    { rank: 4, name: 'EtihadElla', xp: 3120, tier: 'Regular' },
    { rank: 5, name: 'BlueMoon_77', xp: 2890, tier: 'Entry' },
  ];
  return (
    <div className="mod-lb">
      {rows.map((r) => (
        <div className={`mod-lb__row${r.me ? ' is-me' : ''}`} key={r.rank}>
          <span className="mod-lb__rank">{r.rank}</span>
          <span className="mod-lb__name">{r.name}</span>
          <span className="mod-lb__tier">{r.tier}</span>
          <span className="mod-lb__xp">{r.xp.toLocaleString()} XP</span>
        </div>
      ))}
    </div>
  );
}

// ── AI Moderation ──────────────────────────────────────────
function Moderation({ runtime }: ModuleProps) {
  const removed = 3 + (runtime.events.length % 5);
  return (
    <div className="mod-moderation">
      <div className="mod-moderation__status">
        <span className="mod-moderation__dot" /> AI moderation active
      </div>
      <div className="mod-moderation__stats">
        <div>
          <strong>{removed}</strong>
          <span>messages filtered</span>
        </div>
        <div>
          <strong>0</strong>
          <span>reports pending</span>
        </div>
        <div>
          <strong>100%</strong>
          <span>uptime</span>
        </div>
      </div>
    </div>
  );
}

// ── Betting Overlay ────────────────────────────────────────
function BettingOverlay({ runtime, pack }: ModuleProps) {
  // odds drift as events fire (more events => shorter favourite)
  const base = PRED_OPTIONS[pack.id] ?? PRED_OPTIONS.football;
  const drift = runtime.events.length;
  const markets = base.slice(0, 3).map((label, i) => {
    const odds = Math.max(1.2, 2.4 + i * 0.8 - drift * 0.12).toFixed(2);
    return { label, odds };
  });
  return (
    <div className="mod-bet">
      <div className="mod-bet__head">
        <span>Live odds</span>
        <span className="mod-bet__live">● LIVE</span>
      </div>
      <div className="mod-bet__markets">
        {markets.map((m) => (
          <button className="mod-bet__market" key={m.label}>
            <span>{m.label}</span>
            <strong>{m.odds}</strong>
          </button>
        ))}
      </div>
      <div className="mod-bet__note">18+ · Please gamble responsibly · BeGambleAware</div>
    </div>
  );
}

// ── Registry ───────────────────────────────────────────────
export const MODULE_COMPONENTS: Record<ModuleId, (p: ModuleProps) => React.ReactElement> = {
  chat: ChatRoom,
  'ai-qa': AiQa,
  store: AffiliateStore,
  highlights: Highlights,
  predictions: Predictions,
  polls: Polls,
  leaderboard: Leaderboard,
  moderation: Moderation,
  betting: BettingOverlay,
};

export function moduleLabel(id: ModuleId) {
  return MODULE_META[id].label;
}

export type { PanelConfig, SportPack };
