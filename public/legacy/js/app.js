// ═══════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════

const SCREENS_CFG = {
  'splash':           {nav:false, t:'fade'},
  'sign-up':          {nav:false, t:'right'},
  'onboarding-1':     {nav:false, t:'right'},
  'onboarding-2':     {nav:false, t:'right'},
  'onboarding-3':     {nav:false, t:'right'},
  'home-inactive':    {nav:true, active:'home', live:false, t:'takeover'},
  'reads':            {nav:true, active:'home', live:false, t:'right'},
  'shop-inactive':    {nav:true, active:'shop', live:false, t:'right'},
  'profile-inactive': {nav:true, active:'me',   live:false, t:'right'},
  'quests-inactive':  {nav:true, active:'home', live:false, t:'right'},
  'home-pre-match':   {nav:true,  active:'home', live:true,  t:'takeover'},
  'iris-card-1':      {nav:false, t:'right'},
  'iris-card-2':      {nav:false, t:'right'},
  'iris-card-3':      {nav:false, t:'right'},
  'iris-card-4':      {nav:false, t:'right'},
  'iris-card-5':      {nav:false, t:'right'},
  'predictions':      {nav:true, active:'home', live:true,  t:'right'},
  'chat-pre-match':   {nav:false, t:'right'},
  'home-live':        {nav:true,  active:'home', live:true,  t:'fade'},
  'live-timeline':    {nav:false, t:'right'},
  'goal-scored':      {nav:false, t:'takeover'},
  'chat-live':        {nav:false, t:'right'},
  'home-halftime':          {nav:true,  active:'home', live:true,  t:'fade'},
  'iris-halftime-summary':  {nav:false, t:'up'},
  'food-ordering':          {nav:false, t:'right'},
  'order-confirmation':     {nav:false, t:'right'},
  'bathroom-queue':         {nav:false, t:'right'},
  'predictions-halftime':   {nav:false, t:'right'},
  'chat-halftime':          {nav:false, t:'right'},
  'sponsor-deals':          {nav:false, t:'right'},
  'halftime-quest':         {nav:false, t:'up'},
  'polls-quizzes':          {nav:false, t:'right'},
  'matchday-xp':            {nav:false, t:'right'},
  'quests-active':          {nav:true, active:'home', live:false, t:'right'},
  'shop-post-match':    {nav:true, active:'shop', live:false, t:'right'},
  'iris-default':       {nav:false, t:'up'},
  'iris-pre-match':     {nav:false, t:'up'},
  'iris-conversation':  {nav:false, t:'up'},
  'iris-goal-reaction': {nav:false, t:'up'},
  'iris-var':           {nav:false, t:'up'},
  'home-post-match':    {nav:true,  active:'home', live:false, t:'fade'},
  'profile-full':           {nav:true,  active:'me', t:'right'},
  'match-history-detail':   {nav:false, t:'right'},
  'tier-status':            {nav:false, t:'right'},
  'tier-unlock':            {nav:false, t:'takeover'},
  'quest-detail':           {nav:false, t:'right'},
  'rewards-screen':         {nav:false, t:'right'},
  'reward-claim':           {nav:false, t:'right'},
  'product-detail':     {nav:false, t:'right'},
  'matchday-drops':     {nav:false, t:'right'},
  'offer-detail':       {nav:false, t:'right'},
  'floor-plan':         {nav:false, t:'right'},
  'floor-plan-detail':  {nav:false, t:'right'},
  'matchday-schedule':  {nav:false, t:'up'},
  'announcements':      {nav:false, t:'up'},
  'matchday-recap':     {nav:false, t:'right'},
  'rewards-unlock':     {nav:false, t:'takeover'},
  'photo-pool-upload':  {nav:false, t:'right'},
  'photo-pool-browse':  {nav:false, t:'right'},
  'iris-post-match':    {nav:false, t:'up'},
  'next-match-teaser':  {nav:false, t:'right'},
  'profile-updated':    {nav:false, t:'right'},
};

let curScreen = null;
const navStack = [];
let matchState = 'inactive';

