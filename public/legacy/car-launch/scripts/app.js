// Aurora Nova launch on the Connect fan panel: screen navigation, the
// Before / Live / After homes, and the shared pieces (sheets, flash banners,
// profile signals, XP, paint). Vanilla JS, no build.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rm = (n) => 'RM' + Math.round(n).toLocaleString('en-MY');
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (d) => `${DAY[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;

// ── Desktop frame fit ───────────────────────────────────────────
function fit() {
  const f = innerWidth > 520 ? Math.min(1, (innerHeight - 60) / 844) : 1;
  document.documentElement.style.setProperty('--fit', f.toFixed(3));
}
addEventListener('resize', fit);
fit();
const fitScale = () => (innerWidth > 520 ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fit')) || 1 : 1);

// ── Profile signals + XP: every interaction visibly feeds the profile ──
function signal(label, kind = 'SIGNAL', xp = 0) {
  if (xp) S.xp += xp;
  const box = $('#signals');
  while (box.children.length > 1) box.firstChild.remove();
  const el = document.createElement('div');
  el.className = 'signal';
  el.innerHTML = `<i>${kind}</i>${label}${xp ? `<em>+${xp} XP</em>` : ''}`;
  box.appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 320); }, 2000);
}

// ── Flash banners: launch moments drop in from the top, then clear ──
function flash(tone, icon, kicker, title, sub, ms = 4800) {
  const box = $('#flash-stack');
  while (box.children.length > 1) box.firstChild.remove();
  const el = document.createElement('div');
  el.className = 'flash-card ' + tone;
  el.innerHTML = `<div class="flash-ic">${icon}</div><div class="flash-body"><div class="flash-kicker">${kicker}</div><div class="flash-title">${title}</div><div class="flash-sub">${sub}</div></div><div class="flash-prog"></div>`;
  box.appendChild(el);
  const prog = $('.flash-prog', el);
  requestAnimationFrame(() => {
    el.classList.add('in');
    prog.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: ms, easing: 'linear', fill: 'forwards' });
  });
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 340); }, ms);
}

// ── Sheets ──────────────────────────────────────────────────────
function openSheet(id, light) {
  $$('.sheet.on').forEach((s) => s.id !== id && s.classList.remove('on'));
  $('#scrim').classList.toggle('light', !!light);
  $('#scrim').classList.add('on');
  $('#' + id).classList.add('on');
  $('#screen').classList.add('sheet-open');
}
function closeSheets() {
  $$('.sheet.on').forEach((s) => s.classList.remove('on'));
  $('#scrim').classList.remove('on');
  $('#screen').classList.remove('sheet-open');
  $$('.hs.lit').forEach((h) => h.classList.remove('lit'));
}
$('#scrim').addEventListener('click', closeSheets);
$$('[data-close]').forEach((b) => b.addEventListener('click', closeSheets));

// ── Screen navigation (the panel's navigate / back) ─────────────
const HOMES = ['home-before', 'home-live', 'home-after'];
let current = 'home-before';

function show(id, anim = 'right') {
  closeSheets();
  const el = $('#' + id);
  $$('.screen.on').forEach((s) => s.classList.remove('on', 'anim-right', 'anim-left', 'anim-up', 'anim-fade'));
  el.classList.add('on');
  void el.offsetWidth;
  el.classList.add('anim-' + anim);
  current = id;
  const sub = el.classList.contains('sub');
  $('#hdr').classList.toggle('sub', sub);
  $('#stagebar').classList.toggle('off', sub);
  if (sub) {
    $('#sub-title').textContent = el.dataset.title;
    $('#sub-xp').textContent = el.dataset.xp || '';
  }
  $('#screen').classList.toggle('live-home', id === 'home-live');
  $('#screen').classList.toggle('is-live', S.stage === 1);
  updateProgress();
}
function back() { show(HOMES[S.stage], 'left'); }
$('#back').addEventListener('click', back);
$$('.done-back').forEach((b) => b.addEventListener('click', back));
$$('[data-go]').forEach((b) => b.addEventListener('click', () => {
  if (b.classList.contains('done')) return;
  show(b.dataset.go, 'right');
}));

// ── Stages ──────────────────────────────────────────────────────
function goStage(i) {
  $('#share').classList.remove('on');
  S.stage = i;
  $$('.sg').forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('done', k < i); });
  const pill = $('#phase-pill');
  pill.className = 'phase-pill' + (i === 1 ? ' live' : i === 2 ? ' after' : '');
  pill.textContent = i === 1 ? 'LIVE' : i === 2 ? '✦ REVEALED' : '';
  $('#hdr-title').textContent = ['Nova Launch', 'Nova Live', 'My Nova'][i];
  show(HOMES[i], 'fade');
  $('#' + HOMES[i]).scrollTop = 0;
  live(i === 1);
  if (i === 2) renderAfter();
  if (i === 1 && !S.revealed) return runReveal();
  return Promise.resolve();
}
$$('.sg').forEach((b) => b.addEventListener('click', () => goStage(+b.dataset.i)));

function updateProgress() {
  $$('.sg').forEach((b, k) => {
    let p = k < S.stage ? 1 : 0;
    if (k === S.stage) {
      const el = $('#' + HOMES[k]);
      const max = el.scrollHeight - el.clientHeight;
      p = Math.max(0.08, max > 0 ? el.scrollTop / max : 1);
    }
    $('i b', b).style.transform = `scaleX(${p})`;
  });
}
HOMES.forEach((h) => $('#' + h).addEventListener('scroll', updateProgress, { passive: true }));

// Scroll an element to `at` (fraction from the top) of its screen.
function scrollIntoViewIn(el, at = 0.18) {
  const box = el.closest('.screen');
  const sc = fitScale();
  const top = box.scrollTop + (el.getBoundingClientRect().top - box.getBoundingClientRect().top) / sc - box.clientHeight * at;
  box.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

// Shell nav: Chat, Aurora, profile
$('#nav-chat').addEventListener('click', () => {
  if (S.stage !== 1) { flash('', '💬', 'Launch chat', 'Opens when the reveal starts', '1,204 people already waiting in the room', 3200); return; }
  if (current !== 'home-live') show('home-live', 'left');
  scrollIntoViewIn($('#sec-chat'), 0.3);
});
$('#nav-me').addEventListener('click', () => goStage(2));

// ── Paint + variant (live stage, After hero and share card share this) ──
function applyPaint(scope) {
  const p = paintOf();
  $$('.paint.hue', scope).forEach((el) => { el.style.backgroundColor = p.hue || 'transparent'; el.style.opacity = p.hue ? p.hueO : 0; });
  $$('.paint.depth', scope).forEach((el) => { el.style.backgroundColor = p.depth || 'transparent'; el.style.opacity = p.depth ? p.depthO : 0; });
}
function renderPicker() {
  $('#vtabs').innerHTML = DATA.variants.map((v) => `<button class="vtab${v.id === S.variant ? ' on' : ''}" data-v="${v.id}">${v.name}</button>`).join('');
  $('#swatches').innerHTML = DATA.paints.map((p) => `<button class="sw${p.id === S.paint ? ' on' : ''}" data-p="${p.id}" style="background:${p.swatch}" aria-label="${p.name}"></button>`).join('');
  const v = variantOf();
  $('#paint-name').innerHTML = `${paintOf().name}<span>${v.full} · ${rm(v.price)}</span>`;
  $('#t-finance-s').textContent = `From ${rm(monthly(v.price, S.deposit, S.term))}/mo`;
  applyPaint(document);
}
function setVariant(id, quiet) {
  if (S.variant === id) return;
  S.variant = id;
  renderPicker();
  renderFinance();
  if (!quiet) signal(`Variant · ${variantOf().full}`);
}
function setPaint(id) {
  if (S.paint === id) return;
  S.paint = id;
  renderPicker();
  signal(`Colour · ${paintOf().name}`);
}
$('#vtabs').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) setVariant(b.dataset.v); });
$('#swatches').addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (b) setPaint(b.dataset.p); });

// ════════ 01 BEFORE ════════
// Hero carousel: auto-advances, dots and left/right taps switch cards.
let heroI = 0;
function heroGo(i) {
  heroI = (i + 3) % 3;
  $$('#hero .hero-card').forEach((c, k) => c.classList.toggle('on', k === heroI));
  $$('#hero-dots i').forEach((d, k) => d.classList.toggle('on', k === heroI));
}
setInterval(() => { if (S.stage === 0 && current === 'home-before') heroGo(heroI + 1); }, 5200);
$$('#hero-dots i').forEach((d, k) => d.addEventListener('click', () => heroGo(k)));
$('#hero').addEventListener('click', (e) => {
  if (e.target.closest('button, .dots-nav')) return;
  const r = $('#hero').getBoundingClientRect();
  heroGo(heroI + (e.clientX - r.left < r.width * 0.38 ? -1 : 1));
});

const launchAt = new Date(Date.now() + (3 * 24 + 14) * 3600e3);
$('#h-date').textContent = `${DAY[launchAt.getDay()]} 20:00`;
$('#cd-sub').textContent = `${fmtDate(launchAt)} · 20:00 MYT · on Connect`;
function tickCountdown() {
  const t = Math.max(0, launchAt - Date.now()) / 1000;
  const p = (n) => String(n).padStart(2, '0');
  $('#cd-val').textContent = `${Math.floor(t / 86400)}d ${p(Math.floor((t % 86400) / 3600))}:${p(Math.floor((t % 3600) / 60))}:${p(Math.floor(t % 60))}`;
}
tickCountdown();
setInterval(tickCountdown, 1000);

function questDone(id, sub) {
  const q = $('#' + id);
  q.classList.add('done');
  $('small', q).textContent = sub;
  $('.qx', q).textContent = '✓ ' + $('.qx', q).textContent;
  const left = $$('.quests .quest[data-go]:not(.done)').reduce((a, el) => a + parseInt($('.qx', el).textContent.replace(/\D/g, ''), 10), 0);
  $('#xp-left').textContent = left ? `${left} XP` : 'All done ✓';
}

$('#r-variant').innerHTML = DATA.variants.map((v) => `<option value="${v.id}">${v.full} · from ${rm(v.price)}</option>`).join('');
$('#r-city').innerHTML = DATA.cities.map((c) => `<option>${c}</option>`).join('');
$('#r-budget').innerHTML = DATA.budgets.map((b, i) => `<button data-i="${i}"${i === 0 ? ' class="on"' : ''}>${b}</button>`).join('');
$('#r-budget').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#r-budget button').forEach((x) => x.classList.toggle('on', x === b));
});
$('#r-submit').addEventListener('click', () => {
  const name = $('#r-name').value.trim();
  if (!name) { $('#r-name').focus(); $('#r-name').classList.add('focus'); return; }
  const variant = $('#r-variant').value;
  S.register = { name, email: $('#r-email').value.trim(), variant, budget: $('#r-budget .on').textContent, city: $('#r-city').value };
  setVariant(variant, true);
  $('#r-done-title').textContent = `You're on the list, ${name.split(' ')[0]}.`;
  $('#r-done-sub').textContent = `Your launch-night link goes to ${S.register.email || 'your inbox'}. We'll open the reveal on the ${variantOf().full}.`;
  $('#register').classList.add('is-done');
  questDone('q-register', `${variantOf().full} · ${S.register.budget} · ${S.register.city}`);
  signal(`Intent · ${variantOf().name} · ${S.register.budget}`, 'SIGNAL', 150);
});

