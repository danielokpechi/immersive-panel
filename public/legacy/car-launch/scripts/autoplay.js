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
  // After a hands-on detour, bring back the stage this step belongs to.
  const view = el.closest('.view');
  if (view && !view.classList.contains('on')) { await goStage(+view.dataset.stage); await wait(500); }
  const box = el.closest('.feed, .view');
  if (box) {
    const er = el.getBoundingClientRect(), br = box.getBoundingClientRect();
    const visible = er.top >= br.top + 8 && er.bottom <= br.bottom - (box.id === 'feed' ? 80 : 8);
    if (!visible || at != null) { scrollIntoViewIn(el, at ?? 0.22); await wait(700); }
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
  // ── 01 BEFORE (~17s) ──
  await gate();
  await goStage(0);
  await wait(2800);
  await reveal('#sec-register', 0.04);
  await choose('#r-variant', 'pro');
  await tap('#r-budget [data-i="1"]', 300);
  await type('#r-name', 'Aisyah Rahman');
  await type('#r-email', 'aisyah@mail.my');
  await tap('#r-submit', 1300);
  await reveal('#sec-question', 0.04);
  await tap('#q-chips .chip', 450);
  await tap('#q-submit', 1300);
  await reveal('#sec-reserve', 0.04);
  await tap('#s-confirm', 1500);

  // ── 02 DURING (~30s) ──
  await tap('#skip-live', 0);
  while (!$('.hs.show:last-child')) await sleep(100);
  await wait(400);
  for (const id of ['lights', 'wheels', 'cabin', 'charge']) await tap(`.hs[data-hs="${id}"]`, 1500);
  closeSheets();
  await wait(400);
  await tap('.sw[data-p="ember"]', 1200);
  await tap('.sw[data-p="night"]', 1000);
  await tap('.sw[data-p="ember"]', 700);
  for (const r of ['🔥', '🔥', '❤️', '🤯']) await tap(`.rx[data-rx="${r}"]`, 140);
  await tap('.poll-opt[data-id="pro"]', 1300);
  await tap('#ask', 600);
  await tap('#qs [data-q="range"]', 0);
  while (chatBusy) await sleep(100);
  await wait(1500);
  closeSheets();
  await wait(300);
  await reveal('#sec-finance', 0.02);
  await slide('#f-dep-range', 30);
  await choose('#f-term', '5', 900);
  await reveal('#sec-drive', 0.02);
  await tap('#dates [data-i="3"]', 300);
  await tap('#dealers [data-id="kl"]', 300);
  await tap('#d-confirm', 1400);
  await tap('#to-after', 0);

  // ── 03 AFTER (~12s) ──
  await wait(3200);
  await reveal('#v-after .sec:nth-child(3)', 0.04);
  await wait(1800);
  await reveal('#v-after .sec:nth-child(4)', 0.04);
  await wait(1600);
  await tap('#share-btn', 3400);
  await tap('#share-close', 1000);
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
