// ═══════════════════════════════════════════════════════════
// Shared module library — reusable feature modules that work across
// every sport. Each reads the live runtime (current state + events)
// so the same component behaves correctly for football, F1, UFC, etc.
// ═══════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ModuleId, PanelConfig, SportPack } from '../types/panel';
import type { PanelRuntime } from '../engine/usePanelRuntime';
import type { ControlBus } from '../control/bus';
import type { ChatMessage } from '../types/control';
import { MODULE_META } from '../theme/tokens';
import { FAN_NAMES } from '../panel/flavor';

export interface ModuleProps {
  runtime: PanelRuntime;
  pack: SportPack;
  config: PanelConfig;
  /** shared panel bus — present in the live fan panel / monitor, absent in static previews. */
  bus?: ControlBus;
}

/** A crowd handle for this session — distinct per device/tab (sessionStorage). */
function useHandle(pack: SportPack, config: PanelConfig): string {
  return useMemo(() => {
    const key = `boltos.handle.${config.id}`;
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) return saved;
    } catch {
      /* ignore */
    }
    const pool = FAN_NAMES[pack.id] ?? FAN_NAMES.football;
    const handle = `${pool[Math.floor(Math.random() * pool.length)]}${Math.floor(Math.random() * 90) + 10}`;
    try {
      sessionStorage.setItem(key, handle);
    } catch {
      /* ignore */
    }
    return handle;
  }, [pack.id, config.id]);
}

// ── Chat Room ──────────────────────────────────────────────
// Real shared chat: messages publish on the panel bus (Ably cross-device,
// BroadcastChannel locally), so every fan sees every fan. Live events add
// local ambiance that each device derives from the synced timeline.
interface ChatLine {
  mid: string;
  user: string;
  text: string;
}
function ChatRoom({ runtime, pack, config, bus }: ModuleProps) {
  const handle = useHandle(pack, config);
  const pool = FAN_NAMES[pack.id] ?? FAN_NAMES.football;
  const [msgs, setMsgs] = useState<ChatLine[]>([{ mid: 's0', user: pool[0], text: 'here we go 🔥' }]);
  const seen = useRef(new Set<string>(['s0']));
  const [draft, setDraft] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);

  const push = (line: ChatLine) => {
    if (seen.current.has(line.mid)) return;
    seen.current.add(line.mid);
    setMsgs((m) => [...m.slice(-40), line]);
  };

  // shared chat over the bus (our own sends echo back here, so add once)
  useEffect(() => {
    if (!bus) return;
    return bus.subscribe((m) => {
      if (m.type === 'chat') push({ mid: m.mid, user: m.user, text: m.text });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bus]);

  // local ambiance from live events (not broadcast — every device derives it)
  const lastSeq = useRef(-1);
  useEffect(() => {
    const latest = runtime.events[0];
    if (latest && latest.seq !== lastSeq.current) {
      lastSeq.current = latest.seq;
      const user = pool[latest.seq % pool.length];
      push({ mid: `ev${latest.seq}`, user, text: latest.takeover ? `${latest.title} 🔥🔥` : latest.title });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtime.events]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight });
  }, [msgs]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    const msg: ChatMessage = {
      type: 'chat',
      mid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      user: handle,
      text,
    };
    if (bus) bus.send(msg); // echoes back via subscribe → appended once
    else push(msg); // preview: no bus, show locally
  };

  return (
    <div className="mod-chat">
      <div className="mod-chat__feed" ref={feedRef}>
        {msgs.map((m) => (
          <div key={m.mid} className={`mod-chat__msg${m.user === handle ? ' is-me' : ''}`}>
            <span className="mod-chat__user">{m.user === handle ? 'You' : m.user}</span>
            <span className="mod-chat__text">{m.text}</span>
          </div>
        ))}
      </div>
      <div className="mod-chat__compose">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={`Chat as ${handle}…`}
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
  const [basket, setBasket] = useState<Record<string, number>>({});
  const count = Object.values(basket).reduce((a, b) => a + b, 0);
  const add = (name: string) => setBasket((b) => ({ ...b, [name]: (b[name] ?? 0) + 1 }));
  return (
    <div className="mod-store">
      {items.map((it) => {
        const qty = basket[it.name] ?? 0;
        return (
          <div className="mod-store__item" key={it.name}>
            <div className="mod-store__thumb">{pack.emoji}</div>
            <div className="mod-store__info">
              <div className="mod-store__name">
                {it.name}
                {it.tag && <span className="mod-store__tag">{it.tag}</span>}
              </div>
              <div className="mod-store__price">{it.price}</div>
            </div>
            <button className={`mod-store__buy${qty ? ' is-added' : ''}`} onClick={() => add(it.name)}>
              {qty ? `Added · ${qty}` : 'Add'}
            </button>
          </div>
        );
      })}
      <div className="mod-store__basket">
        🛍 Basket: <strong>{count}</strong> item{count === 1 ? '' : 's'}
        {count > 0 && <button className="mod-store__checkout">Checkout</button>}
      </div>
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
function Leaderboard({ pack }: ModuleProps) {
  const p = FAN_NAMES[pack.id] ?? FAN_NAMES.football;
  const rows = [
    { rank: 1, name: p[0], xp: 4820, tier: 'Legend' },
    { rank: 2, name: p[1], xp: 4110, tier: 'Legend' },
    { rank: 3, name: 'You', xp: 3650, tier: 'Regular', me: true },
    { rank: 4, name: p[2], xp: 3120, tier: 'Regular' },
    { rank: 5, name: p[3], xp: 2890, tier: 'Entry' },
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