const topicOf = (q) => (/charg/i.test(q) ? 'charging' : /price|cost|\brm/i.test(q) ? 'price' : /financ|loan|month/i.test(q) ? 'finance' : 'range');
$('#q-chips').innerHTML = DATA.questionChips.map((c) => `<button class="chip">${c}</button>`).join('');
$('#q-chips').addEventListener('click', (e) => {
  const b = e.target.closest('.chip'); if (!b) return;
  $$('#q-chips .chip').forEach((x) => x.classList.toggle('on', x === b));
  const map = { 'Range?': 'What range will the Nova get in real traffic?', 'Charging time?': 'How long does a fast charge take?', 'Price?': 'What will the launch price be?' };
  $('#q-text').value = map[b.textContent] || b.textContent;
});
$('#q-submit').addEventListener('click', () => {
  const q = $('#q-text').value.trim();
  if (!q) { $('#q-text').focus(); return; }
  S.questions.push(q);
  const topic = topicOf(q);
  $('#q-done-sub').textContent = `1,284 people asked about ${topic} too. The design team answers the top questions live on stage.`;
  $('#question').classList.add('is-done');
  if (S.questions.length === 1) questDone('q-question', `Asked about ${topic} · answered on stage`);
  signal(`Question · ${topic}`, 'SIGNAL', S.questions.length === 1 ? 100 : 0);
});
$('#q-another').addEventListener('click', () => {
  $('#q-text').value = '';
  $$('#q-chips .chip').forEach((x) => x.classList.remove('on'));
  $('#question').classList.remove('is-done');
});

