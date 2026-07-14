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
  'fan-reactions':    {nav:false, t:'right'},
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
    // Fan Reactions streams live only while you're on it.
    if (sid === 'fan-reactions') startReactions(); else stopReactions();
    // Entering the chat: collapse any lingering full event cards to slim records.
    if (sid === 'chat-live') initChatEphemerals();
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
    navigator.share({ title: reskin('Man City vs Real Madrid'), text, url: window.location.href }).catch(()=>{});
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
      ht.style.background = 'rgba(' + BRAND_RGB + ',0.1)'; ht.style.border = '1.5px solid rgba(' + BRAND_RGB + ',0.4)';
      ht.querySelector('div').style.color = '' + BRAND + '';
      seat.style.background = 'rgba(255,255,255,0.04)'; seat.style.border = '1px solid rgba(255,255,255,0.1)';
      seat.querySelector('div').style.color = 'rgba(255,255,255,0.5)';
      if (btn) btn.textContent = 'Order for Halftime Pickup →';
    } else {
      seat.style.background = 'rgba(' + BRAND_RGB + ',0.1)'; seat.style.border = '1.5px solid rgba(' + BRAND_RGB + ',0.4)';
      seat.querySelector('div').style.color = '' + BRAND + '';
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
  el.style.background = 'rgba(' + BRAND_RGB + ',0.12)';
  el.style.border = '1.5px solid ' + BRAND + '';
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
  if (f && !f.getAttribute('src')) {
    f.setAttribute('src', 'partner-food.html');
    // same-origin: reskin the partner page's own copy once it loads
    if (TEAM.team) f.addEventListener('load', () => {
      try { const d = f.contentDocument; d.body.innerHTML = reskin(d.body.innerHTML); d.title = reskin(d.title); } catch (e) {}
    }, { once: true });
  }
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
      '<div class="flash-kicker">' + reskin(o.kicker) + '</div>' +
      '<div class="flash-title">' + reskin(o.title) + '</div>' +
      (o.sub ? '<div class="flash-sub">' + reskin(o.sub) + '</div>' : '') +
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
  card.innerHTML = reskin(
    '<div class="motm-head">' +
      '<div class="flash-ic" style="background:rgba(201,168,76,0.16)">⭐</div>' +
      '<div class="flash-body"><div class="flash-kicker" style="color:#C9A84C">Man of the Match · vote now</div><div class="flash-title">Who won it for City?</div></div>' +
      '<button class="flash-close" onclick="dismissBanner(this.closest(\'.flash-card\'))">✕</button>' +
    '</div>' +
    '<div class="motm-opts">' +
      opts.map(o => '<div class="motm-opt" onclick="motmPick(this)"><div class="mo-name">' + o[0] + '</div><div class="mo-sub">' + o[1] + '</div></div>').join('') +
    '</div>');
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

// ── CHAT: EPHEMERAL EVENTS + MODERATOR PROMPTS ────────────────
// Match-event cards (goal/VAR/yellow/sub) show in full, then auto-collapse to
// a slim one-line record so the chat scrollback never clogs up. Moderator
// prompts (a poll, or a dry-spell question) are pushed from the studio one at
// a time — a new prompt replaces the previous — and render inline in the chat.
function _chatFeed() { return document.getElementById('chat-feed'); }

let _chatEphTimers = [];
function collapseChatEvent(card) {
  if (!card || card._slimmed) return;
  card._slimmed = true;
  const slim = card.getAttribute('data-slim') || '';
  card.style.opacity = '0';
  setTimeout(() => {
    card.removeAttribute('onclick');
    card.onclick = null;
    card.style.cssText = '';        // shed the full-card inline styling
    card.className = 'chat-slim';   // .chat-slim now owns the look; drops .chat-ephemeral so it won't re-collapse
    card.textContent = slim;
    card.style.opacity = '0';
    requestAnimationFrame(() => { card.style.opacity = '1'; });
  }, 280);
}
// Called on entering the chat: any event card still in full form collapses
// after a short beat (staggered so several don't snap at once).
function initChatEphemerals() {
  _chatEphTimers.forEach(clearTimeout);
  _chatEphTimers = [];
  const cards = document.querySelectorAll('#screen-chat-live .chat-ephemeral:not(.chat-slim)');
  cards.forEach((card, i) => {
    _chatEphTimers.push(setTimeout(() => collapseChatEvent(card), 8000 + i * 500));
  });
}

// ── FAN-SENT CHAT ──
// The live-chat input bar is now real: a fan can actually post into the feed.
// Prototype-local only (messages aren't broadcast to other devices). A canned
// fan reply drops in a beat later so the room still feels alive during a test.
const _CHAT_REPLIES = [
  ['BlueMoonRising', 'BM', 'Spot on 🔵'],
  ['NorthEndBlue', 'NE', 'Haha yes get in 🔥'],
  ['CityFan_Mk', 'CF', 'Agreed mate 👏'],
  ['MikeNorthEnd', 'MN', 'This. Exactly this.'],
  ['BlueHazeMcr', 'BH', 'Feeling this one 💙'],
];
let _chatReplyIdx = 0;
function _chatScrollDown(feed) {
  const s = feed && feed.parentElement;
  if (s) s.scrollTop = s.scrollHeight;
}
function _chatBubbleYou(text) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;justify-content:flex-end;';
  wrap.innerHTML =
    '<div><div style="font-size:10px;color:rgba(' + BRAND_RGB + ',0.5);margin-bottom:2px;text-align:right;">You · now</div>' +
    '<div style="background:rgba(' + BRAND_RGB + ',0.18);border:1px solid rgba(' + BRAND_RGB + ',0.3);border-radius:10px 10px 3px 10px;padding:8px 11px;max-width:220px;">' +
    '<span style="font-size:13px;color:#fff;"></span></div></div>';
  wrap.querySelector('span').textContent = text; // text-safe (no HTML injection)
  return wrap;
}
function _chatBubbleOther(name, initials, text) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;gap:8px;align-items:flex-end;';
  wrap.innerHTML =
    '<div style="width:28px;height:28px;border-radius:50%;background:#1a2238;flex-shrink:0;display:flex;align-items:center;justify-content:center;">' +
    '<span style="font-size:8px;font-weight:700;color:' + BRAND + ';"></span></div>' +
    '<div><div class="_who" style="font-size:10px;color:rgba(255,255,255,0.28);margin-bottom:2px;"></div>' +
    '<div style="background:#111520;border:1px solid rgba(255,255,255,0.07);border-radius:10px 10px 10px 3px;padding:8px 11px;max-width:240px;">' +
    '<span style="font-size:13px;color:rgba(255,255,255,0.82);"></span></div></div>';
  wrap.querySelectorAll('span')[0].textContent = initials;
  wrap.querySelector('._who').textContent = name + ' · now';
  wrap.querySelectorAll('span')[1].textContent = text;
  return wrap;
}
function chatSend() {
  const input = document.getElementById('chat-input');
  const feed = _chatFeed();
  if (!input || !feed) return;
  const text = (input.value || '').trim();
  if (!text) return;
  feed.appendChild(_chatBubbleYou(text));
  input.value = '';
  _chatScrollDown(feed);
  const r = _CHAT_REPLIES[_chatReplyIdx++ % _CHAT_REPLIES.length];
  setTimeout(() => {
    const f = _chatFeed();
    if (!f) return;
    f.appendChild(_chatBubbleOther(r[0], r[1], r[2]));
    _chatScrollDown(f);
  }, 1400);
}
window.chatSend = chatSend;