function navigate(sid, tOverride, skipStack) {
  if (!sid) return;
  try {
    const cfg = SCREENS_CFG[sid] || {nav:true, active:'home', live:false, t:'right'};
    const el = document.getElementById('screen-' + sid);
    if (!el) {
      console.warn('No screen:', sid);
      const fb = curScreen || 'home-inactive';
      const fbEl = document.getElementById('screen-' + fb);
      if (fbEl && !fbEl.classList.contains('active')) {
        fbEl.style.display = 'block';
        fbEl.classList.add('active');
      }
      return;
    }
    const t = tOverride || cfg.t || 'right';

    if (!skipStack && curScreen && curScreen !== sid) navStack.push(curScreen);

    const prev = curScreen ? document.getElementById('screen-' + curScreen) : null;

    el.style.display = 'block';
    el.style.zIndex = '2';
    el.classList.remove('anim-right','anim-left','anim-up','anim-fade','anim-takeover');
    void el.offsetWidth;
    el.classList.add('anim-' + t);
    el.classList.add('active');

    const dur = ['up','takeover'].includes(t) ? 420 : 320;
    setTimeout(() => {
      try {
        if (prev && prev !== el) {
          prev.classList.remove('active');
          prev.style.zIndex = '';
          prev.style.display = '';
        }
        el.classList.remove('anim-right','anim-left','anim-up','anim-fade','anim-takeover');
        el.style.zIndex = '';
        el.style.display = 'block';
        if (!el.classList.contains('active')) el.classList.add('active');
      } catch(e2) { console.error('navigate timeout err:', e2); }
    }, dur);

    curScreen = sid;
    const _dbg = document.getElementById('debug-screen-name');
    if (_dbg) _dbg.textContent = sid;

    // Persistent top-right cluster: show on hub/content screens (cfg.nav),
    // hide on the auth flow, full-screen takeovers, and the chat/iris
    // screens themselves (you're already there).
    const top = document.getElementById('shell-top');
    if (top) {
      top.classList.toggle('off', !cfg.nav);
      // dim whichever entry you're currently inside
      const chatBtn = top.querySelector('[data-nav="chat"]');
      const irisBtn = top.querySelector('[data-nav="iris"]');
      if (chatBtn) chatBtn.classList.toggle('on', /chat/.test(sid));
      if (irisBtn) irisBtn.classList.toggle('on', sid.startsWith('iris'));
    }

    // Global back: show on any non-root screen that doesn't already carry its
    // own inline back control — so nothing is ever a dead end.
    const back = document.getElementById('shell-back');
    if (back) {
      const isRoot = /^(home-|splash$|sign-up$|onboarding)/.test(sid);
      // Any existing exit counts — a back-arrow, or a Close/Done that calls
      // goBack() or routes to a home screen. Only truly exit-less screens get
      // the global back, so we never double up or overlap a header.
      const hasInlineBack = !!el.querySelector('.back-arrow, .home-nav-back, [onclick*="goBack"], [onclick*="navigate(\'home"]');
      back.classList.toggle('off', isRoot || hasInlineBack);
    }

    document.querySelectorAll('.overlay').forEach(o => { o.classList.remove('vis'); o.style.display = 'none'; });

    if (sid === 'splash') {
      setTimeout(() => { if (curScreen === 'splash') navigate('sign-up','fade'); }, 2000);
    }
    if (sid === 'home-pre-match') {
      pmGo(1);
      if (!window._questToastShown) {
        window._questToastShown = true;
        setTimeout(() => { if (curScreen === 'home-pre-match') showOverlay('quest-toast'); }, 3000);
      }
    }
    if (sid === 'goal-scored') {
      setTimeout(() => { if (curScreen === 'goal-scored') showOverlay('scorer-card'); }, 5000);
    }
    if (sid === 'home-live' || sid === 'home-pre-match' || sid === 'home-halftime') {
      matchState = sid.replace('home-','');
    }
  } catch(err) {
    console.error('navigate error for', sid, ':', err);
    // Last-resort: make sure SOME screen is visible
    const el = document.getElementById('screen-' + sid);
    if (el) { el.style.display = 'block'; el.classList.add('active'); }
    curScreen = sid;
  }
}

function goBack(fallback) {
  if (navStack.length > 0) {
    const prev = navStack.pop();
    navigate(prev, 'left', true);
  } else {
    navigate(fallback || 'home-inactive', 'left', true);
  }
}

// ── NAV HOME (context-aware) ──
function rcGo(n) {
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById('rc-' + i);
    if (el) el.style.display = i === n ? 'flex' : 'none';
  }
}
function pmGo(n) {
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById('pm-c-' + i);
    if (el) el.style.display = i === n ? 'flex' : 'none';
  }
}

// ── Card expand / share ────────────────────────────────────────────────────
let _cardN = 1;
const _cardImgs = [
  "man city images /Poster MatchDay Champions League.jpeg",
  "man city images /POSTER FOOTBALL MANCHESTER CITY.jpeg",
  "man city images /manchester city.jpeg",
  "man city images /156148312077197062.jpeg",
  // post-match recap cards (index 4-8)
  "man city images /25614291625815684.jpeg",
  "man city images /Erling Haaland _ Manchester City _ Fútbol _ Wallpaper _ By @livtorresec.jpeg",
  "man city images /100557004175719940.jpeg",
  "man city images /Rayan Cherki Manchester City 2026.jpeg",
  "man city images /223068987790622209.jpeg"
];
const _cardLabels = ["Today's Fixture", "IRIS Prediction", "Team News", "Form Guide"];
const _cardTitles = ["Man City vs Real Madrid", "City 2–0  ·  72%", "4–3–3 confirmed.", "City: WWWDW"];
const _cardSubs   = ["Premier League · Etihad · 15:00", "Clean sheet · Haaland 27 goals this season", "Haaland starts · Foden in · Saka out (ARS)", "Real Madrid: WDLWD · City in strong form"];
const _cardShare  = [
  "Man City vs Real Madrid today, 15:00 at the Etihad 💙⚽ #ManCity #MCIARS",
  "IRIS says: City 2-0 Real Madrid, 72% win probability 🔮 #ManCity #ImmersivePanel",
  "Team news: 4-3-3 confirmed, Haaland starts! 💪🔵 #ManCity #MCIARS",
  "City's form: W W W D W 🔥 Ready for Real Madrid! #ManCity"
];

