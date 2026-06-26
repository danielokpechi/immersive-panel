// ═══════════════════════════════════════════════════════════
// Per-sport "flavor" — the content that makes each engine-driven panel
// feel native (hero style, competitor names, the live-stats strip).
// Keeps the SportPack focused on the state machine; presentation lives
// here.
// ═══════════════════════════════════════════════════════════

import type { Sport } from '../types/panel';
import type { PanelRuntime } from '../engine/usePanelRuntime';

export interface StatTile {
  label: string;
  value: string;
  hot?: boolean;
}

export interface SportFlavor {
  heroKind: 'score' | 'position' | 'round' | 'session';
  competitors: [string, string];
  /** live-stats strip shown during live/break states */
  stats: (rt: PanelRuntime) => StatTile[];
  /** possession-style split bar [left%, leftLabel, rightLabel] or null */
  splitBar?: (rt: PanelRuntime) => { left: number; leftLabel: string; rightLabel: string } | null;
}

const evCount = (rt: PanelRuntime, types: string[]) =>
  rt.events.filter((e) => types.includes(e.type)).length;

/** Per-sport crowd handles — used for chat ambiance and the leaderboard. */
export const FAN_NAMES: Record<Sport, string[]> = {
  football: ['BlueMoon_77', 'CityTilIDie', 'KDB_Stan', 'EtihadElla', 'NorthStand', 'Jamie_P'],
  f1: ['BoxBoxBen', 'ApexAndy', 'SoftTyreSam', 'PitWallPat', 'DRS_Dani', 'GridGirlGee'],
  motogp: ['LeanAngleLou', 'RossiForever', 'ApexAmi', 'KneeDownKai', 'GravelTrapGus'],
  ufc: ['OctagonOllie', 'KO_Kenny', 'GroundGameGabe', 'SouthpawSue', 'CageSideCai'],
  rugby: ['RuckRyan', 'TryLineTom', 'ScrumSamir', 'TouchlineTara', 'FlyHalfFinn'],
  basketball: ['CrossoverCam', 'SwishSofia', 'FastBreakFil', 'CourtsideKai', 'DunkDeb'],
  tennis: ['AceAva', 'BaselineBilly', 'DeuceDom', 'TopspinTess', 'NetCordNeil'],
  cricket: ['CoverDriveCole', 'YorkerYusuf', 'BoundaryBea', 'SpinKingSid', 'SillyPointSal'],
  esports: ['ClutchCleo', 'AimLabAleks', 'EcoRoundEli', 'FlickShotFi', 'SmokeMidSeb'],
  conference: ['ProductPria', 'DevDana', 'KeynoteKen', 'FrontRowFran', 'DemoDuoDax'],
};

export const FLAVORS: Record<Sport, SportFlavor> = {
  football: {
    heroKind: 'score',
    competitors: ['Man City', 'Real Madrid'],
    splitBar: () => ({ left: 62, leftLabel: '62%', rightLabel: '38%' }),
    stats: (rt) => [
      { label: 'Shots', value: String(8 + evCount(rt, ['goal', 'chance'])) },
      { label: 'On Target', value: '5' },
      { label: 'xG', value: '2.1', hot: true },
      { label: 'Corners', value: '3' },
    ],
  },
  rugby: {
    heroKind: 'score',
    competitors: ['Home', 'Away'],
    splitBar: () => ({ left: 58, leftLabel: '58%', rightLabel: '42%' }),
    stats: (rt) => [
      { label: 'Tries', value: String(evCount(rt, ['try'])) , hot: true },
      { label: 'Metres', value: '412' },
      { label: 'Tackles', value: '96' },
      { label: 'Turnovers', value: '4' },
    ],
  },
  f1: {
    heroKind: 'position',
    competitors: ['Haas', 'Field'],
    stats: (rt) => [
      { label: 'Position', value: 'P8', hot: true },
      { label: 'Gap', value: '+4.2s' },
      { label: 'Tyre', value: 'Soft' },
      { label: 'Pit', value: String(evCount(rt, ['pit'])) },
    ],
  },
  ufc: {
    heroKind: 'round',
    competitors: ['Champion', 'Challenger'],
    splitBar: () => ({ left: 54, leftLabel: 'Champ', rightLabel: 'Chall' }),
    stats: (rt) => [
      { label: 'Sig. Strikes', value: String(18 + rt.events.length * 3) },
      { label: 'Takedowns', value: String(evCount(rt, ['takedown'])) },
      { label: 'Control', value: '2:14' },
      { label: 'Acc.', value: '61%', hot: true },
    ],
  },
  conference: {
    heroKind: 'session',
    competitors: ['Main Stage', ''],
    stats: (rt) => [
      { label: 'Attendees', value: '1,240', hot: true },
      { label: 'Questions', value: String(8 + evCount(rt, ['qa', 'talk'])) },
      { label: 'Polls', value: '3' },
      { label: 'Live', value: '●' },
    ],
  },
  motogp: {
    heroKind: 'position',
    competitors: ['Apex', 'Field'],
    stats: (rt) => [
      { label: 'Position', value: 'P5', hot: true },
      { label: 'Gap', value: '+1.8s' },
      { label: 'Tyre', value: 'Soft' },
      { label: 'Laps', value: String(evCount(rt, ['fastest-lap', 'overtake'])) },
    ],
  },
  basketball: {
    heroKind: 'score',
    competitors: ['Metro City', 'Coast United'],
    splitBar: () => ({ left: 52, leftLabel: 'Metro', rightLabel: 'Coast' }),
    stats: (rt) => [
      { label: 'FG%', value: '48%', hot: true },
      { label: '3PT', value: String(8 + evCount(rt, ['three'])) },
      { label: 'Rebounds', value: '31' },
      { label: 'Assists', value: '19' },
    ],
  },
  tennis: {
    heroKind: 'score',
    competitors: ['Server', 'Returner'],
    stats: (rt) => [
      { label: 'Aces', value: String(6 + evCount(rt, ['ace'])), hot: true },
      { label: '1st serve', value: '71%' },
      { label: 'Winners', value: '24' },
      { label: 'Break pts', value: String(evCount(rt, ['break'])) },
    ],
  },
  cricket: {
    heroKind: 'score',
    competitors: ['Strikers', 'Kings'],
    stats: (rt) => [
      { label: 'Run rate', value: '8.4', hot: true },
      { label: 'Fours', value: String(4 + evCount(rt, ['four'])) },
      { label: 'Sixes', value: String(evCount(rt, ['six'])) },
      { label: 'Wickets', value: String(evCount(rt, ['wicket'])) },
    ],
  },
  esports: {
    heroKind: 'score',
    competitors: ['Nova', 'Apex'],
    splitBar: () => ({ left: 56, leftLabel: 'Nova', rightLabel: 'Apex' }),
    stats: (rt) => [
      { label: 'Rounds', value: String(evCount(rt, ['round-win'])), hot: true },
      { label: 'Aces', value: String(evCount(rt, ['ace'])) },
      { label: 'Clutches', value: String(evCount(rt, ['clutch'])) },
      { label: 'ADR', value: '92' },
    ],
  },
};