// Only one moderator prompt lives in the chat at a time.
function _clearMod() {
  const feed = _chatFeed();
  if (!feed) return;
  feed.querySelectorAll('.chat-mod').forEach((c) => {
    if (c._timer) clearTimeout(c._timer);
    c.classList.add('out');
    setTimeout(() => { try { c.remove(); } catch (e) {} }, 300);
  });
}
function _mountMod(card) {
  const feed = _chatFeed();
  if (!feed) return null;
  _clearMod();
  feed.appendChild(card);
  requestAnimationFrame(() => card.classList.add('in'));
  if (/^chat/.test(curScreen || '')) {
    setTimeout(() => { try { card.scrollIntoView({ behavior: 'smooth', block: 'end' }); } catch (e) {} }, 80);
  }
  return card;
}
// When a prompt is pushed but the fan isn't in the chat, nudge them in.
function _modNudge(kind) {
  if (/^chat/.test(curScreen || '')) return;
  const card = _banner({
    variant: 'announce', ic: kind === 'poll' ? '📊' : '💬', kicker: 'Moderator',
    title: kind === 'poll' ? 'New poll in Fan Chat' : 'Moderator asked a question',
    sub: 'Tap to join the chat',
    right: '<button class="flash-close" onclick="event.stopPropagation();dismissBanner(this.closest(\'.flash-card\'))">✕</button>',
  });
  if (!card) return;
  card._timer = setTimeout(() => dismissBanner(card), 6000);
  card.onclick = () => { dismissBanner(card); navigate('chat-live', 'up'); };
}