function openCardFull(n) {
  _cardN = n;
  const img = document.getElementById('card-full-img');
  const lbl = document.getElementById('card-full-label');
  const ttl = document.getElementById('card-full-title');
  const sub = document.getElementById('card-full-sub');
  if (img) img.src = _cardImgs[n-1];
  if (lbl) lbl.textContent = _cardLabels[n-1];
  if (ttl) ttl.textContent = _cardTitles[n-1];
  if (sub) sub.textContent = _cardSubs[n-1];
  // update active dot
  document.querySelectorAll('.fc-dot').forEach((d,i) => {
    d.style.background = i === n-1 ? '#fff' : 'rgba(255,255,255,0.3)';
    d.style.width = i === n-1 ? '18px' : '7px';
    d.style.borderRadius = i === n-1 ? '4px' : '50%';
  });
  showOverlay('card-full');
}
function fullCardNav(n) {
  _cardN = n;
  openCardFull(n);
}
function shareCurrentCard() {
  const text = _cardShare[_cardN - 1];
  if (navigator.share) {
    navigator.share({ title: 'Man City vs Real Madrid', text, url: window.location.href }).catch(()=>{});
  } else {
    window._shareText = text;
    showOverlay('share-sheet');
  }
}
function openShare(platform) {
  const text = window._shareText || _cardShare[_cardN-1];
  const enc  = encodeURIComponent(text);
  const url  = encodeURIComponent(window.location.href);
  if (platform === 'twitter')   window.open('https://twitter.com/intent/tweet?text=' + enc, '_blank');
  else if (platform === 'whatsapp') window.open('https://wa.me/?text=' + enc, '_blank');
  else if (platform === 'instagram') alert('Screenshot this card and share to Instagram Stories!');
  else if (platform === 'copy') {
    navigator.clipboard.writeText(text + ' ' + window.location.href).then(() => alert('Copied to clipboard!')).catch(()=>{});
  }
  hideOverlay('share-sheet');
}

function navHome() {
  if (matchState === 'pre-match') navigate('home-pre-match');
  else if (matchState === 'live') navigate('home-live');
  else if (matchState === 'halftime') navigate('home-halftime');
  else if (matchState === 'post-match') navigate('home-post-match');
  else navigate('home-inactive');
}
function navShop() {
  if (matchState === 'post-match') navigate('shop-post-match', 'right');
  else navigate('shop-inactive', 'right');
}
function navMe() {
  if (matchState === 'post-match') navigate('profile-updated', 'right');
  else navigate('profile-inactive', 'right');
}

// ── START MATCHDAY ──
function startMatchday() {
  matchState = 'pre-match';
  navigate('home-pre-match', 'takeover');
}

// ── NAV CHAT (context-aware) ──
function navChat() {
  if (matchState === 'halftime') navigate('chat-halftime', 'right');
  else if (matchState === 'live') navigate('chat-live', 'right');
  else if (matchState === 'pre-match') navigate('chat-pre-match', 'right');
  else navigate('chat-pre-match', 'right');
}

// ── FOOD QTY ──
const _qty = {};
let currentPickup = 'halftime';
function quizAnswer(el, correct) {
  const container = el.parentElement;
  container.querySelectorAll('div').forEach(d => {
    d.style.pointerEvents = 'none';
    d.style.opacity = '0.5';
  });
  if (correct) {
    el.style.background = 'rgba(34,197,94,0.2)';
    el.style.borderColor = 'rgba(34,197,94,0.5)';
    el.style.opacity = '1';
    el.innerHTML = el.innerHTML + ' <span style="color:#22c55e;font-size:11px;font-weight:700;">✓ Correct! +50 XP</span>';
  } else {
    el.style.background = 'rgba(239,68,68,0.15)';
    el.style.borderColor = 'rgba(239,68,68,0.35)';
    el.style.opacity = '1';
    el.innerHTML = el.innerHTML + ' <span style="color:#ef4444;font-size:11px;">✗</span>';
    container.querySelectorAll('div')[1].style.background = 'rgba(34,197,94,0.2)';
    container.querySelectorAll('div')[1].style.borderColor = 'rgba(34,197,94,0.5)';
    container.querySelectorAll('div')[1].style.opacity = '1';
  }
}
function setPickup(mode) {
  currentPickup = mode;
  const seat = document.getElementById('pickup-seat');
  const ht = document.getElementById('pickup-halftime');
  const btn = document.getElementById('place-order-btn');
  if (seat && ht) {
    if (mode === 'halftime') {
      ht.style.background = 'rgba(108,171,221,0.1)'; ht.style.border = '1.5px solid rgba(108,171,221,0.4)';
      ht.querySelector('div').style.color = '#6CABDD';
      seat.style.background = 'rgba(255,255,255,0.04)'; seat.style.border = '1px solid rgba(255,255,255,0.1)';
      seat.querySelector('div').style.color = 'rgba(255,255,255,0.5)';
      if (btn) btn.textContent = 'Order for Halftime Pickup →';
    } else {
      seat.style.background = 'rgba(108,171,221,0.1)'; seat.style.border = '1.5px solid rgba(108,171,221,0.4)';
      seat.querySelector('div').style.color = '#6CABDD';
      ht.style.background = 'rgba(255,255,255,0.04)'; ht.style.border = '1px solid rgba(255,255,255,0.1)';
      ht.querySelector('div').style.color = 'rgba(255,255,255,0.5)';
      if (btn) btn.textContent = 'Place Order — Seat Delivery →';
    }
  }
}
function adjustQty(item, delta) {
  _qty[item] = Math.max(0, (_qty[item] || 0) + delta);
  const el = document.getElementById('qty-' + item + '-val');
  if (el) el.textContent = _qty[item];
}

