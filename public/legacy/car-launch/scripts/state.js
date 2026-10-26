// One shared profile: every interaction lands here, and the After stage
// reads it back. That's the deck's "one consented customer profile".
const S = {};

function resetState() {
  Object.assign(S, {
    stage: 0,
    variant: 'std',
    paint: 'pearl',
    hotspots: [],
    vote: null,
    questions: [],
    chats: [],
    register: null,
    seat: null,
    drive: null,
    deposit: 20,
    term: 7,
    reactions: 0,
    xp: 0,
    offer: false,
    revealed: false,
  });
}
resetState();

const variantOf = () => DATA.variants.find((v) => v.id === S.variant);
const paintOf = () => DATA.paints.find((p) => p.id === S.paint);

// Lead score: a base for showing up, plus weight for each intent signal.
function leadScore() {
  let s = 14;
  if (S.register) s += 10;
  if (S.questions.length) s += 6;
  if (S.seat) s += 6;
  s += Math.min(S.hotspots.length, 5) * 2;
  if (S.paint !== 'pearl' || S.variant !== 'std') s += 6;
  if (S.vote) s += 3;
  if (S.chats.length) s += 4 + Math.min(S.chats.length - 1, 2) * 2;
  if (S.deposit !== 20 || S.term !== 7) s += 4;
  if (S.drive) s += 10;
  if (S.offer) s += 6;
  return Math.min(s, 96);
}
