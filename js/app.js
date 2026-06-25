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

    const nav = document.getElementById('shell-nav');
    const iris = document.getElementById('shell-iris');
    if (nav && iris) {
      if (cfg.nav) {
        nav.classList.remove('off');
        iris.classList.remove('off');
        nav.classList.toggle('live', !!cfg.live);
        document.querySelectorAll('.ni').forEach(n => n.classList.toggle('on', n.dataset.nav === cfg.active));
      } else {
        nav.classList.add('off');
        iris.classList.add('off');
      }
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
    case 'goal':       navigate('goal-scored','takeover'); break;
    case 'var':        showOverlay('var'); break;
    case 'sub':        showOverlay('sub-card'); break;
    case 'yellow':
      showOverlay('yellow-toast');
      setTimeout(() => hideOverlay('yellow-toast'), 3000);
      break;
    case 'halftime':   matchState='halftime'; navigate('home-halftime','fade'); break;
    case 'second-half':matchState='live'; navigate('home-live','fade'); break;
    case 'fulltime':   matchState='post-match'; navigate('home-post-match','fade'); break;
  }
}

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

async function loadAllScreens() {
  const mount = document.getElementById('screens-mount');
  for (const file of SCREEN_PARTIALS) {
    try {
      const res = await fetch(file);
      if (!res.ok) { console.error('[screens] failed to load:', file, res.status); continue; }
      const html = await res.text();
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

  // initial route — always start at splash
  navigate('splash', 'fade', true);
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