// ── HALFTIME QUEST ──
const _ratingLabels = ['','Not great','Decent','Good match','Exciting!','Unreal!'];
function setRating(n) {
  const stars = document.querySelectorAll('#screen-halftime-quest [onclick^="setRating"]');
  stars.forEach((s, i) => { s.style.opacity = i < n ? '1' : '0.35'; });
  const lbl = document.getElementById('rating-label');
  if (lbl) lbl.textContent = _ratingLabels[n] || '';
}
function selectMood(el) {
  const siblings = el.parentElement.querySelectorAll('[onclick^="selectMood"]');
  siblings.forEach(s => {
    s.style.background = 'rgba(255,255,255,0.05)';
    s.style.border = '1px solid rgba(255,255,255,0.1)';
    s.style.color = 'rgba(255,255,255,0.7)';
  });
  el.style.background = 'rgba(108,171,221,0.12)';
  el.style.border = '1.5px solid #6CABDD';
  el.style.color = '#fff';
}

// ── SCORE PICKER ──
function adjustScore(team, delta) {
  const el = document.getElementById('score-' + team);
  if (!el) return;
  const v = Math.max(0, Math.min(9, parseInt(el.textContent) + delta));
  el.textContent = v;
}

// ── OVERLAYS ──
function showOverlay(id) {
  const el = document.getElementById('overlay-' + id);
  if (!el) return;
  el.style.display = 'block';
  void el.offsetWidth;
  el.classList.add('vis');
}
function hideOverlay(id) {
  const el = document.getElementById('overlay-' + id);
  if (!el) return;
  el.classList.remove('vis');
  setTimeout(() => { if (!el.classList.contains('vis')) el.style.display = 'none'; }, 50);
}

// Order Food — open the club's own ordering site inside the panel (a
// wrapper / in-app browser), not a native re-build. Loads lazily.
function openFoodWrapper() {
  const f = document.getElementById('food-frame');
  if (f && !f.getAttribute('src')) f.setAttribute('src', 'partner-food.html');
  showOverlay('food-wrapper');
}

// ── FLASH BANNERS ─────────────────────────────────────────────
// Transient pop-ups over the feed. Match moments flash up and clear
// (~5.5s) so a busy chat never buries them; a flash sale rides its own
// countdown; a club announcement waits for a manual close. Placement
// hugs the top of the chat feed, else sits just under the status bar.
function _flashTop() { return /^chat/.test(curScreen || '') ? 150 : 58; }
function _mmss(s) { const m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }

function dismissBanner(card) {
  if (!card || card._dismissed) return;
  card._dismissed = true;
  if (card._timer) clearTimeout(card._timer);
  if (card._interval) clearInterval(card._interval);
  card.classList.remove('in');
  card.classList.add('out');
  setTimeout(() => { try { card.remove(); } catch (e) {} }, 340);
}

// Low-level: mount a banner card and animate it in. Returns the element.
function _banner(o) {
  const stack = document.getElementById('flash-stack');
  if (!stack) return null;
  stack.style.top = _flashTop() + 'px';
  // only one of each variant at a time
  stack.querySelectorAll('.fc-' + o.variant).forEach(dismissBanner);
  const card = document.createElement('div');
  card.className = 'flash-card fc-' + o.variant;
  card.innerHTML =
    '<div class="flash-ic">' + o.ic + '</div>' +
    '<div class="flash-body">' +
      '<div class="flash-kicker">' + o.kicker + '</div>' +
      '<div class="flash-title">' + o.title + '</div>' +
      (o.sub ? '<div class="flash-sub">' + o.sub + '</div>' : '') +
    '</div>' +
    (o.right || '') +
    (o.progress ? '<div class="flash-prog"></div>' : '');
  stack.appendChild(card);
  requestAnimationFrame(() => card.classList.add('in'));
  return card;
}

// Match moment — auto-dismisses; tap opens the deeper IRIS read.
function flashEvent(kind) {
  const M = {
    goal:   { variant: 'event',  ic: '⚽', kicker: 'Goal · 54\'',         title: 'Haaland scores!',        sub: 'Man City 1–0 · assisted by Foden', go: 'iris-goal-reaction' },
    var:    { variant: 'var',    ic: '📺', kicker: 'VAR Check · 31\'',     title: 'Possible handball',      sub: 'Under review · Rúben Dias',        go: 'iris-var' },
    yellow: { variant: 'yellow', ic: '🟨', kicker: 'Yellow Card · 44\'',   title: 'T. Partey booked',       sub: 'Cynical foul on Foden',            go: null },
    sub:    { variant: 'sub',    ic: '🔄', kicker: 'Substitution · 62\'',  title: 'B. Silva ↑  ·  Kovačić ↓', sub: 'Guardiola manages the game',      go: null },
  }[kind];
  if (!M) return;
  const card = _banner({ variant: M.variant, ic: M.ic, kicker: M.kicker, title: M.title, sub: M.sub, progress: true });
  if (!card) return;
  const ms = 5500;
  const prog = card.querySelector('.flash-prog');
  if (prog) {
    prog.style.transform = 'scaleX(1)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      prog.style.transition = 'transform ' + ms + 'ms linear';
      prog.style.transform = 'scaleX(0)';
    }));
  }
  card._timer = setTimeout(() => dismissBanner(card), ms);
  card.onclick = () => { dismissBanner(card); if (M.go) navigate(M.go, 'up'); };
}