let seatType = 'virtual', seatVenue = null;
$('#venues').innerHTML = DATA.venues.map((v) => `<button class="venue" data-id="${v.id}"><div>${v.name}<small>${v.city} · ${v.seats} seats left</small></div><span class="rad"></span></button>`).join('');
$$('.seat').forEach((b) => b.addEventListener('click', () => {
  seatType = b.dataset.seat;
  $$('.seat').forEach((x) => x.classList.toggle('on', x === b));
  $('#venues').classList.toggle('show', seatType === 'physical');
}));
$('#venues').addEventListener('click', (e) => {
  const b = e.target.closest('.venue'); if (!b) return;
  seatVenue = DATA.venues.find((v) => v.id === b.dataset.id);
  $$('#venues .venue').forEach((x) => x.classList.toggle('on', x === b));
});
$('#s-confirm').addEventListener('click', () => {
  if (seatType === 'physical' && !seatVenue) seatVenue = DATA.venues[0];
  S.seat = { type: seatType, venue: seatType === 'physical' ? seatVenue : null };
  const where = seatType === 'virtual' ? 'Live on this panel, any device' : seatVenue.name;
  $('#t-type').textContent = seatType === 'virtual' ? 'Virtual seat' : 'Studio seat';
  $('#t-where').textContent = where;
  $('#t-date').textContent = fmtDate(launchAt);
  $('#t-ref').textContent = 'NV-' + (400 + Math.floor(Math.random() * 600)).toString().padStart(4, '0');
  $('#reserve').classList.add('is-done');
  $('#h-seat').textContent = seatType === 'virtual' ? 'Virtual ✓' : seatVenue.city + ' ✓';
  questDone('q-seat', `${seatType === 'virtual' ? 'Virtual seat' : seatVenue.name} · ${fmtDate(launchAt)}`);
  signal(`Seat · ${seatType}${seatType === 'physical' ? ' · ' + seatVenue.city : ''}`, 'SIGNAL', 200);
});
$('#cta-seat').addEventListener('click', () => { if (!S.seat) show('scr-seat'); });
$('#skip-live').addEventListener('click', () => goStage(1));

