// ═══════════════════════════════════════════════════════════
// Per-sport manual event triggers shown in the master control. Each
// produces a TimelineEvent the operator can fire into the live panel
// (overlay + feed). Football's triggers are mapped to the legacy app's
// own simulate() events in the bridge.
// ═══════════════════════════════════════════════════════════

import type { Sport, TimelineEvent } from '../types/panel';

export interface Trigger {
  label: string;
  emoji: string;
  event: TimelineEvent;
}

const ev = (
  type: string,
  title: string,
  detail: string,
  takeover = false,
  meta?: Record<string, unknown>,
): TimelineEvent => ({ atMs: 0, type, title, detail, takeover, meta });

export const TRIGGERS: Record<Sport, Trigger[]> = {
  football: [
    { label: 'Goal', emoji: '⚽', event: ev('goal', 'GOAL!', 'The net bulges — the place erupts.', true, { score: '1–0' }) },
    { label: 'VAR check', emoji: '📺', event: ev('var', 'VAR Check', 'Under review — possible incident in the box.', true, { verdict: 'Pending' }) },
    { label: 'Substitution', emoji: '🔄', event: ev('sub', 'Substitution', 'Fresh legs coming on.', true) },
    { label: 'Yellow card', emoji: '🟨', event: ev('yellow', 'Yellow card', 'Booking for a cynical foul.') },
  ],
  rugby: [
    { label: 'Try', emoji: '🏉', event: ev('try', 'TRY!', 'Grounded over the line.', true, { score: '5–0' }) },
    { label: 'Conversion', emoji: '🎯', event: ev('conversion', 'Conversion', 'Off the tee — two more.') },
    { label: 'Penalty', emoji: '➕', event: ev('penalty', 'Penalty kicked', 'Three points on offer.') },
    { label: 'Yellow card', emoji: '🟨', event: ev('yellow', 'Sin bin', '10 minutes down to 14.') },
  ],
  f1: [
    { label: 'Pit stop', emoji: '🔧', event: ev('pit', 'Pit window', 'Box, box — fresh tyres.', true, { stop: '2.3s' }) },
    { label: 'Safety car', emoji: '🚨', event: ev('safety-car', 'Safety Car', 'Field bunches up.', true) },
    { label: 'Overtake', emoji: '↩️', event: ev('overtake', 'Overtake!', 'A place gained into the corner.') },
    { label: 'Fastest lap', emoji: '⏱️', event: ev('fastest-lap', 'Fastest lap', 'Purple sector — new best.') },
  ],
  motogp: [
    { label: 'Lights out', emoji: '🟢', event: ev('lights-out', 'LIGHTS OUT', 'They are away!', true) },
    { label: 'Overtake', emoji: '↩️', event: ev('overtake', 'Overtake!', 'A move on the brakes.') },
    { label: 'Crash', emoji: '💥', event: ev('crash', 'Crash!', 'Rider down — gravel trap.', true) },
    { label: 'Fastest lap', emoji: '⏱️', event: ev('fastest-lap', 'Fastest lap', 'New record pace.') },
  ],
  ufc: [
    { label: 'Knockdown', emoji: '🥊', event: ev('knockdown', 'Knockdown!', 'Big shot lands clean.', true) },
    { label: 'KO / TKO', emoji: '💥', event: ev('ko', 'KNOCKOUT!', 'It is all over!', true, { method: 'KO' }) },
    { label: 'Takedown', emoji: '🤼', event: ev('takedown', 'Takedown', 'Slammed to the mat.') },
    { label: 'Submission', emoji: '🔒', event: ev('submission', 'Submission attempt', 'Deep on a choke.', true) },
  ],
  basketball: [
    { label: 'Dunk', emoji: '🏀', event: ev('dunk', 'SLAM DUNK!', 'Throws it down — and one!', true, { score: '24–22' }) },
    { label: '3-pointer', emoji: '🎯', event: ev('three', 'Three!', 'From way downtown.', true) },
    { label: 'Timeout', emoji: '⏸️', event: ev('timeout', 'Timeout', 'Coach stops the run.') },
    { label: 'Foul', emoji: '✋', event: ev('foul', 'Foul', 'To the line for two.') },
  ],
  tennis: [
    { label: 'Ace', emoji: '🎾', event: ev('ace', 'ACE!', 'Unreturnable serve.', true) },
    { label: 'Break point', emoji: '⚡', event: ev('break', 'Break point', 'Chance to break serve.', true) },
    { label: 'Set point', emoji: '🏁', event: ev('set', 'Set point', 'Serving for the set.') },
    { label: 'Challenge', emoji: '🔍', event: ev('challenge', 'Hawk-Eye challenge', 'Reviewing the call.', true) },
  ],
  cricket: [
    { label: 'Four', emoji: '4️⃣', event: ev('four', 'FOUR!', 'Races away to the rope.', false, { score: '146/3' }) },
    { label: 'Six', emoji: '6️⃣', event: ev('six', 'SIX!', 'Into the stands!', true, { score: '152/3' }) },
    { label: 'Wicket', emoji: '🎯', event: ev('wicket', 'WICKET!', 'He’s gone — big breakthrough.', true) },
    { label: 'Review (DRS)', emoji: '📺', event: ev('drs', 'DRS review', 'Going upstairs.', true) },
  ],
  esports: [
    { label: 'Round win', emoji: '🏆', event: ev('round-win', 'Round won', 'Clean execute.', false, { score: '9–6' }) },
    { label: 'Ace', emoji: '💀', event: ev('ace', 'ACE!', 'Whole team down — 1vX clutch!', true) },
    { label: 'Clutch', emoji: '🔥', event: ev('clutch', 'Clutch!', 'Wins it from nothing.', true) },
    { label: 'Map point', emoji: '🏁', event: ev('map-point', 'Map point', 'Serving for the map.') },
  ],
  conference: [
    { label: 'Talk starts', emoji: '🎤', event: ev('talk', 'Session live', 'On stage now.', true) },
    { label: 'Live demo', emoji: '🖥️', event: ev('demo', 'Live demo', 'Showing it in real time.', true) },
    { label: 'Top question', emoji: '❓', event: ev('qa', 'Top question', 'Most-upvoted question is up.') },
    { label: 'Announcement', emoji: '📣', event: ev('announce', 'Announcement', 'Big news from the stage.', true) },
  ],
};