// Flash sale — persists for a club-set timer, closable by the fan.
function flashSale(opts) {
  opts = opts || {};
  const secs0 = opts.secs || 120;
  const right =
    '<div class="flash-timer">' + _mmss(secs0) + '</div>' +
    '<button class="flash-close" onclick="event.stopPropagation();dismissBanner(this.closest(\'.flash-card\'))">✕</button>';
  const card = _banner({
    variant: 'flash', ic: opts.ic || '👕', kicker: opts.kicker || '⚡ Flash Sale',
    title: opts.title || 'Haaland #9 Home Shirt', sub: opts.sub || '£71.20 · was £89 · while it lasts', right: right,
  });
  if (!card) return;
  let s = secs0;
  const t = card.querySelector('.flash-timer');
  card._interval = setInterval(() => {
    s--; if (t) t.textContent = _mmss(Math.max(0, s));
    if (s <= 0) { clearInterval(card._interval); dismissBanner(card); }
  }, 1000);
  card.onclick = () => { dismissBanner(card); navigate('shop-inactive', 'right'); };
}

// Club announcement — no timer; manual close only.
function announce(opts) {
  opts = opts || {};
  const right = '<button class="flash-close" onclick="event.stopPropagation();dismissBanner(this.closest(\'.flash-card\'))">✕</button>';
  _banner({
    variant: 'announce', ic: opts.ic || '📣', kicker: opts.kicker || 'Club Announcement',
    title: opts.title || 'Half-time: 2-for-1 at the kiosks', sub: opts.sub || 'North Stand · concourse level', right: right,
  });
}

// Man of the Match — flashes up, stays until the fan votes (or closes).
function motmVote() {
  const stack = document.getElementById('flash-stack');
  if (!stack) return;
  stack.style.top = _flashTop() + 'px';
  stack.querySelectorAll('.fc-motm').forEach(dismissBanner);
  const opts = [['Haaland', 'Striker'], ['Rodri', 'Mid'], ['Foden', 'Wing']];
  const card = document.createElement('div');
  card.className = 'flash-card fc-motm';
  card.innerHTML =
    '<div class="motm-head">' +
      '<div class="flash-ic" style="background:rgba(201,168,76,0.16)">⭐</div>' +
      '<div class="flash-body"><div class="flash-kicker" style="color:#C9A84C">Man of the Match · vote now</div><div class="flash-title">Who won it for City?</div></div>' +
      '<button class="flash-close" onclick="dismissBanner(this.closest(\'.flash-card\'))">✕</button>' +
    '</div>' +
    '<div class="motm-opts">' +
      opts.map(o => '<div class="motm-opt" onclick="motmPick(this)"><div class="mo-name">' + o[0] + '</div><div class="mo-sub">' + o[1] + '</div></div>').join('') +
    '</div>';
  stack.appendChild(card);
  requestAnimationFrame(() => card.classList.add('in'));
}
function motmPick(el) {
  const card = el.closest('.flash-card');
  if (!card) return;
  card.querySelectorAll('.motm-opt').forEach(o => o.classList.remove('picked'));
  el.classList.add('picked');
  const title = card.querySelector('.flash-title');
  if (title) title.textContent = 'Voted: ' + el.querySelector('.mo-name').textContent + '  ·  +50 XP';
  setTimeout(() => dismissBanner(card), 900);
}

// ── SIMULATE ──
function toggleSim() {
  document.getElementById('sim-menu').classList.toggle('open');
  document.getElementById('sim-toggle').classList.toggle('open');
}
function simulate(evt) {
  document.getElementById('sim-menu').classList.remove('open');
  document.getElementById('sim-toggle').classList.remove('open');
  switch(evt) {
    case 'goto-inactive':  matchState='inactive'; navigate('home-inactive','takeover',true); break;
    case 'goto-pre-match': matchState='pre-match'; pmGo(1); navigate('home-pre-match','takeover',true); break;
    case 'kickoff':    matchState='live'; navigate('home-live','takeover'); break;
    // Match moments now flash up briefly over the feed instead of taking
    // over the screen or lingering as inline cards (per fan-view review).
    case 'goal':       flashEvent('goal'); break;
    case 'var':        flashEvent('var'); break;
    case 'sub':        flashEvent('sub'); break;
    case 'yellow':     flashEvent('yellow'); break;
    case 'motm':       motmVote(); break;
    case 'flash':      flashSale(); break;
    case 'announce':   announce(); break;
    case 'halftime':   matchState='halftime'; navigate('home-halftime','fade'); break;
    case 'second-half':matchState='live'; navigate('home-live','fade'); break;
    case 'fulltime':   matchState='post-match'; navigate('home-post-match','fade'); break;
  }
}