// Moderator poll — fans vote; it stays open until they vote or the operator
// closes it, then shows the result split.
function chatModPoll(opts) {
  opts = opts || {};
  const q = reskin(opts.q || 'Who’s been City’s standout so far?');
  const options = (opts.opts || ['Haaland', 'Rodri', 'Foden']).map((o) => reskin(o));
  const card = document.createElement('div');
  card.className = 'chat-mod chat-mod-poll';
  card.innerHTML =
    '<button class="cm-close" onclick="chatModClose(this)">✕</button>' +
    '<div class="cm-kicker" style="color:' + BRAND + ';">📊 Moderator poll</div>' +
    '<div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:9px;padding-right:20px;">' + q + '</div>' +
    '<div style="display:flex;gap:6px;">' +
      options.map((o) => '<div class="cm-poll-opt" onclick="chatPollVote(this)"><div class="cmo-bar"></div><div class="cmo-name">' + o + '</div><div class="cmo-pct">0%</div></div>').join('') +
    '</div>' +
    '<div class="cm-foot" style="text-align:center;margin-top:8px;font-size:10px;font-weight:700;color:rgba(' + BRAND_RGB + ',0.75);">Tap to vote · +50 XP</div>';
  const el = _mountMod(card);
  _modNudge('poll');
  return el;
}
function chatPollVote(el) {
  const card = el.closest('.chat-mod');
  if (!card || card.classList.contains('voted')) return;
  card.classList.add('voted');
  const opts = Array.from(card.querySelectorAll('.cm-poll-opt'));
  const pickIdx = opts.indexOf(el);
  const weights = opts.map(() => 10 + Math.random() * 38);
  weights[pickIdx] += 46;
  const total = weights.reduce((a, b) => a + b, 0);
  const pcts = weights.map((w) => Math.round((w / total) * 100));
  pcts[pickIdx] += 100 - pcts.reduce((a, b) => a + b, 0); // absorb rounding
  opts.forEach((o, i) => {
    o.querySelector('.cmo-pct').textContent = pcts[i] + '%';
    o.querySelector('.cmo-bar').style.width = pcts[i] + '%';
    if (i === pickIdx) {
      o.style.borderColor = 'rgba(' + BRAND_RGB + ',0.55)';
      o.querySelector('.cmo-bar').style.background = 'rgba(' + BRAND_RGB + ',0.34)';
    }
  });
  const foot = card.querySelector('.cm-foot');
  if (foot) { foot.textContent = '✓ Voted · +50 XP'; foot.style.color = 'rgba(34,197,94,0.85)'; }
}
// Moderator question — a conversation-starter for dry spells. Pinned, then
// fades on its own once the chat has had time to pick back up.
function chatModQuestion(opts) {
  opts = opts || {};
  const q = opts.q || 'Quiet moment — what’s your score prediction for the second half? 👀';
  const card = document.createElement('div');
  card.className = 'chat-mod chat-mod-q';
  card.innerHTML =
    '<button class="cm-close" onclick="chatModClose(this)">✕</button>' +
    '<div class="cm-kicker" style="color:#b48cff;">💬 Moderator asks</div>' +
    '<div style="font-size:13.5px;font-weight:600;color:rgba(255,255,255,0.92);line-height:1.45;padding-right:16px;">' + q + '</div>';
  const el = _mountMod(card);
  if (el) el._timer = setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => { try { el.remove(); } catch (e) {} }, 300);
  }, 45000);
  _modNudge('question');
  return el;
}
function chatModClose(btn) {
  const card = btn.closest('.chat-mod');
  if (!card) return;
  if (card._timer) clearTimeout(card._timer);
  card.classList.add('out');
  setTimeout(() => { try { card.remove(); } catch (e) {} }, 300);
}
window.chatPollVote = chatPollVote;
window.chatModClose = chatModClose;

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
    case 'mod-poll':     chatModPoll(); break;
    case 'mod-question': chatModQuestion(); break;
    case 'mod-close':    _clearMod(); break;
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

