// ═══════════════════════════════════════════════════════════
// Per-club name maps for the legacy MCFC prototype. The prototype bakes in
// Man City players/manager/venue/abbreviation; these remap them to each
// club's real 2025/26 people so a reskinned panel reads fully custom.
// Keyed by branding.name. Sources: club/season squad pages (2025/26).
// ═══════════════════════════════════════════════════════════

export const CLUB_RESKIN: Record<string, Record<string, string>> = {
  England: {
    // Three Lions XI (2026) over the baked-in City names. Multi-word forms
    // first so "Kevin De Bruyne" doesn't end up as "Kevin Bellingham".
    'Erling Haaland': 'Harry Kane',
    'Kevin De Bruyne': 'Jude Bellingham',
    'Bernardo Silva': 'Cole Palmer',
    'B. Silva': 'Palmer',
    Bernardo: 'Palmer',
    Haaland: 'Kane',
    'De Bruyne': 'Bellingham',
    Ederson: 'Pickford',
    Doku: 'Saka',
    Rodri: 'Rice',
    Kovačić: 'Mainoo',
    Cherki: 'Eze',
    'Rúben Dias': 'Stones',
    Gvardiol: 'Guéhi',
    Akanji: 'Konsa',
    // Foden and Walker are already England players — no remap needed.
    // Formation-pitch abbreviations (word-bounded, one per lineup slot).
    HAA: 'KAN',
    EDG: 'BEL',
    DOK: 'SAK',
    ROD: 'RIC',
    KVA: 'MAI',
    EDR: 'PIC',
    RUB: 'STO',
    AKE: 'GUE',
    GOM: 'SHA',
    Guardiola: 'Tuchel',
    // Self-map shields the sponsor from the shorter 'Pep' key below
    // (longest-first ordering guarantees it wins).
    Pepsi: 'Pepsi',
    Pep: 'Tuchel',
    // Opponent-side stragglers (pre-rename Arsenal references).
    'Saka out': 'Messi fit',
    Partey: 'De Paul',
    Saliba: 'Romero',
    // Venue, competition, abbreviations, hashtags.
    'order.mancity.com': 'order.englandfootball.com',
    Etihad: 'Wembley',
    'Premier League': 'International Friendly',
    'Champions League': 'International Friendly',
    MCIARS: 'ENGARG',
    MCIRMA: 'ENGARG',
    EPL: 'INT',
    ManCity: 'ThreeLions',
    MCFC: 'ENG',
    MCI: 'ENG',
    RMA: 'ARG',
    ARS: 'ARG',
    // City-flavoured fan handles → England ones.
    BlueMoonRising: 'ThreeLionsRoar',
    NorthEndBlue: 'WembleyEndSam',
    CityFan_Mk: 'EngFan_Ldn',
    CityFan_97: 'EngFan_97',
    SkyBlueKev: 'ThreeLionsKev',
    MikeNorthEnd: 'MikeWembley',
    BlueHazeMcr: 'StGeorgeSam',
    CityZoneSam: 'WembleyZoneSam',
    'bluemoon.katie': 'threelions.katie',
    kdb_edits17: 'jude_edits17',
    'etihad.echo': 'wembley.echo',
    ttv_bluearmy: 'ttv_englandarmy',
    RealFanCarlos: 'AlbicelesteCarlos',
    bluemoon_liv: 'threelions_liv',
    '#UCL': '#Wembley',
    // Kit-colour emoji.
    '🔵💙': '🏴󠁧󠁢󠁥󠁮󠁧󠁿🦁',
    '💙': '🦁',
    '🔵': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  },
  'Man Utd': {
    Haaland: 'Šeško',
    Foden: 'Mbeumo',
    'De Bruyne': 'Bruno Fernandes',
    'Bernardo Silva': 'Cunha',
    'B. Silva': 'Cunha',
    Ederson: 'Lammens',
    Doku: 'Amad',
    Rodri: 'Casemiro',
    Kovačić: 'Mainoo',
    Cherki: 'Yoro',
    'Rúben Dias': 'De Ligt',
    Gvardiol: 'Martínez',
    Guardiola: 'Amorim',
    Pep: 'Amorim',
    Etihad: 'Old Trafford',
    MCFC: 'MUFC',
    MCI: 'MUN',
  },
  QPR: {
    Haaland: 'Koné',
    Foden: 'Burrell',
    'De Bruyne': 'Edwards',
    'Bernardo Silva': 'Burrell',
    'B. Silva': 'Burrell',
    Ederson: 'Nardi',
    Doku: 'Koné',
    Rodri: 'Edwards',
    Kovačić: 'Burrell',
    Cherki: 'Koné',
    'Rúben Dias': 'Edwards',
    Gvardiol: 'Edwards',
    Guardiola: 'Stéphan',
    Pep: 'Stéphan',
    Etihad: 'Loftus Road',
    MCFC: 'QPR',
    MCI: 'QPR',
  },
  Austria: {
    Haaland: 'Arnautović',
    Foden: 'Baumgartner',
    'De Bruyne': 'Sabitzer',
    'Bernardo Silva': 'Schmid',
    'B. Silva': 'Schmid',
    Ederson: 'Schlager',
    Doku: 'Wimmer',
    Rodri: 'Seiwald',
    Kovačić: 'Laimer',
    Cherki: 'Wimmer',
    'Rúben Dias': 'Lienhart',
    Gvardiol: 'Alaba',
    Guardiola: 'Rangnick',
    Pep: 'Rangnick',
    Etihad: 'Ernst-Happel-Stadion',
    MCFC: 'AUT',
    MCI: 'AUT',
  },
};

export function reskinNamesFor(teamName?: string): Record<string, string> | undefined {
  return teamName ? CLUB_RESKIN[teamName] : undefined;
}

// ── Text reskin for content injected OUTSIDE the legacy iframe ──
// Operator triggers (polls, reaction captions, …) are authored in City terms
// and travel to the fan panel as event payloads, bypassing the iframe's own
// reskin pass — so they get the same treatment here before being sent.

import type { TimelineEvent, PanelConfig } from '../types/panel';

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Short all-caps keys (MCI, RMA…) are word-bounded so they never match inside
 *  longer words ("CONFIRMATION" contains "RMA"). */
const ABBREV = /^[A-Z0-9]{2,6}$/;

export function reskinText(s: string, teamName?: string, opp?: string): string {
  if (!teamName || teamName === 'Man City') return s;
  let out = s;
  const names = reskinNamesFor(teamName);
  if (names) {
    for (const k of Object.keys(names).sort((a, b) => b.length - a.length)) {
      const re = ABBREV.test(k) ? new RegExp(`\\b${escRe(k)}\\b`, 'g') : new RegExp(escRe(k), 'g');
      out = out.replace(re, names[k]);
    }
  }
  out = out.replace(/Manchester City|Man City|\bCity\b/g, () => teamName);
  if (opp) out = out.replace(/Real Madrid/g, opp);
  return out;
}

/** Reskin an operator trigger's user-visible strings for a branded panel. */
export function reskinEvent(event: TimelineEvent, config: PanelConfig): TimelineEvent {
  const b = config.branding;
  if (!b?.name || b.name === 'Man City') return event;
  const fix = (s: string) => reskinText(s, b.name, b.competitors?.[1]);
  const meta =
    event.meta &&
    Object.fromEntries(
      Object.entries(event.meta).map(([k, v]) => [
        k,
        typeof v === 'string' ? fix(v) : Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? fix(x) : x)) : v,
      ]),
    );
  return { ...event, title: fix(event.title), detail: event.detail && fix(event.detail), meta };
}