// ════════ 02 LIVE ════════
// The reveal: 3-2-1, then the car lights up and the hotspots appear.
async function runReveal() {
  S.revealed = true;
  const gl = $('#golive');
  const stage = $('#live-stage');
  stage.classList.remove('revealing');
  gl.classList.add('on');
  for (const n of [3, 2, 1]) {
    $('#golive-n').outerHTML = `<div class="n" id="golive-n">${n}</div>`;
    await sleep(650);
  }
  void stage.offsetWidth;
  stage.classList.add('revealing');
  gl.classList.remove('on');
  addMoment(0); addMoment(1);
  setTimeout(() => flash('o', '🎤', 'On stage now', 'Mei Lin Tan, design chief', 'Walking through the Nova, feature by feature'), 900);
  setTimeout(() => { addMoment(2); }, 9000);
  setTimeout(() => { addMoment(3); flash('g', '💰', 'Price revealed', 'Aurora Nova from RM159,000', 'Launch-night price locked for 30 days'); }, 21000);
  signal('Joined live · virtual seat', 'LIVE');
  await sleep(1500);
  showHotspots();
  await sleep(900);
}

function addMoment(i) {
  const [t, txt, hot] = DATA.moments[i];
  $('#moments').insertAdjacentHTML('afterbegin', `<div class="mo${hot ? ' hot' : ''}"><span class="t">${t}</span><i class="d"></i><span>${txt}</span></div>`);
}