// ── FAN REACTION REELS ──
// A reel-style live reactions wall: in-app emoji taps (reactTap) plus a stream
// of short fan reaction *videos* sourced from the match hashtags. Clips are
// mocked (no real video / no backend) but stream in like a hashtag firehose
// while you're on screen. Fans record their own reaction (openRecord); the
// operator can push/feature an approved clip live via the control bridge
// ('reaction' event) — the real-world path is a moderated feed, not raw
// auto-ingest, so nothing goes live until it's approved.
const _REEL_POOL = [
  {pf:'tt', n:'CityZoneSam',    av:'CS', img:'Mancity vs Real Madrid.jpeg',                dur:'0:12', views:'48.2k', likes:'3.1k', cap:'HAALAND ARE YOU KIDDING ME 🔵🔥 #MCIRMA', live:true},
  {pf:'ig', n:'bluemoon.katie', av:'BK', img:'Manchester city vs Real Madrid.jpeg',        dur:'0:08', views:'12.4k', likes:'844',  cap:'the noise in here right now 😤 #ManCity', live:true},
  {pf:'tt', n:'kdb_edits17',    av:'KE', img:'Erling Haaland _ Manchester City _ Fútbol _ Wallpaper _ By @livtorresec.jpeg', dur:'0:21', views:'96.7k', likes:'8.2k', cap:'Rodri running the whole midfield, casually #MCIRMA'},
  {pf:'ig', n:'etihad.echo',    av:'EE', img:'_Real Madrid Vs Man City_ Matchday design.jpeg', dur:'0:15', views:'21.9k', likes:'1.1k', cap:'best atmosphere all season honestly 💙 #ManCity'},
  {pf:'tt', n:'matchdaymolly',  av:'MM', img:'Poster MatchDay Champions League.jpeg',      dur:'0:18', views:'134k',  likes:'11.3k',cap:'scenes when that went in 🙌🔵 #ManCity #MCIRMA', live:true},
  {pf:'x',  n:'NorthStandNance',av:'NN', img:'223068987790622209.jpeg',                    dur:'0:09', views:'7.8k',  likes:'933',  cap:'Foden with the assist AGAIN 🅰️ #MCIRMA'},
  {pf:'ig', n:'ttv_bluearmy',   av:'BA', img:'Rayan Cherki Manchester City 2026.jpeg',      dur:'0:24', views:'58.1k', likes:'4.6k', cap:'City are a different gravy in Europe 🔥 #Haaland'},
  {pf:'tt', n:'PepInTheZone',   av:'PZ', img:'POSTER FOOTBALL MANCHESTER CITY.jpeg',        dur:'0:11', views:'33.0k', likes:'2.7k', cap:'Tactical masterclass again from Pep 🎯 #UCL'},
  {pf:'x',  n:'RealFanCarlos',  av:'RC', img:'25614291625815684.jpeg',                      dur:'0:07', views:'5.2k',  likes:'288',  cap:'Tough night for us but City are elite. Respect. #UCL'},
  {pf:'ig', n:'bluemoon_liv',   av:'BL', img:'manchester city.jpeg',                        dur:'0:16', views:'40.5k', likes:'3.9k', cap:'my reaction says it all 💙🔵 #MCIRMA'},
];
const _REEL_IMG_DIR = 'man%20city%20images%20/';
let _reactTimer = 0, _reelIdx = 4, _reactCount = 2431;
let _reelWall = [];      // data backing every tile currently on the wall (index 0 = top)
let _reelViewTimer = 0;