// ── AUTOPILOT ──
// Drives the original matchday on a timeline with no human input, so the
// panel reacts and shifts states on its own. Reuses the existing
// navigate()/showOverlay() flows verbatim. Loops for continuous demo.
let _autoTimers = [];
// controlled-fan handshake: once an operator syncs us we never self-run.
let _operatorSynced = false;
let _autopilotKick = 0;
function _at(t, fn) { _autoTimers.push(setTimeout(fn, t)); }
function startAutopilot() {
  // hide the dev sim FAB — this is a live panel, not the dev sandbox
  ['sim-toggle', 'sim-panel', 'sim-menu'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  _autoTimers.forEach(clearTimeout);
  _autoTimers = [];

  matchState = 'inactive';
  navigate('home-inactive', 'fade', true);

  // Events flash up as transient banners over the live view (no takeovers).
  _at(2200,  () => { matchState = 'pre-match'; navigate('home-pre-match', 'takeover', true); });
  _at(7000,  () => { matchState = 'live';      navigate('home-live', 'takeover'); });
  _at(10000, () => navigate('chat-live', 'up'));
  _at(12000, () => flashEvent('goal'));
  _at(19000, () => flashSale());
  _at(24000, () => flashEvent('var'));
  _at(30000, () => { matchState = 'halftime'; navigate('home-halftime', 'fade'); });
  _at(33000, () => announce({ title: 'Half-time: 2-for-1 at the kiosks', sub: 'North Stand · concourse level' }));
  _at(37000, () => { matchState = 'live'; navigate('chat-live', 'fade'); });
  _at(40000, () => flashEvent('sub'));
  _at(46000, () => flashEvent('goal'));
  _at(51000, () => motmVote());
  _at(57000, () => { matchState = 'post-match'; navigate('home-post-match', 'fade'); });
  _at(64000, () => startAutopilot()); // loop
}
window.startAutopilot = startAutopilot;

function stopAutopilot() {
  _autoTimers.forEach(clearTimeout);
  _autoTimers = [];
}

// ── CONTROL BRIDGE ──
// Lets the BoltOS control room drive this football panel live, exactly
// like the engine sports. Joins the same BroadcastChannel keyed by the
// panel id (?id=…), maps Commands to the existing simulate()/overlay
// flows, and echoes Telemetry back so the console stays in sync.
(function controlBridge() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) return;
  // 'post' mode: take commands from the parent window (React relays
  // cross-device Ably commands in). Otherwise join the BroadcastChannel
  // directly (same-browser: the control-room monitor).
  const usePost = params.get('bridge') === 'post';
  const bus = !usePost && typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('boltos:panel:' + id)
    : null;

  const ORDER = ['inactive', 'pre-match', 'live-1', 'halftime', 'live-2', 'post-match'];
  const META = {
    inactive:    { label: 'Pre-Match',  phase: 'idle',  clock: 'PRE-MATCH' },
    'pre-match': { label: 'Matchday',   phase: 'pre',   clock: 'MATCHDAY' },
    'live-1':    { label: 'First Half', phase: 'live',  clock: "23'" },
    halftime:    { label: 'Half Time',  phase: 'break', clock: 'HALF TIME' },
    'live-2':    { label: 'Second Half',phase: 'live',  clock: "67'" },
    'post-match':{ label: 'Full Time',  phase: 'post',  clock: 'FULL TIME' },
  };
  let cur = 'inactive';
  let half = 1;

  function go(state) {
    cur = state;
    switch (state) {
      case 'inactive':  matchState = 'inactive'; navigate('home-inactive', 'fade', true); break;
      case 'pre-match': matchState = 'pre-match'; navigate('home-pre-match', 'takeover', true); break;
      case 'live-1':    half = 1; matchState = 'live'; navigate('home-live', 'takeover'); break;
      case 'halftime':  matchState = 'halftime'; navigate('home-halftime', 'fade'); break;
      case 'live-2':    half = 2; matchState = 'live'; navigate('home-live', 'fade'); break;
      case 'post-match':matchState = 'post-match'; navigate('home-post-match', 'fade'); break;
    }
    telemetry();
  }

  function fire(type) {
    // Operator-driven events now flash up as transient banners on the fan
    // panel (match the in-app pop-up behaviour), not screen takeovers.
    switch (type) {
      case 'goal':     flashEvent('goal'); break;
      case 'var':      flashEvent('var'); break;
      case 'sub':      flashEvent('sub'); break;
      case 'yellow':   flashEvent('yellow'); break;
      case 'motm':     motmVote(); break;
      case 'flash':    flashSale(); break;
      case 'announce': announce(); break;
      default: break;
    }
  }

  // Track module on/off so the control room's toggles reflect real state.
  const MODS = ['chat', 'ai-qa', 'store', 'highlights', 'predictions', 'polls', 'leaderboard', 'moderation', 'betting'];
  const modState = {};
  MODS.forEach((m) => (modState[m] = true));
  function setModule(mod, on) {
    modState[mod] = on;
    document.querySelectorAll('[data-feature="' + mod + '"]').forEach((el) => {
      el.style.display = on ? '' : 'none';
    });
  }

  function curStateFromScreen() {
    if (curScreen === 'home-inactive') return 'inactive';
    if (curScreen === 'home-pre-match') return 'pre-match';
    if (curScreen === 'home-halftime') return 'halftime';
    if (curScreen === 'home-post-match') return 'post-match';
    if (curScreen === 'home-live' || curScreen === 'goal-scored') return half === 2 ? 'live-2' : 'live-1';
    return cur;
  }

  function telemetry() {
    const sid = curStateFromScreen();
    const m = META[sid] || META.inactive;
    const payload = {
      type: 'state', stateId: sid, stateLabel: m.label, phase: m.phase,
      clockLabel: m.clock, simMs: 0, running: _autoTimers.length > 0,
      mode: _autoTimers.length > 0 ? 'auto' : 'manual', speed: 60,
      enabledModules: MODS.filter((x) => modState[x] !== false),
    };
    if (usePost) { try { window.parent.postMessage(payload, '*'); } catch (e) {} }
    else if (bus) bus.postMessage(payload);
  }

  function applyCommand(c) {
    if (!c || c.type === 'state') return;
    switch (c.type) {
      case 'setMode': c.mode === 'auto' ? startAutopilot() : stopAutopilot(); telemetry(); break;
      case 'play': startAutopilot(); break;
      case 'pause': stopAutopilot(); telemetry(); break;
      case 'restart': startAutopilot(); break;
      case 'jumpState': stopAutopilot(); go(c.stateId); break;
      case 'advance': { const i = ORDER.indexOf(curStateFromScreen()); if (ORDER[i + 1]) { stopAutopilot(); go(ORDER[i + 1]); } break; }
      case 'fireEvent': fire(c.event && c.event.type); break;
      case 'setModule': setModule(c.module, c.on); break;
      case 'requestState': telemetry(); break;
      // late-join: snap to the operator's current state. If the operator is
      // driving manually, cancel our own demo so we follow them, not autopilot.
      case 'sync':
        if (c.mode === 'manual') {
          _operatorSynced = true;
          clearTimeout(_autopilotKick);
          stopAutopilot();
        }
        if (c.stateId && c.stateId !== curStateFromScreen()) go(c.stateId);
        if (c.modules) Object.keys(c.modules).forEach((m) => setModule(m, c.modules[m]));
        break;
      default: break;
    }
  }

  if (usePost) {
    window.addEventListener('message', (e) => applyCommand(e.data));
  } else if (bus) {
    bus.onmessage = (e) => applyCommand(e.data);
  }

  // periodic telemetry so the console mirrors autopilot progression
  setInterval(telemetry, 1500);
})();