// Live atmosphere: viewers, chat, ambient reactions, poll votes.
let viewers = 18240, rxTotal = 48912, chatN = 1204, lineI = 0, liveTimer = null, chatTimer = null;
function addLine(av, name, text, kind = '') {
  const box = $('#lines');
  box.insertAdjacentHTML('beforeend', `<div class="ln ${kind}"><div class="av">${av}</div><span><b>${name}</b>&nbsp; ${text}</span></div>`);
  while (box.children.length > 4) box.firstChild.remove();
}
function live(on) {
  clearInterval(liveTimer); clearInterval(chatTimer);
  if (!on) return;
  if (!$('#lines').children.length) for (let k = 0; k < 3; k++) { const l = DATA.chatLines[lineI++]; addLine(l[0], l[1], l[2], l[3]); }
  liveTimer = setInterval(() => {
    viewers += Math.floor(Math.random() * 28) + 4;
    $('#viewers').textContent = viewers.toLocaleString('en-MY');
    if (Math.random() < 0.6) floatEmoji(['🔥', '❤️', '🤯', '😮'][Math.floor(Math.random() * 4)], null);
    rxTotal += Math.floor(Math.random() * 9);
    $('#rx-total').textContent = rxTotal.toLocaleString('en-MY');
    tickPoll();
  }, 650);
  chatTimer = setInterval(() => {
    const l = DATA.chatLines[lineI++ % DATA.chatLines.length];
    addLine(l[0], l[1], l[2], l[3]);
    chatN += Math.floor(Math.random() * 12) + 3;
    $('#chat-n').textContent = chatN.toLocaleString('en-MY') + ' live';
  }, 2100);
}
function floatEmoji(ch, fromEl) {
  if (current !== 'home-live') return;
  const box = $('#floaters');
  const sr = $('#screen').getBoundingClientRect();
  const sc = fitScale();
  const el = document.createElement('div');
  el.className = 'fl';
  el.textContent = ch;
  const x = fromEl ? (fromEl.getBoundingClientRect().left - sr.left) / sc + 8 : (sr.width / sc) * (0.55 + Math.random() * 0.3);
  el.style.left = x + 'px';
  el.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
  if (!fromEl) { el.style.fontSize = '20px'; el.style.opacity = '.85'; }
  box.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}
$$('.rx').forEach((b) => b.addEventListener('click', () => {
  floatEmoji(b.dataset.rx, b);
  b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 160);
  S.reactions++; rxTotal++;
  $('#rx-total').textContent = rxTotal.toLocaleString('en-MY');
  if (S.reactions === 1) addLine('YO', 'You', b.dataset.rx.repeat(3), 'me');
}));

// Spec sheet for the selected variant
$('#t-spec').addEventListener('click', () => {
  const v = variantOf();
  $('#spec-name').textContent = `${v.full} · ${v.motor}`;
  $('#spec-grid').innerHTML = `<div><b class="brand">${v.range}</b><span>km range</span></div><div><b>${v.sprint}s</b><span>0–100</span></div><div><b>18<small style="font-size:12px"> min</small></b><span>10–80%</span></div>`;
  openSheet('spec-sheet', true);
  signal(`Spec sheet · ${v.name}`);
});

// Launch-night offer: a refundable reservation
$('#offer').addEventListener('click', () => {
  if (S.offer) return;
  S.offer = true;
  $('#offer').classList.add('done');
  $('#offer-go').textContent = 'Reserved ✓';
  signal(`Reservation · ${variantOf().name} · price locked`, 'RESERVED', 300);
});

// Test drive
const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d; });
let driveDay = null, driveDealer = null;
$('#dates').innerHTML = days.map((d, i) => `<button class="date" data-i="${i}"><span>${DAY[d.getDay()].toUpperCase()}</span><b>${d.getDate()}</b></button>`).join('');
$('#dealers').innerHTML = DATA.dealers.map((d) => `<button class="venue" data-id="${d.id}"><div>${d.name}<small>${d.area} · ${d.dist}</small></div><span class="rad"></span></button>`).join('');
function driveReady() { $('#d-confirm').disabled = !(driveDay && driveDealer); }
$('#dates').addEventListener('click', (e) => {
  const b = e.target.closest('.date'); if (!b) return;
  driveDay = days[+b.dataset.i];
  $$('#dates .date').forEach((x) => x.classList.toggle('on', x === b));
  driveReady();
});
$('#dealers').addEventListener('click', (e) => {
  const b = e.target.closest('.venue'); if (!b) return;
  driveDealer = DATA.dealers.find((d) => d.id === b.dataset.id);
  $$('#dealers .venue').forEach((x) => x.classList.toggle('on', x === b));
  driveReady();
});
$('#d-confirm').addEventListener('click', () => {
  S.drive = { day: driveDay, dealer: driveDealer };
  $('#d-done').textContent = `${fmtDate(driveDay)}, 10:00 at ${driveDealer.name}, ${driveDealer.area}. ${DATA.specialist.name.split(' ')[0]} will have a ${variantOf().full} in ${paintOf().name} ready for you.`;
  $('#drive').classList.add('is-done');
  $('#t-drive').classList.add('done');
  $('#t-drive-s').textContent = `Booked · ${fmtDate(driveDay)}`;
  signal(`Test drive · ${fmtDate(driveDay)} · ${driveDealer.name}`, 'BOOKED', 250);
});
$('#to-after').addEventListener('click', () => goStage(2));

