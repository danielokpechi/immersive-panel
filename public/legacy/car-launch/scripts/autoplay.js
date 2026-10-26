// Scripted ~60s walkthrough. It drives the real controls (a tap ring shows
// each "tap"), so what Johan watches is exactly what a viewer can do.
// Any touch pauses it; 15s idle resumes from the next step.
const AP = { paused: false, idle: null, manual: false };
const chip = $('#auto-chip');

function setPaused(p) {
  AP.paused = p;
  chip.classList.toggle('paused', p);
  $('span', chip).textContent = p ? 'PAUSED' : 'AUTO';
  clearTimeout(AP.idle);
  if (p && !AP.manual) AP.idle = setTimeout(() => setPaused(false), 15000);
}

// Pause-aware wait: time only passes while playing.
async function wait(ms) {
  let left = ms;
  while (left > 0) {
    await sleep(50);
    if (!AP.paused) left -= 50;
  }
}
const gate = () => wait(1);

function ringAt(el) {
  const sc = fitScale();
  const r = el.getBoundingClientRect(), s = $('#screen').getBoundingClientRect();
  const tap = $('#tap');
  tap.style.left = (r.left - s.left + r.width / 2) / sc + 'px';
  tap.style.top = (r.top - s.top + r.height / 2) / sc + 'px';
  tap.classList.remove('go'); void tap.offsetWidth; tap.classList.add('go');
}

async function reveal(sel, at) {
  const el = typeof sel === 'string' ? $(sel) : sel;
  // After a hands-on detour, bring back the screen this step belongs to.
  const scr = el.closest('.screen');
  if (scr && !scr.classList.contains('on')) {
    if (scr.classList.contains('home') && +scr.dataset.stage !== S.stage) await goStage(+scr.dataset.stage);
    else show(scr.id, scr.classList.contains('home') ? 'left' : 'right');
    await wait(450);
  }
  if (scr) {
    const er = el.getBoundingClientRect(), br = scr.getBoundingClientRect();
    const foot = scr.id === 'home-live' ? 84 : 8;
    const visible = er.top >= br.top + 8 && er.bottom <= br.bottom - foot * fitScale();
    if (!visible || at != null) { scrollIntoViewIn(el, at ?? 0.3); await wait(700); }
  }
  return el;
}

async function tap(sel, pause = 500) {
  await gate();
  const el = await reveal(sel);
  ringAt(el);
  await wait(160);
  el.click();
  await wait(pause);
}

async function choose(sel, value, pause = 450) {
  await gate();
  const el = await reveal(sel);
  ringAt(el);
  el.classList.add('focus');
  await wait(380);
  el.value = value;
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.classList.remove('focus');
  await wait(pause);
}

async function type(sel, text) {
  await gate();
  const el = await reveal(sel);
  ringAt(el);
  el.classList.add('focus');
  el.value = '';
  for (const ch of text) { el.value += ch; await wait(42); }
  el.classList.remove('focus');
  await wait(220);
}

async function slide(sel, to) {
  await gate();
  const el = await reveal(sel);
  ringAt(el);
  const from = +el.value;
  for (let i = 1; i <= 14; i++) {
    el.value = Math.round(from + ((to - from) * i) / 14);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(45);
  }
  await wait(500);
}

async function script() {
  // ── 01 BEFORE (~19s) ──
  await gate();
  await goStage(0);
  await wait(2600);
  await tap('#q-register', 600);
  await choose('#r-variant', 'pro');
  await tap('#r-budget [data-i="1"]', 250);
  await type('#r-name', 'Aisyah Rahman');
  await type('#r-email', 'aisyah@mail.my');
  await tap('#r-submit', 1200);
  await tap('#register .done-back', 500);
  await tap('#q-question', 500);
  await tap('#q-chips .chip', 350);
  await tap('#q-submit', 1100);
  await tap('#question .done-back', 500);
  await tap('#q-seat', 500);
  await tap('#s-confirm', 1300);
  await tap('#reserve .done-back', 700);

  // ── 02 LIVE (~30s) ──
  await tap('#skip-live', 0);
  while (!$('.hs.show:last-child')) await sleep(100);
  await wait(400);
  for (const id of ['lights', 'wheels', 'cabin', 'charge']) await tap(`.hs[data-hs="${id}"]`, 1400);
  closeSheets();
  await wait(400);
  await tap('.sw[data-p="ember"]', 1100);
  await tap('.sw[data-p="night"]', 900);
  await tap('.sw[data-p="ember"]', 600);
  for (const r of ['🔥', '🔥', '❤️', '🤯']) await tap(`.rx[data-rx="${r}"]`, 140);
  await tap('.poll-opt[data-id="pro"]', 1400);
  await tap('#ask', 600);
  await tap('#qs [data-q="range"]', 0);
  while (chatBusy) await sleep(100);
  await wait(1300);
  await tap('#back', 500);
  await tap('#t-finance', 600);
  await slide('#f-dep-range', 30);
  await choose('#f-term', '5', 800);
  await tap('#finance .done-back', 500);
  await tap('#t-drive', 600);
  await tap('#dates [data-i="3"]', 250);
  await tap('#dealers [data-id="kl"]', 250);
  await tap('#d-confirm', 1300);
  await tap('#to-after', 0);

  // ── 03 AFTER (~11s) ──
  await wait(3000);
  await reveal('#explored', 0.08);
  await wait(1800);
  await reveal('.dealer-c', 0.08);
  await wait(1500);
  await tap('#share-btn', 3200);
  await tap('#share-close', 900);
}

// A real touch takes over; the chip itself toggles.
$('#screen').addEventListener('pointerdown', (e) => {
  if (!e.isTrusted || e.target.closest('#auto-chip')) return;
  setPaused(true);
}, true);
$('#screen').addEventListener('wheel', () => setPaused(true), { passive: true, capture: true });
chip.addEventListener('click', () => {
  if (AP.paused) { AP.manual = false; closeSheets(); $('#share').classList.remove('on'); setPaused(false); }
  else setPaused(true);
});

// ?auto=0 opens the demo hands-on.
if (new URLSearchParams(location.search).get('auto') === '0') { AP.manual = true; setPaused(true); }
(async () => {
  await sleep(600);
  await script();
  await wait(1200);
  location.reload();
})();