function _reelSrc(f) { return f.indexOf('/') === -1 ? _REEL_IMG_DIR + encodeURI(f) : f; }
function _platBadge(pf) {
  if (pf === 'x')  return '<span style="width:16px;height:16px;border-radius:4px;background:#000;border:1px solid rgba(255,255,255,0.2);display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#fff;">𝕏</span>';
  if (pf === 'ig') return '<span style="width:16px;height:16px;border-radius:4px;background:linear-gradient(45deg,#f09433,#dc2743,#bc1888);display:inline-flex;align-items:center;justify-content:center;font-size:7px;font-weight:800;color:#fff;">IG</span>';
  if (pf === 'you')return '<span style="width:16px;height:16px;border-radius:4px;background:#C9A84C;display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;color:#000;">✦</span>';
  return '<span style="width:16px;height:16px;border-radius:4px;background:#111;border:1px solid rgba(255,255,255,0.15);display:inline-flex;align-items:center;justify-content:center;font-size:7px;font-weight:800;color:#25f4ee;">TT</span>';
}
function _reelCard(o, isNew, idx) {
  const cap = (o.cap || '').replace(/#(\w+)/g, '<span style="color:' + BRAND + ';font-weight:600;">#$1</span>');
  const topRight = o.dur
    ? '<span class="reel-dur">' + o.dur + '</span>'
    : '';
  const topLeft = o.featured
    ? ''  // the centred FEATURED tag carries the status on featured tiles
    : (o.you
      ? '<span class="reel-live" style="background:rgba(201,168,76,0.95);color:#1a1206;"><i style="background:#1a1206;"></i>YOU · LIVE</span>'
      : (o.live ? '<span class="reel-live"><i></i>LIVE</span>' : _platBadge(o.pf)));
  return '<div class="reel' + (isNew ? ' reel-anim' : '') + (o.featured ? ' featured' : '') + '" onclick="openReel(' + idx + ')">'
    + '<img class="reel-thumb" src="' + _reelSrc(o.img) + '" onerror="this.style.opacity=0">'
    + '<div class="reel-grad"></div>'
    + (o.featured ? '<div class="reel-tag">FEATURED ON SCREEN</div>' : '')
    + '<div class="reel-top">' + topLeft + topRight + '</div>'
    + '<div class="reel-play"><svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M8 5v14l11-7z"/></svg></div>'
    + '<div class="reel-bot">'
    +   '<div class="reel-user"><span class="reel-av' + (o.you ? ' you' : '') + '">' + o.av + '</span><span class="reel-handle">@' + o.n + '</span></div>'
    +   '<div class="reel-cap">' + cap + '</div>'
    +   '<div class="reel-meta">▶ ' + (o.views || '0') + ' · ❤ ' + (o.likes || '0') + '</div>'
    + '</div>'
    + '</div>';
}
// Count the run of pinned reels (fan's own + operator-featured) at the top of
// the wall — new streamed clips insert below them so pins never get buried.
function _pinnedTop() {
  let i = 0;
  while (i < _reelWall.length && (_reelWall[i].you || _reelWall[i].featured)) i++;
  return i;
}
function _renderWall() {
  const f = document.getElementById('react-feed');
  if (!f) return;
  f.innerHTML = _reelWall.map((o, i) => _reelCard(o, o._new, i)).join('');
  _reelWall.forEach((o) => { o._new = false; });
}
function _reactBump(n) {
  _reactCount += n;
  const c = document.getElementById('react-count');
  if (c) c.textContent = _reactCount.toLocaleString();
}
function startReactions() {
  const feed = document.getElementById('react-feed');
  if (!feed) return;
  if (!_reelWall.length) {
    _reelWall = _REEL_POOL.slice(0, 6).map((o) => ({ ...o }));
    _reelIdx = 5;
    _renderWall();
  }
  if (_reactTimer) return;
  _reactTimer = setInterval(() => {
    const f = document.getElementById('react-feed');
    if (!f) { stopReactions(); return; }
    _reelIdx = (_reelIdx + 1) % _REEL_POOL.length;
    // Stream new clips in just BELOW any pinned reels (the fan's own + any the
    // operator has featured), so those stay at the top instead of being buried.
    _reelWall.splice(_pinnedTop(), 0, { ...(_REEL_POOL[_reelIdx]), _new: true });
    while (_reelWall.length > 12) _reelWall.pop();
    _renderWall();
    _reactBump(3 + Math.floor(Math.random() * 12));
  }, 3200);
}
function stopReactions() { if (_reactTimer) { clearInterval(_reactTimer); _reactTimer = 0; } }

// Fullscreen reel viewer — mock "playback" with an auto-advancing progress bar.
function openReel(i) {
  const o = _reelWall[i];
  if (!o) return;
  closeReel();
  const host = document.getElementById('device') || document.body;
  const v = document.createElement('div');
  v.className = 'reelview';
  v.id = 'reelview';
  v.innerHTML =
      '<div class="reelview-media"><img src="' + _reelSrc(o.img) + '" onerror="this.style.opacity=0"></div>'
    + '<div class="reelview-shade"></div>'
    + '<div class="reelview-prog"><i id="reelview-bar"></i></div>'
    + '<div class="reelview-close" onclick="closeReel()">✕</div>'
    + '<div class="reelview-nav" style="left:0" onclick="stepReel(-1)"></div>'
    + '<div class="reelview-nav" style="right:0" onclick="stepReel(1)"></div>'
    + '<div style="position:absolute;left:16px;right:60px;bottom:26px;z-index:3;">'
    +   '<div style="display:flex;align-items:center;gap:7px;margin-bottom:8px;"><span class="reel-av' + (o.you ? ' you' : '') + '" style="width:30px;height:30px;font-size:11px;">' + o.av + '</span><span style="font-size:15px;font-weight:800;color:#fff;">@' + o.n + '</span>' + _platBadge(o.pf) + '</div>'
    +   '<div style="font-size:14px;color:#fff;line-height:1.4;margin-bottom:10px;">' + (o.cap || '').replace(/#(\w+)/g, '<span style="color:' + BRAND + ';font-weight:700;">#$1</span>') + '</div>'
    +   '<div style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.7);">▶ ' + (o.views || '0') + ' views  ·  ❤ ' + (o.likes || '0') + '</div>'
    + '</div>'
    + '<div style="position:absolute;right:14px;bottom:30px;z-index:3;display:flex;flex-direction:column;gap:16px;align-items:center;">'
    +   '<div onclick="event.stopPropagation();reactTap(this.querySelector(\'span\'),\'❤️\')" style="text-align:center;cursor:pointer;"><span style="font-size:26px;">❤️</span></div>'
    +   '<div onclick="event.stopPropagation();reactTap(this.querySelector(\'span\'),\'🔥\')" style="text-align:center;cursor:pointer;"><span style="font-size:26px;">🔥</span></div>'
    + '</div>';
  v.dataset.idx = i;
  host.appendChild(v);
  // animate the progress bar over ~7s, then advance to the next reel.
  requestAnimationFrame(() => {
    const bar = document.getElementById('reelview-bar');
    if (bar) { bar.style.transition = 'width 7s linear'; bar.style.width = '100%'; }
  });
  clearTimeout(_reelViewTimer);
  _reelViewTimer = setTimeout(() => stepReel(1), 7000);
}
function stepReel(dir) {
  const v = document.getElementById('reelview');
  if (!v) return;
  const next = (parseInt(v.dataset.idx, 10) + dir + _reelWall.length) % _reelWall.length;
  openReel(next);
}
function closeReel() {
  clearTimeout(_reelViewTimer); _reelViewTimer = 0;
  const v = document.getElementById('reelview');
  if (v) v.remove();
}

// Record-your-reaction flow — mock capture (no camera/upload): a viewfinder,
// a 3-2-1 countdown, a fake "recording" bar, then the clip is prepended to the
// wall as the fan's own live reel.
function openRecord() {
  closeRecord();
  const host = document.getElementById('device') || document.body;
  const s = document.createElement('div');
  s.className = 'reel-record-sheet';
  s.id = 'reel-record-sheet';
  s.innerHTML =
      '<div style="display:flex;justify-content:center;padding-top:12px;margin-bottom:4px;"><div style="width:36px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;"></div></div>'
    + '<div style="padding:6px 18px 0;display:flex;align-items:center;justify-content:space-between;"><span style="font-size:17px;font-weight:800;color:#fff;">Record your reaction</span><span onclick="closeRecord()" style="font-size:13px;color:rgba(255,255,255,0.5);cursor:pointer;">Cancel</span></div>'
    + '<div class="reel-viewfinder" id="reel-viewfinder">'
    +   '<div id="reel-vf-hint" style="text-align:center;color:rgba(255,255,255,0.5);font-size:13px;padding:0 24px;">📸  Selfie camera preview<br><span style="font-size:11px;color:rgba(255,255,255,0.3);">(demo — no real capture)</span></div>'
    + '</div>'
    + '<div id="reel-rec-caption" style="text-align:center;font-size:12px;color:rgba(255,255,255,0.4);margin-top:12px;">Tap to record up to 15s · goes live once approved</div>'
    + '<button class="reel-rec-btn" id="reel-rec-btn" onclick="doRecord()"></button>';
  host.appendChild(s);
}
function closeRecord() { const s = document.getElementById('reel-record-sheet'); if (s) s.remove(); }
function doRecord() {
  const vf = document.getElementById('reel-viewfinder');
  const hint = document.getElementById('reel-vf-hint');
  const cap = document.getElementById('reel-rec-caption');
  const btn = document.getElementById('reel-rec-btn');
  if (!vf || !btn) return;
  btn.style.display = 'none';
  let n = 3;
  if (hint) hint.innerHTML = '<div style="font-size:64px;font-weight:900;color:#fff;">' + n + '</div>';
  const tick = setInterval(() => {
    n -= 1;
    if (n > 0) { if (hint) hint.innerHTML = '<div style="font-size:64px;font-weight:900;color:#fff;">' + n + '</div>'; return; }
    clearInterval(tick);
    // "recording" phase
    if (hint) hint.innerHTML = '<div style="display:flex;align-items:center;gap:8px;color:#ef4444;font-weight:800;font-size:15px;"><span style="width:11px;height:11px;border-radius:50%;background:#ef4444;" class="reel-record-dot"></span>REC</div>';
    if (cap) cap.textContent = 'Recording your reaction…';
    const rbar = document.createElement('div');
    rbar.style.cssText = 'position:absolute;left:0;bottom:0;height:4px;background:#ef4444;width:0;transition:width 2.4s linear;';
    vf.appendChild(rbar);
    requestAnimationFrame(() => { rbar.style.width = '100%'; });
    setTimeout(() => {
      // posted → prepend the fan's own reel, flagged as pending→live.
      const mine = {
        pf: 'you', n: (typeof fanName === 'function' ? fanName() : 'you'), av: 'YOU', you: true,
        img: TEAM.imgs.length ? TEAM.imgs[0] : 'Mancity vs Real Madrid.jpeg',
        dur: '0:11', views: '1', likes: '0',
        cap: reskin('My matchday reaction 🔵💙 #MCIRMA'),
      };
      _reelWall.unshift(mine);
      while (_reelWall.length > 12) _reelWall.pop();
      _renderWall();
      _reactBump(1);
      if (hint) hint.innerHTML = '<div style="text-align:center;color:#22c55e;font-weight:800;font-size:15px;">✓ Posted to the wall</div>';
      if (cap) cap.textContent = 'Live once the moderator approves it';
      setTimeout(closeRecord, 1100);
    }, 2500);
  }, 700);
}
window.openReel = openReel; window.stepReel = stepReel; window.closeReel = closeReel;
window.openRecord = openRecord; window.closeRecord = closeRecord; window.doRecord = doRecord;

// Operator push: an approved reaction reel featured live on every fan's wall.
function pushOperatorReaction(meta) {
  meta = meta || {};
  const src = _REEL_POOL[Math.floor(Math.random() * _REEL_POOL.length)];
  const reel = { ...src, featured: true, live: true, _new: true,
    cap: meta.cap || src.cap, views: src.views, likes: src.likes };
  _reelWall.unshift(reel);
  while (_reelWall.length > 12) _reelWall.pop();
  // If the fan is already on the reactions screen, it just streams in; otherwise
  // nudge them toward it with a transient banner (matches other operator pushes).
  if (curScreen === 'fan-reactions') { _renderWall(); }
  else {
    const card = _banner({ variant: 'reaction', ic: '🎥', kicker: 'Featured Reaction',
      title: 'A fan reaction is live', sub: 'Tap to watch the wall', progress: true });
    if (card) {
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
      card.onclick = () => { dismissBanner(card); navigate('fan-reactions', 'up'); };
    }
  }
  _reactBump(5);
}
window.pushOperatorReaction = pushOperatorReaction;
function reactTap(btn, emoji) {
  try {
    const host = document.getElementById('device') || document.body;
    const hr = host.getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    const s = document.createElement('span');
    s.textContent = emoji;
    s.className = 'react-float';
    s.style.left = (r.left - hr.left + r.width / 2 - 11) + 'px';
    s.style.top  = (r.top - hr.top - 6) + 'px';
    host.appendChild(s);
    setTimeout(() => s.remove(), 1200);
    _reactBump(1);
  } catch (e) {}
}
window.reactTap = reactTap;

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

  function fire(evt) {
    // Accepts either an event object ({type, meta}) or a bare type string, so
    // operator-authored poll/question copy rides along in evt.meta.
    const type = evt && evt.type ? evt.type : evt;
    const meta = (evt && evt.meta) || {};
    // Operator-driven events now flash up as transient banners on the fan
    // panel (match the in-app pop-up behaviour), not screen takeovers.
    switch (type) {
      case 'goal':     flashEvent('goal'); break;
      case 'var':      flashEvent('var'); break;
      case 'sub':      flashEvent('sub'); break;
      case 'yellow':   flashEvent('yellow'); break;
      case 'motm':     motmVote(); break;
      case 'poll':     chatModPoll({ q: meta.q, opts: meta.opts }); break;
      case 'question': chatModQuestion({ q: meta.q }); break;
      case 'mod-close': _clearMod(); break;
      case 'reaction': pushOperatorReaction(meta); break;
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
      case 'fireEvent': fire(c.event); break;
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
  'screens/fan-reactions.html',
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
  return {
    team: p.get('team'), opp: p.get('opp'), color: hex ? '#' + hex : null, rgb,
    imgs, names, nameKeys, crest: p.get('crest'), stadium: p.get('stadium'),
  };
})();

// Brand colour for JS-built markup (falls back to the baked-in City blue).
const BRAND = TEAM.color || '#6CABDD';
const BRAND_RGB = TEAM.rgb;

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
  // 1b) badge + home ground (PNGs, skipped by the photo pass above).
  if (TEAM.crest) out = out.replace(/(man%20city%20images%20|man city images )\/man_city_transparent\.png/gi, () => TEAM.crest);
  if (TEAM.stadium) out = out.replace(/(man%20city%20images%20|man city images )\/ethihad\.png/gi, () => TEAM.stadium);
  // 2) per-club names: players, manager, venue, abbreviation. Short all-caps
  //    keys are word-bounded so "RMA" never matches inside "CONFIRMATION".
  for (const k of TEAM.nameKeys) {
    const re = /^[A-Z0-9]{2,6}$/.test(k)
      ? new RegExp('\\b' + escapeRe(k) + '\\b', 'g')
      : new RegExp(escapeRe(k), 'g');
    out = out.replace(re, TEAM.names[k]);
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

// Strings injected from JS (expanded cards, share texts, canned chat replies)
// bypass the HTML reskin pass — run them through it once at boot so a
// reskinned panel never leaks City content via script-built UI.
function reskinInjected() {
  if (!TEAM.team) return;
  // The static shell (index.html overlays: scorer card, VAR, sub, yellow
  // toast, food browser) never passes through the partial loader — reskin it
  // in place. Safe pre-mount: handlers are inline attributes, no listeners yet.
  const device = document.getElementById('device');
  if (device) device.innerHTML = reskin(device.innerHTML);
  document.title = reskin(document.title);
  if (TEAM.imgs.length) {
    // shared counter so the image pool cycles instead of repeating imgs[0]
    let n = 0;
    _cardImgs.forEach((_, i) => {
      _cardImgs[i] = _cardImgs[i].replace(/(man%20city%20images%20|man city images )\/[^"')]+\.jpe?g/gi,
        () => TEAM.imgs[n++ % TEAM.imgs.length]);
    });
  }
  [_cardLabels, _cardTitles, _cardSubs, _cardShare].forEach((arr) => {
    arr.forEach((v, i) => { arr[i] = reskin(v); });
  });
  _CHAT_REPLIES.forEach((r) => { r[0] = reskin(r[0]); r[2] = reskin(r[2]); });
  // Reaction reels: swap thumbnails to the team pool, reskin handles/captions.
  _REEL_POOL.forEach((o, i) => {
    if (TEAM.imgs.length) o.img = TEAM.imgs[i % TEAM.imgs.length];
    o.n = reskin(o.n);
    o.cap = reskin(o.cap);
  });
}

async function applyTeamColorCss() {
  if (!TEAM.color) return;
  const s = document.createElement('style');
  s.textContent = `
    .ni.on{color:${TEAM.color}!important;}
    #shell-iris{background:${TEAM.color}!important;}
    .sb.blue{background:rgba(${TEAM.rgb},0.12)!important;border-color:rgba(${TEAM.rgb},0.25)!important;color:${TEAM.color}!important;}
    .ph-badge{color:${TEAM.color}!important;background:rgba(${TEAM.rgb},0.1)!important;border-color:rgba(${TEAM.rgb},0.2)!important;}`;
  document.head.appendChild(s);
  // Re-inject the whole stylesheet with the brand blue swapped, so EVERY rule
  // (pulses, polls, badges…) recolours — not just the four overrides above.
  try {
    const css = await (await fetch('css/styles.css')).text();
    const full = document.createElement('style');
    full.textContent = css.replace(/#6CABDD/gi, TEAM.color).replace(/108,\s*171,\s*221/g, TEAM.rgb);
    document.head.appendChild(full);
  } catch (e) { /* keep the baked-in blue if the sheet can't be refetched */ }
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
  reskinInjected();
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
  if (track) track.style.background = on ? '' + BRAND + '' : 'rgba(255,255,255,0.12)';
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
      if (track) track.style.background = '' + BRAND + '';
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
    btn.style.background = on ? 'rgba(' + BRAND_RGB + ',0.25)' : '';
    btn.style.borderColor = on ? 'rgba(' + BRAND_RGB + ',0.5)' : '';
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
