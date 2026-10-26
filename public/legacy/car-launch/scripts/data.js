// Mock content for the Aurora Nova launch. Everything is fictional and
// in-memory: no network calls, no real brands.
window.DATA = {
  model: 'Aurora Nova',

  variants: [
    { id: 'std', name: 'Standard', full: 'Nova Standard', price: 159000, range: 520, sprint: '6.1', motor: 'Single motor, RWD' },
    { id: 'pro', name: 'Pro', full: 'Nova Pro', price: 189000, range: 610, sprint: '4.4', motor: 'Dual motor, AWD' },
    { id: 'le', name: 'Launch Edition', full: 'Nova Launch Edition', price: 219000, range: 640, sprint: '3.6', motor: 'Dual motor, 1 of 500' },
  ],

  // `hue` is laid over the body with mix-blend-mode: color, `depth` with multiply
  // to darken it. Pearl is the photo as shot.
  paints: [
    { id: 'pearl', name: 'Pearl Frost', swatch: 'linear-gradient(135deg,#ffffff,#c9d3da)' },
    { id: 'teal', name: 'Aurora Teal', swatch: 'linear-gradient(135deg,#5ff3e6,#0f8f88)', hue: '#14bfb2', depth: '#5f9f9a', hueO: .9, depthO: .8 },
    { id: 'ember', name: 'Ember Orange', swatch: 'linear-gradient(135deg,#ff8f70,#d8401f)', hue: '#ff5a2e', depth: '#e09a86', hueO: .95, depthO: .8 },
    { id: 'night', name: 'Midnight', swatch: 'linear-gradient(135deg,#3a5a8f,#0d1b33)', hue: '#1f4aa8', depth: '#2c3a58', hueO: .95, depthO: 1 },
  ],

  // x / y are percentages of the hero photo.
  hotspots: [
    { id: 'lights', x: 34.6, y: 50.3, name: 'Light Blade', desc: 'One 1.6 m light signature that wakes as you walk up to the car.', stat: '2,400', unit: 'individually lit LEDs' },
    { id: 'wheels', x: 46.2, y: 62.6, name: '21" Aero wheels', desc: 'Closed turbine spokes cut drag at highway speed.', stat: '+18 km', unit: 'range vs open spokes' },
    { id: 'cabin', x: 60.5, y: 38.5, name: 'Horizon cockpit', desc: 'A floating 15.6" display and full-width ambient light.', stat: '15.6"', unit: 'OLED centre screen' },
    { id: 'charge', x: 82.2, y: 44.6, name: 'Fast-charge port', desc: '800-volt architecture. Top up in the time it takes to grab a kopi.', stat: '18 min', unit: '10 to 80% charge' },
    { id: 'roof', x: 66, y: 32.6, name: 'Sky glass roof', desc: 'One panoramic pane, heat and UV coated for Malaysian sun.', stat: '2.1 m²', unit: 'of uninterrupted glass' },
  ],

  budgets: ['Under RM170k', 'RM170–200k', 'RM200k+'],
  cities: ['Kuala Lumpur', 'Penang', 'Johor Bahru'],

  venues: [
    { id: 'kl', city: 'Kuala Lumpur', name: 'Aurora Studio, Bangsar South', seats: 42 },
    { id: 'pg', city: 'Penang', name: 'Aurora Studio, Gurney Wharf', seats: 18 },
    { id: 'jb', city: 'Johor Bahru', name: 'Aurora Studio, Medini', seats: 25 },
  ],

  dealers: [
    { id: 'kl', name: 'Aurora KL', area: 'Bangsar South', dist: '4.2 km' },
    { id: 'pj', name: 'Aurora Petaling Jaya', area: 'Section 13', dist: '9.8 km' },
    { id: 'sa', name: 'Aurora Shah Alam', area: 'Glenmarie', dist: '21 km' },
  ],

  specialist: { name: 'Farah Iskandar', initials: 'FI', role: 'Product specialist, Aurora KL', phone: '+60 3-2201 8800' },

  questionChips: ['Range?', 'Charging time?', 'Price?'],

  // Launch chat: rolling fan lines while the reveal is on. `host` lines are
  // the Aurora team posting into the room.
  chatLines: [
    ['AR', 'AzmanRides', 'that light bar though 😮'],
    ['NK', 'nadia.kl', 'Ember Orange is the one. Done. Sold.'],
    ['AU', 'Aurora team', 'Light Blade is 2,400 individually lit LEDs ✨', 'host'],
    ['JS', 'JunSheng88', '800V charging?? in this price range??'],
    ['FH', 'farhan_h', 'Pro AWD for me, need it for Genting runs'],
    ['PL', 'PenangLyn', 'watching from Gurney studio 👋'],
    ['TM', 'tmk_ev', 'range in KL traffic is what I need to hear'],
    ['AU', 'Aurora team', 'Ask Aurora anything, answers are from the spec sheet', 'host'],
    ['RS', 'rachel.s', 'the roof!! 🤯'],
    ['ZI', 'zul_ikhwan', 'Launch Edition 1 of 500, reserve button where'],
  ],

  // Launch timeline: the matchday event strip, for a reveal.
  moments: [
    ['20:00', 'Doors open · studios in KL, Penang, JB'],
    ['20:04', 'Aurora Nova unveiled', 'hot'],
    ['20:07', 'Light Blade walkthrough'],
    ['20:11', 'Price revealed · from RM159,000', 'hot'],
  ],

  poll: {
    q: 'Which trim speaks to you?',
    opts: [
      { id: 'std', label: 'Standard · the daily driver', votes: 3120 },
      { id: 'pro', label: 'Pro · dual-motor AWD', votes: 5480 },
      { id: 'le', label: 'Launch Edition · 1 of 500', votes: 2690 },
    ],
  },

  // Answers are functions of the viewer's current picks, so the assistant
  // feels like it knows what they're looking at.
  chat: [
    { id: 'range', q: 'What range does it get?', a: (v) => `The ${v.full} is rated at ${v.range} km on a full charge (WLTP). In real KL traffic with the aircon on, owners in testing averaged about ${Math.round(v.range * 0.86)} km, so a week of commuting on one charge.` },
    { id: 'charge', q: 'How fast does it charge?', a: () => `On an 800-volt fast charger it goes from 10 to 80% in about 18 minutes. At home on a 7 kW wallbox it's a full charge overnight, roughly 9 hours. A wallbox and installation are included with launch reservations.` },
    { id: 'price', q: 'How much is it?', a: (v) => `The ${v.full} is RM${v.price.toLocaleString('en-MY')} on the road, including the launch-week EV tax exemption. Reserving tonight locks that price for 30 days.` },
    { id: 'finance', q: 'Can I finance it?', a: (v) => `Yes. With 20% down over 7 years at an indicative 2.49% flat rate, the ${v.full} works out to about RM${monthly(v.price, 20, 7).toLocaleString('en-MY')} a month. I can send this to your dealer so they can confirm it with a bank.` },
  ],
};

// Malaysian hire-purchase maths: flat rate on the financed amount.
function monthly(price, depositPct, years, rate = 0.0249) {
  const financed = price * (1 - depositPct / 100);
  return Math.round((financed * (1 + rate * years)) / (years * 12));
}