// ── ONBOARDING GESTURES ──
let _tx = 0;
const OB = ['onboarding-1','onboarding-2','onboarding-3'];
const IC = ['iris-card-1','iris-card-2','iris-card-3','iris-card-4','iris-card-5'];

function addSwipe(el, onLeft, onRight) {
  el.addEventListener('touchstart', e => { _tx = e.touches[0].clientX; }, {passive:true});
  el.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - _tx;
    if (Math.abs(dx) < 40) return;
    dx < 0 ? onLeft && onLeft() : onRight && onRight();
  }, {passive:true});
}

const SCREEN_PARTIALS = [
  'screens/auth.html',
  'screens/home-inactive.html',
  'screens/pre-match.html',
  'screens/iris-cards.html',
  'screens/live.html',
  'screens/halftime-post.html',
  'screens/post-misc.html',
  'screens/stadium.html',
  'screens/profile-rewards.html',
  'screens/iris-screens.html',
  'screens/halftime-extras.html',
];

// ── Per-team reskin ──
// The prototype is built for Man City; ?team / ?opp / ?color reskin it for
// another club by swapping the names and the brand blue throughout the
// markup (and a CSS override for rules in the stylesheet).
const TEAM = (function () {
  const p = new URLSearchParams(location.search);
  const hex = p.get('color');
  let rgb = '108,171,221';
  if (hex && /^[0-9a-f]{6}$/i.test(hex)) {
    rgb = `${parseInt(hex.slice(0, 2), 16)},${parseInt(hex.slice(2, 4), 16)},${parseInt(hex.slice(4, 6), 16)}`;
  }
  const imgs = (p.get('imgs') || '').split('|').filter(Boolean);
  let names = null;
  try { names = JSON.parse(p.get('names') || 'null'); } catch (e) { names = null; }
  // apply longest keys first so "Bernardo Silva" wins over "Silva", etc.
  const nameKeys = names ? Object.keys(names).sort((a, b) => b.length - a.length) : [];
  return { team: p.get('team'), opp: p.get('opp'), color: hex ? '#' + hex : null, rgb, imgs, names, nameKeys };
})();

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function reskin(html) {
  if (!TEAM.team) return html;
  let out = html;
  // 1) swap the baked-in Man City PHOTOS (.jpeg) for the team's pool, cycling.
  //    The transparent crest (.png) is left alone.
  if (TEAM.imgs.length) {
    let i = 0;
    out = out.replace(/(man%20city%20images%20|man city images )\/[^"')]+\.jpe?g/gi, () => TEAM.imgs[i++ % TEAM.imgs.length]);
  }
  // 2) per-club names: players, manager, venue, abbreviation.
  for (const k of TEAM.nameKeys) {
    out = out.replace(new RegExp(escapeRe(k), 'g'), TEAM.names[k]);
  }
  // 3) team / opponent / generic "City" → team name. One pass over all variants
  //    so the inserted name (which may itself contain "City") isn't re-matched.
  out = out.replace(/Manchester City|Man City|\bCity\b/g, () => TEAM.team);
  if (TEAM.opp) out = out.replace(/Real Madrid/g, TEAM.opp);
  // 3) brand colour.
  if (TEAM.color) {
    out = out.replace(/#6CABDD/gi, TEAM.color).replace(/108,\s*171,\s*221/g, TEAM.rgb);
  }
  return out;
}

function applyTeamColorCss() {
  if (!TEAM.color) return;
  const s = document.createElement('style');
  s.textContent = `
    .ni.on{color:${TEAM.color}!important;}
    #shell-iris{background:${TEAM.color}!important;}
    .sb.blue{background:rgba(${TEAM.rgb},0.12)!important;border-color:rgba(${TEAM.rgb},0.25)!important;color:${TEAM.color}!important;}
    .ph-badge{color:${TEAM.color}!important;background:rgba(${TEAM.rgb},0.1)!important;border-color:rgba(${TEAM.rgb},0.2)!important;}`;
  document.head.appendChild(s);
}

async function loadAllScreens() {
  const mount = document.getElementById('screens-mount');
  applyTeamColorCss();
  for (const file of SCREEN_PARTIALS) {
    try {
      const res = await fetch(file);
      if (!res.ok) { console.error('[screens] failed to load:', file, res.status); continue; }
      const html = reskin(await res.text());
      mount.insertAdjacentHTML('beforeend', html);
    } catch (e) {
      console.error('[screens] error loading:', file, e);
    }
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadAllScreens();
  OB.forEach((id,i) => {
    const el = document.getElementById('screen-' + id);
    if (!el) return;
    addSwipe(el,
      () => { if (i < OB.length-1) navigate(OB[i+1],'right'); },
      () => { if (i > 0) navigate(OB[i-1],'left'); }
    );
    if (i < 2) {
      el.addEventListener('click', e => {
        if (e.target.closest('.ob-dot')) return;
        navigate(OB[i+1],'right');
      });
    }
  });
  IC.forEach((id,i) => {
    const el = document.getElementById('screen-' + id);
    if (!el) return;
    addSwipe(el,
      () => { if (i < IC.length-1) navigate(IC[i+1],'right'); },
      () => { if (i > 0) navigate(IC[i-1],'left'); else navigate('home-pre-match','left',true); }
    );
  });

  // initial route — autopilot only for the auto demo; a controlled panel
  // (has an id) waits at pre-match for the operator; otherwise show splash.
  const _p = new URLSearchParams(location.search);
  const _START_SCREEN = {
    inactive: 'home-inactive', 'pre-match': 'home-pre-match', 'live-1': 'home-live',
    halftime: 'home-halftime', 'live-2': 'home-live', 'post-match': 'home-post-match',
  };
  if (_p.get('bridge') === 'post') {
    // Controlled fan: show a holding screen, tell the parent we're ready (so it
    // can ask the operator to sync us), and wait briefly. If nobody is driving,
    // fall back to the self-running demo so a standalone fan still sees a match.
    navigate(_START_SCREEN[_p.get('start')] || 'home-inactive', 'fade', true);
    try { window.parent.postMessage({ type: '__ready' }, '*'); } catch (e) {}
    if (_p.has('auto')) {
      _autopilotKick = setTimeout(function () { if (!_operatorSynced) startAutopilot(); }, 1600);
    }
  } else if (_p.has('auto')) {
    startAutopilot();
  } else if (_p.get('id')) {
    navigate(_START_SCREEN[_p.get('start')] || 'home-inactive', 'fade', true);
  } else {
    navigate('splash', 'fade', true);
  }
});

/* ── LIGHT MODE TOGGLE ── */
function toggleLightMode() {
  const on = document.body.classList.toggle('light-mode');
  localStorage.setItem('immersive_light_mode', on ? '1' : '0');
  const track = document.getElementById('lm-track');
  const thumb = document.getElementById('lm-thumb');
  const label = document.getElementById('lm-label');
  if (track) track.style.background = on ? '#6CABDD' : 'rgba(255,255,255,0.12)';
  if (thumb) thumb.style.transform  = on ? 'translateX(18px)' : 'translateX(2px)';
  if (label) label.textContent      = on ? 'Light mode' : 'Dark mode';
}
(function applyStoredTheme() {
  if (localStorage.getItem('immersive_light_mode') === '1') {
    document.body.classList.add('light-mode');
    // sync toggle visuals once DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
      const track = document.getElementById('lm-track');
      const thumb = document.getElementById('lm-thumb');
      const label = document.getElementById('lm-label');
      if (track) track.style.background = '#6CABDD';
      if (thumb) thumb.style.transform  = 'translateX(18px)';
      if (label) label.textContent      = 'Light mode';
    });
  }
})();

/* ── HOME-NAV MODE TOGGLE ── */
function toggleHomeNav() {
  const on = document.body.classList.toggle('home-nav');
  localStorage.setItem('immersive_home_nav', on ? '1' : '0');
  _syncHomeNavBtn();
  // Adjust scrollable containers to extend to bottom when no bar
  document.querySelectorAll('[data-ns]').forEach(el => {
    el.style.bottom = on ? '0' : '';
  });
}

function _syncHomeNavBtn() {
  const on = document.body.classList.contains('home-nav');
  const btn = document.getElementById('sim-nav-btn');
  if (btn) {
    btn.textContent = on ? '🔲 Nav: Home' : '⬜ Nav: Bar';
    btn.style.background = on ? 'rgba(108,171,221,0.25)' : '';
    btn.style.borderColor = on ? 'rgba(108,171,221,0.5)' : '';
  }
}

(function applyStoredHomeNav() {
  if (localStorage.getItem('immersive_home_nav') === '1') {
    document.body.classList.add('home-nav');
    document.addEventListener('DOMContentLoaded', _syncHomeNavBtn);
  }
})();

/* ── KICKOFF COUNTDOWN ── */
(function startCountdown() {
  const kickoff = new Date();
  kickoff.setHours(15, 0, 0, 0); // today 15:00
  if (kickoff < new Date()) kickoff.setDate(kickoff.getDate() + 1); // next day if past

  function tick() {
    const el = document.getElementById('countdown-display');
    if (!el) return;
    const diff = Math.max(0, kickoff - new Date());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = `${String(h).padStart(1,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  tick();
  setInterval(tick, 1000);
})();