// ════════ 03 AFTER ════════
function renderAfter() {
  const v = variantOf(), p = paintOf();
  const hsNames = S.hotspots.map((id) => DATA.hotspots.find((h) => h.id === id).name);
  const vote = S.vote && DATA.poll.opts.find((o) => o.id === S.vote).label.split(' · ')[0];
  const TOPIC = { range: 'range', charge: 'charging', price: 'price', finance: 'finance' };
  const topics = [...new Set([...S.questions.map(topicOf), ...S.chats.map((c) => TOPIC[c])])];
  const askedN = S.questions.length + S.chats.length;
  const mo = rm(monthly(v.price, S.deposit, S.term));
  const rows = [
    ['Build', `${v.full} · ${p.name}`],
    ['Features explored', hsNames.length ? hsNames.join(', ') : null],
    ['Poll vote', vote],
    ['Questions asked', askedN ? `${askedN} · ${topics.join(', ')}` : null],
    ['Finance plan', `${mo}/mo · ${S.deposit}% down · ${S.term} yrs`],
    ['Launch seat', S.seat ? (S.seat.type === 'virtual' ? 'Virtual' : S.seat.venue.name) : null],
    ['Test drive', S.drive ? `${fmtDate(S.drive.day)} · ${S.drive.dealer.name}` : null],
  ];
  $('#explored').innerHTML = rows.map(([k, val], i) => `<div class="ex-row" style="animation-delay:${0.15 + i * 0.07}s"><span>${k}</span><b class="${val ? '' : 'none'}">${val || 'Not yet'}</b></div>`).join('');

  $('#a-title').textContent = v.full;
  $('#a-sub').textContent = `${p.name} · ${v.motor}`;
  $('#a-month').textContent = mo;
  $('#a-xp').textContent = '+' + S.xp;
  $('#rw-sub').textContent = `+${S.xp} XP today · free wallbox with your reservation`;

  const dealer = S.drive ? S.drive.dealer : DATA.dealers[0];
  const first = S.register ? S.register.name.split(' ')[0] + ', y' : 'Y';
  $('#dealer-line').textContent = `${first}our dealer, ${dealer.name}, will be in touch within 24 hours.`;
  $('#sp-init').textContent = DATA.specialist.initials;
  $('#sp-name').textContent = DATA.specialist.name;
  $('#sp-role').textContent = DATA.specialist.role.replace('Aurora KL', dealer.name);
  $('#sp-phone').textContent = DATA.specialist.phone;
  if (hsNames.length) $('#rt-film').textContent = `Deep dive on the ${hsNames.slice(0, 2).join(' and ')}`;
  applyPaint($('#home-after'));

  const score = leadScore();
  const fg = $('#ring-fg');
  fg.style.transition = 'none'; fg.style.strokeDashoffset = 264; void fg.getBoundingClientRect();
  fg.style.transition = '';
  setTimeout(() => { fg.style.strokeDashoffset = 264 * (1 - score / 100); }, 250);
  countUp($('#score'), score, 1500, 250);
  countUp($('#a-score'), score, 1500, 250);
  $('#heat').textContent = score >= 65 ? '● HOT LEAD' : score >= 40 ? '● WARM LEAD' : '● NEW LEAD';
}
function countUp(el, to, ms, delay = 0) {
  const t0 = performance.now() + delay;
  const step = (t) => {
    const k = Math.min(1, Math.max(0, (t - t0) / ms));
    el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
$('#book-call').addEventListener('click', (e) => {
  e.currentTarget.textContent = 'Call booked · tomorrow, 10:00';
  e.currentTarget.classList.add('ghost');
  signal('Call booked with Farah', 'ASSIGNED');
});
$$('.rt').forEach((b) => b.addEventListener('click', () => signal(b.dataset.rt, 'NEXT')));
$('#share-btn').addEventListener('click', openShare);
$('#share-close').addEventListener('click', () => $('#share').classList.remove('on'));
$('#restart').addEventListener('click', () => location.reload());

function openShare() {
  const v = variantOf(), p = paintOf();
  $('#sc-title').textContent = v.full;
  $('#sc-paint').textContent = `${p.name} · ${v.motor}`;
  $('#sc-range').textContent = v.range + ' km';
  $('#sc-sprint').textContent = v.sprint + ' s';
  $('#sc-month').textContent = rm(monthly(v.price, S.deposit, S.term)) + '/mo';
  applyPaint($('#share'));
  $('#share').classList.add('on');
  signal('Shared build', 'SOCIAL', 50);
}

renderPicker();
updateProgress();
