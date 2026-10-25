'use strict';
/* =====================================================================
   KOALAMOCHI — a cozy pocket-pet game
   Plain HTML/CSS/JS, no build step. Open index.html in a browser.
   Drop art into assets/images and music into assets/music (see README).
   ===================================================================== */

/* ============================ CONFIG ============================ */
const CONFIG = {
  saveKey: 'koalamochi_save_v1',
  startCoins: 60,
  // Where outfit pieces sit on the pet, in % of the pet box (box is 200 x 220 units).
  // If your Grok koala is posed differently, nudge these numbers.
  slots: {
    head: { left: 30, top: -13, width: 40 },
    ear:  { left: 58, top: 2,   width: 30 },
    face: { left: 20, top: 14.5, width: 60 },
    neck: { left: 30, top: 54,  width: 40 },
    body: { left: 22.5, top: 57, width: 55 },
  },
  rates: { // points per real minute
    hunger: 1.6, happy: 1.2, energy: 0.8, clean: 0.6, messPenalty: 0.4,
    sleepEnergy: 6, sleepHunger: 0.6,
  },
  messEverySec: 50,
  maxMesses: 6,
  gameEnergyCost: 12,
  choreEnergyCost: 5,
  maxOfflineHours: 12,
};

/* ============================ HELPERS ============================ */
const $ = s => document.querySelector(s);
const rand = (a, b) => Math.random() * (b - a) + a;
const randi = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = randi(0, i); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const svgDataURL = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);

/* ============================ GAME DATA ============================ */
const SNACKS = [
  { id: 'leaf',       name: 'Eucalyptus Leaf', icon: '🌿', price: 5,  lvl: 1,  hunger: 15, happy: 2 },
  { id: 'strawberry', name: 'Strawberry',      icon: '🍓', price: 8,  lvl: 1,  hunger: 12, happy: 6 },
  { id: 'onigiri',    name: 'Rice Ball',       icon: '🍙', price: 12, lvl: 1,  hunger: 25, happy: 3 },
  { id: 'cupcake',    name: 'Cupcake',         icon: '🧁', price: 15, lvl: 2,  hunger: 15, happy: 12 },
  { id: 'pancake',    name: 'Pancake Stack',   icon: '🥞', price: 20, lvl: 3,  hunger: 35, happy: 6 },
  { id: 'boba',       name: 'Boba Tea',        icon: '🧋', price: 18, lvl: 4,  hunger: 10, happy: 14, energy: 12 },
  { id: 'bento',      name: 'Bento Box',       icon: '🍱', price: 30, lvl: 6,  hunger: 60, happy: 5 },
  { id: 'cake',       name: 'Strawberry Cake', icon: '🍰', price: 40, lvl: 8,  hunger: 30, happy: 30 },
  { id: 'honey',      name: 'Honey Toast',     icon: '🍯', price: 55, lvl: 10, hunger: 50, happy: 25, energy: 15 },
];

const GIFTS = [
  { id: 'balloon',  name: 'Heart Balloon',  icon: '🎈', price: 25,  lvl: 1,  happy: 15 },
  { id: 'yoyo',     name: 'Yo-yo',          icon: '🪀', price: 30,  lvl: 1,  happy: 15 },
  { id: 'flowers',  name: 'Flower Pot',     icon: '🌷', price: 35,  lvl: 2,  happy: 18 },
  { id: 'teddy',    name: 'Teddy Bear',     icon: '🧸', price: 45,  lvl: 2,  happy: 25 },
  { id: 'kite',     name: 'Kite',           icon: '🪁', price: 50,  lvl: 3,  happy: 22 },
  { id: 'nightlight', name: 'Star Nightlight', icon: '⭐', price: 90, lvl: 4, happy: 25 },
  { id: 'musicbox', name: 'Music Box',      icon: '🎶', price: 80,  lvl: 5,  happy: 30 },
  { id: 'unicorn',  name: 'Unicorn Plush',  icon: '🦄', price: 120, lvl: 7,  happy: 40 },
  { id: 'rainbow',  name: 'Rainbow Lamp',   icon: '🌈', price: 150, lvl: 8,  happy: 40 },
  { id: 'castle',   name: 'Toy Castle',     icon: '🏰', price: 200, lvl: 10, happy: 50 },
  { id: 'trophy',   name: 'Golden Trophy',  icon: '🏆', price: 300, lvl: 12, happy: 60 },
  { id: 'gem',      name: 'Wish Crystal',   icon: '💎', price: 400, lvl: 15, happy: 80 },
];

const SLOT_NAMES = { ear: 'Bows & Clips', head: 'Hats', face: 'Glasses', neck: 'Neckwear', body: 'Outfits' };
const OUTFITS = [
  { id: 'bow_red',      name: 'Signature Pink Bow', slot: 'ear', price: 0, lvl: 1 }, // starter bow (id kept for old saves)
  { id: 'bow_pink',     name: 'Baby Pink Bow',   slot: 'ear',  price: 30,  lvl: 1 },
  { id: 'bow_mint',     name: 'Mint Bow',        slot: 'ear',  price: 30,  lvl: 2 },
  { id: 'flower_clip',  name: 'Daisy Clip',      slot: 'ear',  price: 45,  lvl: 3 },
  { id: 'round_glasses', name: 'Round Glasses',  slot: 'face', price: 40,  lvl: 2 },
  { id: 'bowtie',       name: 'Polka Bowtie',    slot: 'neck', price: 35,  lvl: 2 },
  { id: 'party_hat',    name: 'Party Hat',       slot: 'head', price: 60,  lvl: 3 },
  { id: 'heart_glasses', name: 'Heart Glasses',  slot: 'face', price: 50,  lvl: 3 },
  { id: 'scarf',        name: 'Cozy Scarf',      slot: 'neck', price: 55,  lvl: 4 },
  { id: 'tutu',         name: 'Ballet Tutu',     slot: 'body', price: 80,  lvl: 4 },
  { id: 'beret',        name: 'Artist Beret',    slot: 'head', price: 80,  lvl: 5 },
  { id: 'sunglasses',   name: 'Cool Shades',     slot: 'face', price: 70,  lvl: 5 },
  { id: 'apron',        name: 'Cherry Apron',    slot: 'body', price: 90,  lvl: 6 },
  { id: 'bunny_ears',   name: 'Bunny Ears',      slot: 'head', price: 90,  lvl: 6 },
  { id: 'pearls',       name: 'Pearl Necklace',  slot: 'neck', price: 120, lvl: 7 },
  { id: 'witch_hat',    name: 'Starry Witch Hat', slot: 'head', price: 110, lvl: 8 },
  { id: 'crown',        name: 'Royal Crown',     slot: 'head', price: 250, lvl: 10 },
];

const UPGRADES = [
  { id: 'bed',    name: 'Comfy Bed',   icon: '🛏️', desc: 'Sleep restores energy faster',  costs: [80, 200, 400] },
  { id: 'piggy',  name: 'Piggy Bank',  icon: '🐷', desc: '+15% coins from everything',     costs: [100, 250, 500] },
  { id: 'fridge', name: 'Snack Fridge', icon: '🧊', desc: 'Snacks fill +20% more',         costs: [70, 180, 360] },
  { id: 'duster', name: 'Robo Duster', icon: '🤖', desc: 'Messes appear less often',       costs: [90, 220, 450] },
  { id: 'nest',   name: 'Cozy Nest',   icon: '🪺', desc: 'Happiness drains slower',        costs: [90, 220, 450] },
  { id: 'desk',   name: 'Study Desk',  icon: '📚', desc: '+15% XP from everything',        costs: [120, 300, 600] },
];

const WALLPAPERS = [
  { id: 'strawberry', name: 'Strawberry Milk', icon: '🍓', price: 0,   lvl: 1, filter: '' },
  { id: 'mint',       name: 'Mint Stripes',    icon: '🌱', price: 60,  lvl: 2, filter: 'hue-rotate(120deg) saturate(.85)' },
  { id: 'cloud',      name: 'Cloud Nine',      icon: '☁️', price: 100, lvl: 3, filter: 'hue-rotate(185deg) saturate(.8) brightness(1.05)' },
  { id: 'lavender',   name: 'Lavender Dream',  icon: '💜', price: 80,  lvl: 4, filter: 'hue-rotate(-45deg) saturate(.8)' },
  { id: 'starry',     name: 'Starry Night',    icon: '🌌', price: 150, lvl: 6, filter: 'hue-rotate(215deg) brightness(.6) saturate(1.2)' },
];

const STAGES = [
  { min: 1,  name: 'Baby',      scale: 0.82 },
  { min: 4,  name: 'Kiddo',     scale: 0.9 },
  { min: 8,  name: 'Teen',      scale: 0.98 },
  { min: 12, name: 'Superstar', scale: 1.05 },
];

const MESS_ICONS = ['🧦', '🍂', '🍪', '💧', '🧻', '🪶'];

const GAMES = [
  { id: 'leaf',    name: 'Leaf Catch',   icon: '🍃', desc: 'Catch eucalyptus leaves, dodge the bees!', bg: 'bg_garden',   cls: 'bg-garden', run: gameLeafCatch },
  { id: 'memory',  name: 'Memory Match', icon: '🃏', desc: 'Flip cards and find all the pairs.',        bg: 'bg_playroom', cls: 'bg-play',   run: gameMemory, lowerBetter: true, unit: 'moves' },
  { id: 'bubbles', name: 'Bubble Pop',   icon: '🫧', desc: 'Pop as many bubbles as you can!',           bg: 'bg_sky',      cls: 'bg-sky',    run: gameBubbles },
];

const CHORES = [
  { id: 'tidy',    name: 'Tidy Up',      icon: '🧹', desc: 'Tap the messes around the room.' },
  { id: 'bath',    name: 'Bath Time',    icon: '🛁', desc: 'Scrub-a-dub your koala squeaky clean!', cd: 60,  coins: 12, xp: 10, bg: 'bg_bathroom', cls: 'bg-bath' },
  { id: 'dishes',  name: 'Wash Dishes',  icon: '🍽️', desc: 'Scrub 3 dirty plates sparkly clean.',   cd: 120, coins: 18, xp: 12, bg: 'bg_kitchen',  cls: 'bg-kitchen' },
  { id: 'windows', name: 'Wipe Windows', icon: '🪟', desc: 'Wipe the smudges off the window.',      cd: 120, coins: 15, xp: 10, bg: 'bg_bedroom',  cls: 'bg-window' },
];

/* ============================ STATE / SAVE ============================ */
function newState() {
  return {
    v: 1, name: 'Mochi', named: false,
    coins: CONFIG.startCoins, xp: 0, level: 1,
    stats: { hunger: 80, happy: 80, energy: 90, clean: 90 },
    sleeping: false,
    inv: { leaf: 2, strawberry: 2 },
    gifts: [], outfits: ['bow_red'], equipped: { ear: 'bow_red' },
    upgrades: {}, wallpaper: 'strawberry', wallpapers: ['strawberry'],
    messes: [], nextMess: CONFIG.messEverySec, cooldowns: {}, best: {},
    daily: { date: '', streak: 0 },
    settings: { music: true, sfx: true, musicVol: 40, sfxVol: 70 }, // volumes are 0-100
    totals: { coins: 0, games: 0, chores: 0 },
    last: Date.now(),
  };
}
let S = newState();

function load() {
  try {
    const raw = localStorage.getItem(CONFIG.saveKey);
    if (!raw) return;
    const d = JSON.parse(raw), defaults = newState();
    S = Object.assign(newState(), d);
    // nested objects: fill in any fields added since this save was made
    for (const k of ['stats', 'settings', 'daily', 'totals']) S[k] = Object.assign({}, defaults[k], d[k] || {});
  } catch (e) { console.warn('Could not load save', e); }
}
function save() { try { S.last = Date.now(); localStorage.setItem(CONFIG.saveKey, JSON.stringify(S)); } catch (e) {} }

const upg = id => S.upgrades[id] || 0;
const xpNeed = l => 40 + (l - 1) * 25;
const stage = () => [...STAGES].reverse().find(s => S.level >= s.min);

/* ============================ ART (optional images) ============================ */
// Any image found in assets/images replaces the built-in drawing. See README.
const IMG = {};
function probe(name) {
  const exts = ['png', 'webp', 'jpg', 'jpeg'];
  return new Promise(res => {
    let i = 0;
    const tryNext = () => {
      if (i >= exts.length) return res(false);
      const img = new Image(), src = `assets/images/${name}.${exts[i++]}`;
      img.onload = () => { IMG[name] = src; res(true); };
      img.onerror = tryNext;
      img.src = src;
    };
    tryNext();
  });
}
function probeAll() {
  const names = ['koala_idle', 'koala_happy', 'koala_sad', 'koala_sleep', 'koala_eat', 'koala_dirty',
    'bg_bedroom', 'bg_bathroom', 'bg_kitchen', 'bg_garden', 'bg_playroom', 'bg_sky', 'logo',
    ...WALLPAPERS.map(w => 'bg_bedroom_' + w.id),
    ...OUTFITS.map(o => 'acc_' + o.id)];
  return Promise.all(names.map(probe));
}

/* ---- the built-in koala drawing (used until you add Grok art) ---- */
// scalloped "fluffy" circle outline
function fluff(cx, cy, r, n, amp) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = i / n * 2 * Math.PI, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    if (i === 0) { d += `M${x.toFixed(1)} ${y.toFixed(1)}`; continue; }
    const m = (i - 0.5) / n * 2 * Math.PI;
    d += ` Q${(cx + (r + amp) * Math.cos(m)).toFixed(1)} ${(cy + (r + amp) * Math.sin(m)).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d + 'Z';
}
// Mochi: modeled on assets/reference/koala_reference.jpg
function petSVG(mood = 'idle') {
  const L = '#5e606b', F = '#b4b6be', FL = '#c9cbd2', B = '#f4f1ec', E = '#1f1f29', PAD = '#7f818a';
  const eyeOpen = x => `<ellipse cx="${x}" cy="97" rx="12" ry="13" fill="#fff"/><ellipse cx="${x + 1}" cy="97.5" rx="10.5" ry="11.5" fill="${E}"/>
    <circle cx="${x + 5}" cy="92" r="4.2" fill="#fff"/><circle cx="${x - 3}" cy="102" r="2" fill="#fff" opacity=".8"/>`;
  const eyeArc = x => `<path d="M${x - 11} 100 Q${x} 86 ${x + 11} 100" fill="none" stroke="${E}" stroke-width="5" stroke-linecap="round"/>`;
  const eyeShut = x => `<path d="M${x - 11} 96 Q${x} 105 ${x + 11} 96" fill="none" stroke="${E}" stroke-width="4.5" stroke-linecap="round"/>`;
  const brows = (tilt = 0) => `<path d="M60 ${78 + tilt} Q70 ${71 - tilt} 80 ${77 - tilt} M120 ${77 - tilt} Q130 ${71 - tilt} 140 ${78 + tilt}" stroke="#80828c" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  const foot = cx => `<ellipse cx="${cx}" cy="203" rx="23" ry="15" fill="${F}" stroke="${L}" stroke-width="3.2"/>
    <ellipse cx="${cx}" cy="207" rx="9" ry="6.5" fill="${PAD}"/><circle cx="${cx - 10}" cy="198" r="3.3" fill="${PAD}"/><circle cx="${cx}" cy="195" r="3.3" fill="${PAD}"/><circle cx="${cx + 10}" cy="198" r="3.3" fill="${PAD}"/>`;
  const openMouth = `<path d="M87 129 Q100 147 113 129 Q100 134 87 129Z" fill="#7a2e3e" stroke="${E}" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="100" cy="137.5" rx="6" ry="3.5" fill="#f07a93"/>`;
  let eyes, mouth, extra = '', browTilt = 0;
  if (mood === 'happy') { eyes = eyeArc(70) + eyeArc(130); mouth = openMouth; }
  else if (mood === 'eat') { eyes = eyeArc(70) + eyeArc(130); mouth = `<ellipse cx="100" cy="135" rx="7.5" ry="6.5" fill="#7a2e3e" stroke="${E}" stroke-width="2.4"/><ellipse cx="100" cy="138" rx="4.5" ry="2.5" fill="#f07a93"/>`; }
  else if (mood === 'sleep') { eyes = eyeShut(70) + eyeShut(130); mouth = `<path d="M93 132 Q100 137 107 132" stroke="${E}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`; }
  else if (mood === 'sad') { eyes = eyeOpen(70) + eyeOpen(130); browTilt = 4; mouth = `<path d="M89 139 Q100 130 111 139" stroke="${E}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`; extra += `<path d="M58 106 q-5 9 0 12 q5 -3 0 -12z" fill="#8fd3ff"/>`; }
  else { eyes = eyeOpen(70) + eyeOpen(130); mouth = `<path d="M87 130 Q100 142 113 130" stroke="${E}" stroke-width="2.8" fill="none" stroke-linecap="round"/><path d="M95 136 Q100 140 105 136" stroke="#e8557a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`; }
  if (mood === 'dirty') extra += `<g fill="#9b7653" opacity=".78"><ellipse cx="146" cy="70" rx="10" ry="6"/><circle cx="52" cy="130" r="6"/><ellipse cx="118" cy="182" rx="10" ry="7"/><circle cx="84" cy="168" r="4.5"/><circle cx="152" cy="122" r="3.5"/></g>`;
  return `<svg class="pet-base" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
  <path d="${fluff(30, 60, 33, 14, 5)}" fill="${F}" stroke="${L}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="${fluff(170, 60, 33, 14, 5)}" fill="${F}" stroke="${L}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="${fluff(31, 63, 20, 11, 4)}" fill="${B}"/><path d="${fluff(169, 63, 20, 11, 4)}" fill="${B}"/>
  <path d="M22 56 q5 6 3 13 M33 52 q4 7 1 14 M178 56 q-5 6 -3 13 M167 52 q-4 7 -1 14" stroke="${FL}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="100" cy="176" rx="54" ry="40" fill="${F}" stroke="${L}" stroke-width="3.2"/>
  <ellipse cx="100" cy="180" rx="31" ry="28" fill="${B}"/>
  <g fill="${F}" stroke="${L}" stroke-width="3.2">
    <ellipse cx="68" cy="168" rx="14" ry="21" transform="rotate(-28 68 168)"/>
    <ellipse cx="132" cy="168" rx="14" ry="21" transform="rotate(28 132 168)"/>
  </g>
  <path d="M74 183 l-1 -5 M80 181 l0 -5 M126 183 l1 -5 M120 181 l0 -5" stroke="${L}" stroke-width="2" stroke-linecap="round"/>
  ${foot(64)}${foot(136)}
  <ellipse cx="100" cy="94" rx="72" ry="58" fill="${F}" stroke="${L}" stroke-width="3.2"/>
  <path d="M84 41 Q89 26 97 36 Q102 22 109 36 Q117 27 118 41" fill="${F}" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="100" cy="64" rx="34" ry="16" fill="${FL}" opacity=".45"/>
  <ellipse cx="48" cy="120" rx="11" ry="6" fill="#ffb3c8" opacity=".6"/><ellipse cx="152" cy="120" rx="11" ry="6" fill="#ffb3c8" opacity=".6"/>
  <ellipse cx="100" cy="128" rx="25" ry="15" fill="${B}"/>
  <path d="M78 125 L46 118 M78 130 L48 132 M122 125 L154 118 M122 130 L152 132" stroke="#fff" stroke-width="1.3" opacity=".85"/>
  ${brows(browTilt)}
  ${eyes}
  <path d="M100 89 C88 89 85 103 86 112 C87 122 93 126 100 126 C107 126 113 122 114 112 C115 103 112 89 100 89 Z" fill="#2e2e36"/>
  <ellipse cx="94" cy="99" rx="4" ry="6" fill="#fff" opacity=".22" transform="rotate(-12 94 99)"/>
  ${mouth}
  ${extra}
</svg>`;
}

/* ---- built-in outfit drawings (100x100 each) ---- */
const LN = '#4a4a5e';
const SV = inner => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const heart = (cx, cy, s) => `M${cx} ${cy + s * .9} C${cx - s * 1.5} ${cy}, ${cx - s * .8} ${cy - s}, ${cx} ${cy - s * .3} C${cx + s * .8} ${cy - s}, ${cx + s * 1.5} ${cy}, ${cx} ${cy + s * .9} Z`;
const bow = (c, c2) => SV(`<g stroke="${LN}" stroke-width="4" stroke-linejoin="round" transform="rotate(-14 50 50)"><path d="M50 50 L13 25 Q3 50 13 75 Z" fill="${c}"/><path d="M50 50 L87 25 Q97 50 87 75 Z" fill="${c}"/><ellipse cx="50" cy="50" rx="11" ry="13" fill="${c2}"/></g><path d="M22 40 L30 46 M78 40 L70 46" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>`);
const ACC = {
  bow_red: () => bow('#ec4f8c', '#d63a77'),
  bow_pink: () => bow('#ffc2da', '#ffa3c7'),
  bow_mint: () => bow('#7fdcc0', '#5cc7a8'),
  flower_clip: () => SV(`<g stroke="${LN}" stroke-width="3">${[0, 72, 144, 216, 288].map(a => `<circle cx="${50 + 22 * Math.cos(a * Math.PI / 180)}" cy="${50 + 22 * Math.sin(a * Math.PI / 180)}" r="16" fill="#fff"/>`).join('')}<circle cx="50" cy="50" r="13" fill="#ffd54f"/></g>`),
  party_hat: () => SV(`<path d="M26 90 L50 16 L74 90 Z" fill="#ff8fb1" stroke="${LN}" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="44" r="5" fill="#fff59d"/><circle cx="41" cy="68" r="5" fill="#8fd3ff"/><circle cx="60" cy="74" r="5" fill="#fff59d"/><circle cx="50" cy="14" r="9" fill="#fff59d" stroke="${LN}" stroke-width="3.5"/>`),
  crown: () => SV(`<path d="M16 90 L16 44 L33 62 L50 32 L67 62 L84 44 L84 90 Z" fill="#ffd54f" stroke="${LN}" stroke-width="4" stroke-linejoin="round"/><circle cx="16" cy="42" r="5" fill="#ffd54f" stroke="${LN}" stroke-width="3"/><circle cx="50" cy="30" r="5" fill="#ffd54f" stroke="${LN}" stroke-width="3"/><circle cx="84" cy="42" r="5" fill="#ffd54f" stroke="${LN}" stroke-width="3"/><circle cx="33" cy="78" r="5" fill="#ff5c8a"/><circle cx="50" cy="76" r="6" fill="#5ab3ff"/><circle cx="67" cy="78" r="5" fill="#5cd6a0"/>`),
  beret: () => SV(`<path d="M50 60 L50 48" stroke="${LN}" stroke-width="6" stroke-linecap="round"/><ellipse cx="50" cy="76" rx="44" ry="17" fill="#e8557a" stroke="${LN}" stroke-width="4"/><path d="M18 74 Q50 64 82 74" stroke="#fff" stroke-width="3" fill="none" opacity=".4"/>`),
  bunny_ears: () => SV(`<g stroke="${LN}" stroke-width="3.5"><ellipse cx="34" cy="44" rx="12" ry="34" fill="#fff" transform="rotate(-12 34 44)"/><ellipse cx="66" cy="44" rx="12" ry="34" fill="#fff" transform="rotate(12 66 44)"/></g><ellipse cx="34" cy="46" rx="5.5" ry="24" fill="#ffc4d6" transform="rotate(-12 34 46)"/><ellipse cx="66" cy="46" rx="5.5" ry="24" fill="#ffc4d6" transform="rotate(12 66 46)"/><path d="M12 92 Q50 72 88 92" stroke="#ff8fb1" stroke-width="8" fill="none" stroke-linecap="round"/>`),
  witch_hat: () => SV(`<path d="M26 84 Q44 56 56 8 Q60 42 76 84 Z" fill="#8e6bd6" stroke="${LN}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="50" cy="86" rx="46" ry="9" fill="#8e6bd6" stroke="${LN}" stroke-width="4"/><path d="M30 78 Q50 84 72 78" stroke="#ffd54f" stroke-width="7" fill="none"/><path d="M50 40 l3 7 7 .5 -5.5 4.5 2 7 -6.5 -4 -6.5 4 2 -7 -5.5 -4.5 7 -.5z" fill="#ffd54f"/>`),
  round_glasses: () => SV(`<g fill="rgba(255,255,255,.25)" stroke="#7a4f2e" stroke-width="5"><circle cx="27" cy="50" r="17"/><circle cx="73" cy="50" r="17"/></g><path d="M44 48 Q50 42 56 48" stroke="#7a4f2e" stroke-width="5" fill="none"/>`),
  heart_glasses: () => SV(`<g fill="rgba(255,90,140,.5)" stroke="#e8557a" stroke-width="4" stroke-linejoin="round"><path d="${heart(27, 50, 17)}"/><path d="${heart(73, 50, 17)}"/></g><path d="M42 47 Q50 42 58 47" stroke="#e8557a" stroke-width="4" fill="none"/>`),
  sunglasses: () => SV(`<rect x="7" y="37" width="40" height="26" rx="12" fill="#2b2b3a"/><rect x="53" y="37" width="40" height="26" rx="12" fill="#2b2b3a"/><path d="M46 46 L54 46" stroke="#2b2b3a" stroke-width="5"/><path d="M14 44 L24 44 M60 44 L70 44" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`),
  bowtie: () => SV(`<g stroke="${LN}" stroke-width="4" stroke-linejoin="round"><path d="M50 50 L16 30 L16 70 Z" fill="#5ec4c8"/><path d="M50 50 L84 30 L84 70 Z" fill="#5ec4c8"/><rect x="41" y="40" width="18" height="20" rx="6" fill="#47aaae"/></g><g fill="#fff"><circle cx="27" cy="44" r="3"/><circle cx="26" cy="58" r="3"/><circle cx="73" cy="44" r="3"/><circle cx="74" cy="58" r="3"/></g>`),
  scarf: () => SV(`<g stroke="${LN}" stroke-width="4" stroke-linejoin="round"><path d="M62 62 L72 96 L88 92 L78 58 Z" fill="#ff7b7b"/><path d="M6 36 Q50 62 94 36 L94 54 Q50 82 6 54 Z" fill="#ff7b7b"/></g><path d="M20 46 L22 60 M36 52 L37 66 M64 52 L63 66 M80 46 L78 60 M70 78 L84 75" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>`),
  pearls: () => SV(Array.from({ length: 11 }, (_, i) => { const t = i / 10, x = (1 - t) * (1 - t) * 12 + 2 * (1 - t) * t * 50 + t * t * 88, y = (1 - t) * (1 - t) * 34 + 2 * (1 - t) * t * 78 + t * t * 34; return `<circle cx="${x}" cy="${y}" r="5.5" fill="#fffaf2" stroke="#d8cbbd" stroke-width="2"/>`; }).join('') + `<path d="${heart(50, 68, 9)}" fill="#ff8fb1" stroke="${LN}" stroke-width="3"/>`),
  tutu: () => SV(`<path d="M6 60 Q50 44 94 60 L98 74 Q90 84 82 76 Q74 86 66 77 Q58 87 50 77 Q42 87 34 77 Q26 86 18 76 Q10 84 2 74 Z" fill="#ffb3cf" stroke="${LN}" stroke-width="3.5" stroke-linejoin="round"/><path d="M14 60 Q50 48 86 60" stroke="#ff8fb1" stroke-width="7" fill="none" stroke-linecap="round"/><g fill="#fff"><circle cx="30" cy="68" r="2.5"/><circle cx="50" cy="66" r="2.5"/><circle cx="70" cy="68" r="2.5"/></g>`),
  apron: () => SV(`<path d="M28 22 L72 22 L76 90 Q50 98 24 90 Z" fill="#fff" stroke="${LN}" stroke-width="3.5" stroke-linejoin="round"/><path d="M28 22 L72 22" stroke="#ff6b8b" stroke-width="6"/><path d="M25 86 Q50 94 75 86" stroke="#ff6b8b" stroke-width="5" fill="none"/><rect x="38" y="54" width="24" height="18" rx="5" fill="#ffe3ec" stroke="#ff8fb1" stroke-width="2.5"/><path d="M46 38 Q50 30 56 28 M54 38 Q53 32 56 28" stroke="#5c9a3a" stroke-width="2.5" fill="none"/><circle cx="46" cy="40" r="5" fill="#ff4d6d"/><circle cx="55" cy="40" r="5" fill="#ff4d6d"/>`),
};
const accIcon = id => IMG['acc_' + id] ? `<img src="${IMG['acc_' + id]}" alt="">` : (ACC[id] ? ACC[id]() : '');

/* ============================ AUDIO ============================ */
let actx = null;
function tone(freq, dur, when = 0, type = 'sine', slideTo = null, vol = 0.12) {
  const t = actx.currentTime + when, o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  vol = Math.max(0.0002, vol * (S.settings.sfxVol / 100) * 1.4);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + 0.02);
}
function sfx(type) {
  if (!S.settings.sfx) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    switch (type) {
      case 'click': tone(660, .06, 0, 'triangle'); break;
      case 'coin': tone(988, .07, 0, 'square', null, .06); tone(1319, .14, .07, 'square', null, .06); break;
      case 'pop': tone(500, .09, 0, 'sine', 1300, .14); break;
      case 'eat': tone(300, .08, 0, 'triangle'); tone(260, .08, .12, 'triangle'); tone(320, .1, .24, 'triangle'); break;
      case 'bad': tone(320, .25, 0, 'sawtooth', 120, .07); break;
      case 'buy': tone(784, .08, 0, 'triangle'); tone(988, .08, .08, 'triangle'); tone(1319, .14, .16, 'triangle'); break;
      case 'happy': tone(880, .12, 0, 'sine', 1320); break;
      case 'level': [523, 659, 784, 1047].forEach((f, i) => tone(f, .16, i * .1, 'triangle', null, .14)); break;
      case 'sparkle': [1319, 1568, 2093].forEach((f, i) => tone(f, .12, i * .06, 'sine', null, .08)); break;
    }
  } catch (e) {}
}

// Background music: assets/music/bgm.mp3 (home), bgm_games.mp3 (mini-games), bgm_sleep.mp3 (bedtime). Only bgm.mp3 is required.
const bgm = $('#bgm');
const TRACKS = { home: 'bgm', games: 'bgm_games', sleep: 'bgm_sleep' };
const trackOK = {};
let curTrack = null, wantTrack = 'home', userInteracted = false;
function probeTracks() {
  for (const [k, f] of Object.entries(TRACKS)) {
    for (const ext of ['mp3', 'm4a', 'wav', 'ogg']) {
      const a = new Audio();
      a.preload = 'metadata';
      a.addEventListener('loadedmetadata', () => { if (!trackOK[k]) { trackOK[k] = `assets/music/${f}.${ext}`; updateMusic(); } }, { once: true });
      a.src = `assets/music/${f}.${ext}`;
    }
  }
}
// slider 0-100 -> squared curve so the low end is gentle; quieter at bedtime if there's no lullaby track
function musicVolume() {
  const v = (S.settings.musicVol / 100) ** 2;
  return S.sleeping && !trackOK.sleep ? v * 0.45 : v;
}
function volumeRowsHTML() {
  return `<label class="vol-row"><span>🎵</span><input type="range" min="0" max="100" value="${S.settings.musicVol}" data-vol="musicVol"><b>${S.settings.musicVol}</b></label>
    <label class="vol-row"><span>🔔</span><input type="range" min="0" max="100" value="${S.settings.sfxVol}" data-vol="sfxVol"><b>${S.settings.sfxVol}</b></label>`;
}
function bindVolumeRows(root) {
  root.querySelectorAll('[data-vol]').forEach(inp => {
    inp.oninput = () => {
      const k = inp.dataset.vol, v = +inp.value;
      S.settings[k] = v;
      inp.nextElementSibling.textContent = v;
      if (k === 'musicVol') { S.settings.music = v > 0; userInteracted = true; updateMusic(); }
      else S.settings.sfx = v > 0;
    };
    inp.onchange = () => { if (inp.dataset.vol === 'sfxVol') sfx('coin'); save(); if (inp.dataset.vol === 'musicVol' && S.settings.music && !trackOK.home) toast('Add assets/music/bgm.mp3 to hear music 🎵'); };
  });
}
function setTrack(name) { wantTrack = name; updateMusic(); }
function updateMusic() {
  $('#btn-music').classList.toggle('off', !S.settings.music);
  if (!S.settings.music || !userInteracted) { bgm.pause(); return; }
  const src = trackOK[wantTrack] || trackOK.home;
  if (!src) return;
  if (curTrack !== src) { curTrack = src; bgm.src = src; }
  bgm.volume = musicVolume();
  bgm.play().catch(() => {});
}

/* ============================ SIMULATION ============================ */
function simulate(dt) {
  const m = dt / 60, r = CONFIG.rates, s = S.stats;
  if (S.sleeping) {
    s.energy += r.sleepEnergy * (1 + 0.5 * upg('bed')) * m;
    s.hunger -= r.sleepHunger * m;
    s.clean -= r.clean * 0.5 * m;
  } else {
    s.hunger -= r.hunger * m;
    s.happy -= r.happy * (1 - 0.2 * upg('nest')) * m;
    s.energy -= r.energy * m;
    s.clean -= (r.clean + r.messPenalty * S.messes.length) * m;
    if (s.hunger < 20 || s.clean < 20) s.happy -= 0.8 * m;
    S.nextMess -= dt;
    while (S.nextMess <= 0) {
      spawnMess();
      S.nextMess += CONFIG.messEverySec * (1 + 0.35 * upg('duster')) * rand(0.7, 1.3);
    }
  }
  for (const k in s) s[k] = clamp(s[k]);
}
function spawnMess() {
  if (S.messes.length >= CONFIG.maxMesses) return;
  S.messes.push({
    id: 'm' + Date.now().toString(36) + randi(0, 9999),
    icon: pick(MESS_ICONS),
    x: Math.random() < 0.5 ? rand(6, 30) : rand(70, 93),
    y: rand(70, 92),
  });
}

function currentMood() {
  if (moodOverride.until > Date.now()) return moodOverride.mood;
  const s = S.stats;
  if (S.sleeping) return 'sleep';
  if (s.clean < 30) return 'dirty';
  if (s.hunger < 25 || s.happy < 25 || s.energy < 15) return 'sad';
  if (s.happy > 70 && s.hunger > 40) return 'happy';
  return 'idle';
}
let moodOverride = { mood: null, until: 0 };
function flashMood(mood, ms = 1500) { moodOverride = { mood, until: Date.now() + ms }; renderPet(); setTimeout(() => renderPet(), ms + 30); }

/* ============================ REWARDS / LEVELS ============================ */
function earn(coins, xp) {
  const c = Math.round(coins * (1 + 0.15 * upg('piggy')));
  const x = Math.round(xp * (1 + 0.15 * upg('desk')));
  S.coins += c; S.totals.coins += c;
  if (c > 0) { const el = $('.coin-pill'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  addXP(x);
  renderTop();
  return { c, x };
}
function addXP(x) {
  S.xp += x;
  while (S.xp >= xpNeed(S.level)) { S.xp -= xpNeed(S.level); S.level++; levelUp(); }
}
function levelUp() {
  const before = STAGES.filter(s => S.level - 1 >= s.min).pop();
  const bonus = 15 * S.level;
  S.coins += bonus;
  S.stats.happy = clamp(S.stats.happy + 20);
  sfx('level'); confetti();
  toast(`🎉 Level ${S.level}! +${bonus} 🪙`);
  const st = stage();
  if (st !== before) setTimeout(() => toast(`✨ ${S.name} grew into a ${st.name}!`), 900);
  const unlocked = [...SNACKS, ...GIFTS, ...OUTFITS, ...WALLPAPERS].filter(i => i.lvl === S.level);
  if (unlocked.length) setTimeout(() => toast(`🛍️ New in the shop: ${unlocked.map(i => i.name).join(', ')}`), 1800);
  lastPetKey = '';
  save();
}

/* ============================ RENDERING ============================ */
function renderTop() {
  $('#pet-name').textContent = S.name;
  $('#lvl-badge').textContent = 'Lv ' + S.level;
  $('#stage').textContent = stage().name;
  $('#xp-fill').style.width = (S.xp / xpNeed(S.level) * 100) + '%';
  $('#xp-text').textContent = `${S.xp} / ${xpNeed(S.level)} XP`;
  $('#coin-count').textContent = S.coins;
}
function renderStats() {
  document.querySelectorAll('.stat').forEach(el => {
    const v = S.stats[el.dataset.stat];
    const f = el.querySelector('.fill');
    f.style.width = v + '%';
    f.style.backgroundColor = v > 60 ? '#7fdcc0' : v > 30 ? '#ffd96a' : '#ff7b8f';
    el.classList.toggle('low', v < 25);
  });
}
let lastPetKey = '';
function petBaseHTML(mood) {
  const order = { idle: ['idle'], happy: ['happy', 'idle'], sad: ['sad', 'idle'], sleep: ['sleep', 'idle'], eat: ['eat', 'happy', 'idle'], dirty: ['dirty', 'sad', 'idle'] };
  for (const k of order[mood] || ['idle']) if (IMG['koala_' + k]) return `<img class="pet-base" src="${IMG['koala_' + k]}" alt="">`;
  return petSVG(mood);
}
function accHTML(equipped = S.equipped) {
  return Object.entries(equipped).map(([slot, id]) => {
    if (!id) return '';
    const p = CONFIG.slots[slot];
    return `<div class="acc acc-${slot}" style="left:${p.left}%;top:${p.top}%;width:${p.width}%">${accIcon(id)}</div>`;
  }).join('');
}
function renderPet(force) {
  const mood = currentMood(), st = stage();
  const key = mood + '|' + JSON.stringify(S.equipped) + '|' + st.name;
  if (!force && key === lastPetKey) return;
  lastPetKey = key;
  const glow = st.name === 'Superstar' ? '<div class="star-glow"></div>' : '';
  let fx = '';
  if (mood === 'sleep') fx += '<div class="zzz"><span>z</span><span>z</span><span>Z</span></div>';
  if (mood === 'dirty') fx += '<div class="stink">~ ~ ~</div>';
  // order matters: body/neck pieces under face/head pieces
  const ordered = {};
  for (const slot of ['body', 'neck', 'face', 'ear', 'head']) if (S.equipped[slot]) ordered[slot] = S.equipped[slot];
  $('#pet').innerHTML = glow + petBaseHTML(mood) + accHTML(ordered) + fx;
  $('#pet-wrap').style.setProperty('--scale', st.scale);
}
function renderRoom() {
  const room = $('#room'), bg = $('#room-bg');
  room.className = 'wp-' + S.wallpaper + (S.sleeping ? ' sleeping' : '');
  const wp = WALLPAPERS.find(w => w.id === S.wallpaper) || WALLPAPERS[0];
  const own = IMG['bg_bedroom_' + wp.id] || (wp.id === 'strawberry' ? IMG.bg_bedroom : null);
  const img = own || IMG.bg_bedroom;
  if (img) {
    bg.classList.add('has-img'); room.classList.add('has-img');
    bg.style.backgroundImage = `url("${img}")`;
    bg.style.filter = own ? '' : wp.filter;
  } else {
    bg.classList.remove('has-img'); bg.style.backgroundImage = ''; bg.style.filter = '';
  }
  // shelf of gifts
  const shelf = $('#shelf'), gkey = S.gifts.join(',');
  if (shelf.dataset.key !== gkey) {
    shelf.dataset.key = gkey;
    shelf.innerHTML = S.gifts.map(id => { const g = GIFTS.find(x => x.id === id); return g ? `<button data-gift="${g.id}" title="${g.name}">${g.icon}</button>` : ''; }).join('');
  }
  renderMesses();
}
function renderMesses() {
  const el = $('#messes'), key = S.messes.map(m => m.id).join(',');
  if (el.dataset.key === key) return;
  el.dataset.key = key;
  el.innerHTML = S.messes.map(m => `<button class="mess" data-id="${m.id}" style="left:${m.x}%;top:${m.y}%">${m.icon}</button>`).join('');
}
function renderActions() {
  document.querySelectorAll('#actions button').forEach(b => {
    const a = b.dataset.act;
    b.disabled = S.sleeping && ['feed', 'play', 'clean'].includes(a);
  });
  const sb = $('#actions [data-act="sleep"]');
  sb.querySelector('span').textContent = S.sleeping ? '☀️' : '🌙';
  sb.querySelector('em').textContent = S.sleeping ? 'Wake' : 'Sleep';
}
function renderAll(force) { renderTop(); renderStats(); renderRoom(); renderPet(force); renderActions(); }

/* ============================ FX / UI BITS ============================ */
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
function floatAt(text, cx, cy, color) {
  const dev = $('#device').getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'float'; f.textContent = text;
  if (color) f.style.color = color;
  f.style.left = (cx - dev.left) + 'px'; f.style.top = (cy - dev.top) + 'px';
  $('#device').appendChild(f);
  setTimeout(() => f.remove(), 1150);
}
function petCenter() { const r = $('#pet').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height * 0.35]; }
function hearts(n = 3, icon = '💖') {
  const [x, y] = petCenter();
  for (let i = 0; i < n; i++) setTimeout(() => floatAt(icon, x + rand(-50, 50), y + rand(-20, 20)), i * 120);
}
function confetti() {
  const colors = ['#ff8fb1', '#ffd96a', '#7fdcc0', '#8fd3ff', '#b9a3ff'];
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = rand(0, 100) + '%';
    c.style.background = pick(colors);
    c.style.setProperty('--d', rand(1.6, 3) + 's');
    c.style.animationDelay = rand(0, .4) + 's';
    $('#device').appendChild(c);
    setTimeout(() => c.remove(), 3600);
  }
}
let speechTimer = null;
function say(text, ms = 3200) {
  const el = $('#speech');
  el.textContent = text;
  el.classList.remove('hidden');
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(speechTimer);
  speechTimer = setTimeout(() => el.classList.add('hidden'), ms);
}
function needLine() {
  const s = S.stats, needs = [];
  if (S.sleeping) return null;
  if (s.hunger < 35) needs.push(pick(['My tummy is rumbling... 🍓', 'Snack time? 🥺', "I'm hungry~"]));
  if (s.energy < 25) needs.push("I'm so sleepy... 😴");
  if (s.clean < 35) needs.push('I need a bath! 🛁');
  if (S.messes.length >= 4) needs.push("Eek, it's messy in here! 🧹");
  if (s.happy < 35) needs.push(pick(['Will you play with me? 🥺', "I'm a little lonely..."]));
  if (needs.length) return pick(needs);
  return pick(['I love you! 💕', 'Hehe~ ✨', 'Today is a good day! 🌸', 'Eucalyptus is the best! 🌿', 'Can we play a game? 🎮', `${S.name} is happy! 💖`, 'La la la~ 🎶', 'Boop! 🐨']);
}

/* ============================ MODAL ============================ */
let modalState = null;
function openModal(title, render, tabs = null, tab = null) {
  modalState = { title, render, tabs, tab: tab || (tabs && tabs[0].id) };
  $('#modal-title').textContent = title;
  $('#modal').classList.remove('hidden');
  drawModal(true);
}
function drawModal(resetScroll) {
  const m = modalState; if (!m) return;
  const tabsEl = $('#modal-tabs');
  if (m.tabs) {
    tabsEl.innerHTML = m.tabs.map(t => `<button class="tab ${t.id === m.tab ? 'on' : ''}" data-tab="${t.id}">${t.label}</button>`).join('');
    tabsEl.style.display = '';
  } else { tabsEl.innerHTML = ''; tabsEl.style.display = 'none'; }
  const body = $('#modal-body'), st = body.scrollTop;
  body.innerHTML = '';
  m.render(body, m.tab);
  body.scrollTop = resetScroll ? 0 : st;
}
function closeModal() { $('#modal').classList.add('hidden'); modalState = null; }

/* ============================ ACTIONS ============================ */
function petThePet(e) {
  sfx('happy');
  const p = $('#pet'); p.classList.remove('squish'); void p.offsetWidth; p.classList.add('squish');
  setTimeout(() => p.classList.remove('squish'), 460);
  if (S.sleeping) { say('Zzz... 💤 (shhh!)', 1800); return; }
  const now = Date.now();
  if (!petThePet.last || now - petThePet.last > 1500) { S.stats.happy = clamp(S.stats.happy + 2); petThePet.last = now; }
  hearts(2);
  flashMood('happy', 1200);
  if (Math.random() < 0.35) say(pick(['Hehe, that tickles! 🤭', 'More pats please! 💕', 'Nuzzle nuzzle~', 'Yay! ✨']), 2000);
  renderStats();
}

function openFeed() {
  openModal('Snack Time 🍙', body => {
    const owned = SNACKS.filter(s => S.inv[s.id] > 0);
    if (!owned.length) {
      body.innerHTML = `<div class="empty">Your fridge is empty! 🥺<br><br><button class="btn" id="go-shop">Go to the Shop</button></div>`;
      body.querySelector('#go-shop').onclick = () => openShop('snacks');
      return;
    }
    body.innerHTML = `<div class="cards">${owned.map(s => `<button class="card" data-feed="${s.id}"><span class="have">x${S.inv[s.id]}</span><div class="card-ico">${s.icon}</div><div class="card-name">${s.name}</div><div class="card-desc">${effectText(s)}</div></button>`).join('')}</div>
      <p class="tip" style="text-align:center;margin-top:12px">Need more? Snacks are in the Shop 🛍️</p>`;
    body.querySelectorAll('[data-feed]').forEach(b => b.onclick = () => feed(b.dataset.feed));
  });
}
function effectText(s) {
  const parts = [];
  if (s.hunger) parts.push(`🍓+${s.hunger}`);
  if (s.happy) parts.push(`💖+${s.happy}`);
  if (s.energy) parts.push(`⚡+${s.energy}`);
  return parts.join('  ');
}
function feed(id) {
  const s = SNACKS.find(x => x.id === id);
  if (!s || !(S.inv[id] > 0)) return;
  if (S.stats.hunger >= 97) { say("I'm sooo full! 🫃", 2000); sfx('bad'); return; }
  const mult = 1 + 0.2 * upg('fridge');
  S.inv[id]--;
  S.stats.hunger = clamp(S.stats.hunger + s.hunger * mult);
  S.stats.happy = clamp(S.stats.happy + (s.happy || 0) * mult);
  S.stats.energy = clamp(S.stats.energy + (s.energy || 0) * mult);
  earn(0, 2);
  closeModal();
  sfx('eat'); flashMood('eat', 1600); hearts(1, s.icon);
  setTimeout(() => say(pick(['Yummy! 😋', 'Nom nom nom~', 'Delicious! 💕', `I love ${s.name.toLowerCase()}!`]), 2200), 300);
  renderAll(); save();
}

function toggleSleep() {
  S.sleeping = !S.sleeping;
  sfx('click');
  if (S.sleeping) { say(S.stats.energy > 85 ? "I'm not very sleepy... but okay! 🌙" : 'Goodnight! 🌙', 2200); setTrack('sleep'); }
  else { say('Good morning! ☀️', 2000); setTrack('home'); }
  renderAll(); save();
}

function cleanMess(id, e) {
  const i = S.messes.findIndex(m => m.id === id);
  if (i < 0) return;
  S.messes.splice(i, 1);
  S.stats.clean = clamp(S.stats.clean + 5);
  const r = earn(3, 3);
  sfx('pop');
  floatAt(`+${r.c} 🪙`, e.clientX, e.clientY);
  S.totals.chores++;
  renderMesses(); renderStats();
  if (!S.messes.length) { say('Sparkly clean! ✨', 2000); hearts(2, '✨'); }
  save();
}

function playWithGift(id, e) {
  const g = GIFTS.find(x => x.id === id);
  if (!g) return;
  if (S.sleeping) { say('Zzz... 💤', 1500); return; }
  const key = 'gift_' + id, now = Date.now();
  floatAt(g.icon, e.clientX, e.clientY);
  if ((S.cooldowns[key] || 0) > now) { say(`I love my ${g.name}! 💕`, 1800); return; }
  S.cooldowns[key] = now + 30000;
  S.stats.happy = clamp(S.stats.happy + 4);
  sfx('happy'); hearts(2); flashMood('happy', 1500);
  say(`Wheee! Playing with my ${g.name}! ${g.icon}`, 2200);
  renderStats(); save();
}

/* ============================ SHOP ============================ */
const SHOP_TABS = [
  { id: 'snacks', label: '🍓 Snacks' }, { id: 'gifts', label: '🎁 Gifts' }, { id: 'outfits', label: '🎀 Outfits' },
  { id: 'upgrades', label: '⬆️ Upgrades' }, { id: 'rooms', label: '🏠 Rooms' },
];
function openShop(tab) { openModal('Kawaii Shop 🛍️', renderShop, SHOP_TABS, tab); }
function cardHTML(it) {
  const locked = S.level < (it.lvl || 1);
  let btn;
  if (locked) btn = `<div class="lock">🔒 Level ${it.lvl}</div>`;
  else if (it.ownedLabel) btn = it.ownedLabel;
  else btn = `<button class="buy" data-buy="${it.id}" ${S.coins < it.price ? 'disabled' : ''}>🪙 ${it.price}</button>`;
  return `<div class="card ${locked ? 'locked' : ''}">${it.badge || ''}<div class="card-ico">${it.iconHTML}</div><div class="card-name">${it.name}</div><div class="card-desc">${it.desc}</div>${btn}</div>`;
}
function renderShop(body, tab) {
  let items = [];
  if (tab === 'snacks') items = SNACKS.map(s => ({ ...s, iconHTML: s.icon, desc: effectText(s), badge: S.inv[s.id] ? `<span class="have">x${S.inv[s.id]}</span>` : '' }));
  if (tab === 'gifts') items = GIFTS.map(g => ({ ...g, iconHTML: g.icon, desc: `💖+${g.happy} · sits on your shelf`, ownedLabel: S.gifts.includes(g.id) ? '<div class="owned-tag">✓ Owned</div>' : null }));
  if (tab === 'outfits') items = OUTFITS.filter(o => o.price > 0).map(o => ({ ...o, iconHTML: accIcon(o.id), desc: SLOT_NAMES[o.slot], ownedLabel: S.outfits.includes(o.id) ? '<div class="owned-tag">✓ Owned</div>' : null }));
  if (tab === 'upgrades') items = UPGRADES.map(u => {
    const lv = upg(u.id), maxed = lv >= u.costs.length;
    return { ...u, iconHTML: u.icon, lvl: 1, price: maxed ? 0 : u.costs[lv], desc: `${u.desc}<br><b>${'★'.repeat(lv)}${'☆'.repeat(u.costs.length - lv)}</b>`, ownedLabel: maxed ? '<div class="owned-tag">★ MAX</div>' : null };
  });
  if (tab === 'rooms') items = WALLPAPERS.map(w => {
    const owned = S.wallpapers.includes(w.id), using = S.wallpaper === w.id;
    return { ...w, iconHTML: w.icon, desc: 'Room theme', ownedLabel: owned ? (using ? '<div class="owned-tag">✓ Using</div>' : `<button class="buy" data-use="${w.id}">Use</button>`) : null };
  });
  body.innerHTML = `<div class="shop-coins">You have 🪙 <b>${S.coins}</b></div><div class="cards">${items.map(cardHTML).join('')}</div>`;
  body.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => buy(tab, b.dataset.buy));
  body.querySelectorAll('[data-use]').forEach(b => b.onclick = () => { S.wallpaper = b.dataset.use; sfx('click'); renderRoom(); save(); drawModal(); });
}
function buy(tab, id) {
  const list = { snacks: SNACKS, gifts: GIFTS, outfits: OUTFITS, upgrades: UPGRADES, rooms: WALLPAPERS }[tab];
  const it = list.find(x => x.id === id);
  if (!it) return;
  const price = tab === 'upgrades' ? it.costs[upg(id)] : it.price;
  if (price == null) return;
  if (S.coins < price) { sfx('bad'); toast('Not enough coins! Play games or do chores 🧽'); return; }
  S.coins -= price;
  sfx('buy');
  if (tab === 'snacks') { S.inv[id] = (S.inv[id] || 0) + 1; toast(`${it.icon} ${it.name} added to your fridge!`); }
  if (tab === 'gifts') { S.gifts.push(id); S.stats.happy = clamp(S.stats.happy + it.happy); say(`A ${it.name}?! I love it! 💕`); hearts(4); flashMood('happy', 2000); }
  if (tab === 'outfits') { S.outfits.push(id); S.equipped[it.slot] = id; say('Do I look cute? 🥰'); hearts(3, '✨'); }
  if (tab === 'upgrades') { S.upgrades[id] = upg(id) + 1; toast(`${it.icon} ${it.name} upgraded!`); }
  if (tab === 'rooms') { S.wallpapers.push(id); S.wallpaper = id; toast(`🏠 ${it.name} room unlocked!`); }
  earn(0, Math.max(1, Math.round(price / 10)));
  renderAll(); save(); drawModal();
}

/* ============================ CLOSET ============================ */
function openCloset() {
  openModal('Closet 🎀', body => {
    let html = '';
    for (const slot of Object.keys(SLOT_NAMES)) {
      const owned = OUTFITS.filter(o => o.slot === slot && S.outfits.includes(o.id));
      html += `<h4 class="sec">${SLOT_NAMES[slot]}</h4>`;
      if (!owned.length) { html += `<div class="tip">Nothing yet — check the Shop!</div>`; continue; }
      html += `<div class="cards">${owned.map(o => `<button class="card ${S.equipped[slot] === o.id ? 'equipped' : ''}" data-wear="${o.id}"><div class="card-ico">${accIcon(o.id)}</div><div class="card-name">${o.name}</div><div class="card-desc">${S.equipped[slot] === o.id ? '✓ Wearing (tap to remove)' : 'Tap to wear'}</div></button>`).join('')}</div>`;
    }
    html += `<div style="text-align:center;margin-top:16px"><button class="btn soft" id="go-shop">More outfits in the Shop</button></div>`;
    body.innerHTML = html;
    body.querySelectorAll('[data-wear]').forEach(b => b.onclick = () => {
      const o = OUTFITS.find(x => x.id === b.dataset.wear);
      S.equipped[o.slot] = S.equipped[o.slot] === o.id ? null : o.id;
      sfx('click'); renderPet(); save(); drawModal();
      if (S.equipped[o.slot]) say(pick(['So stylish! 💅', 'Cute cute cute! 🎀', 'I love it! 💕']), 1600);
    });
    body.querySelector('#go-shop').onclick = () => openShop('outfits');
  });
}

/* ============================ PLAY & CLEAN MENUS ============================ */
function openPlay() {
  openModal('Mini-Games 🎮', body => {
    body.innerHTML = `<div class="list">${GAMES.map(g => {
      const best = S.best[g.id];
      return `<button class="row-card" data-game="${g.id}"><span class="ri">${g.icon}</span><span><b>${g.name}</b><small>${g.desc}</small></span><span class="rr">⚡ -${CONFIG.gameEnergyCost}<br>${best != null ? `🏆 ${best}${g.unit ? ' ' + g.unit : ''}` : ''}</span></button>`;
    }).join('')}</div><p class="tip" style="text-align:center">Games use energy but make ${esc(S.name)} happy and earn coins + XP!</p>`;
    body.querySelectorAll('[data-game]').forEach(b => b.onclick = () => startMiniGame(GAMES.find(g => g.id === b.dataset.game)));
  });
}
function openClean() {
  openModal('Chores 🧽', body => {
    const now = Date.now();
    body.innerHTML = `<div class="list">${CHORES.map(c => {
      const wait = Math.ceil(((S.cooldowns[c.id] || 0) - now) / 1000);
      let right = c.id === 'tidy' ? `${S.messes.length} mess${S.messes.length === 1 ? '' : 'es'}` : wait > 0 ? `⏳ ${wait}s` : `🪙 ${c.coins} · ⭐ ${c.xp}`;
      return `<button class="row-card" data-chore="${c.id}" ${wait > 0 ? 'disabled' : ''}><span class="ri">${c.icon}</span><span><b>${c.name}</b><small>${c.desc}</small></span><span class="rr">${right}</span></button>`;
    }).join('')}</div>`;
    body.querySelectorAll('[data-chore]').forEach(b => b.onclick = () => startChore(CHORES.find(c => c.id === b.dataset.chore)));
  });
}

/* ============================ GAME SCREEN ============================ */
let current = null;
function setHud(html) { $('#game-hud').innerHTML = html; }
function openGameScreen(title, bgKey, cls) {
  closeModal();
  $('#game').classList.remove('hidden');
  $('#game-title').textContent = title;
  const area = $('#game-area');
  area.innerHTML = ''; area.className = '';
  if (IMG[bgKey]) area.style.background = `url("${IMG[bgKey]}") center / cover no-repeat`;
  else { area.style.background = ''; area.classList.add(cls); }
  setHud('');
  setTrack('games');
  return area;
}
function closeGameScreen() {
  if (current) current.stop();
  current = null;
  $('#game').classList.add('hidden');
  setTrack(S.sleeping ? 'sleep' : 'home');
  renderAll(true); save();
}
function showResults({ title, line, coins, xp, again }) {
  const div = document.createElement('div');
  div.className = 'results';
  div.innerHTML = `<div class="res-card"><div class="res-koala">${petSVGorImg('happy')}</div><h3>${title}</h3><p>${line}</p>
    <div class="res-rewards"><span>🪙 +${coins}</span><span>⭐ +${xp} XP</span></div>
    <div class="res-btns">${again ? '<button class="btn soft" data-r="again">Again!</button>' : ''}<button class="btn" data-r="home">Back home</button></div></div>`;
  $('#game-area').appendChild(div);
  sfx('coin');
  div.querySelector('[data-r="home"]').onclick = closeGameScreen;
  if (again) div.querySelector('[data-r="again"]').onclick = again;
}
function petSVGorImg(mood) {
  const html = petBaseHTML(mood);
  return html.startsWith('<img') ? html.replace('class="pet-base"', 'style="width:100%"') : html;
}

function startMiniGame(g) {
  if (S.sleeping) return;
  if (S.stats.energy < CONFIG.gameEnergyCost) {
    closeModal(); closeGameScreenIfOpen();
    sfx('bad'); say("I'm too sleepy to play... 😴 Let me nap first!", 2800); return;
  }
  S.stats.energy = clamp(S.stats.energy - CONFIG.gameEnergyCost);
  const area = openGameScreen(g.name, g.bg, g.cls);
  current = g.run(area, res => {
    current = null;
    S.stats.happy = clamp(S.stats.happy + 15);
    S.totals.games++;
    const best = S.best[g.id];
    const isBest = best == null || (g.lowerBetter ? res.score < best : res.score > best);
    if (isBest) S.best[g.id] = res.score;
    const r = earn(res.coins, res.xp);
    showResults({ title: isBest ? 'New best! 🏆' : 'Great job! 💕', line: res.text, coins: r.c, xp: r.x, again: () => startMiniGame(g) });
    save();
  });
}
function closeGameScreenIfOpen() { if (!$('#game').classList.contains('hidden')) closeGameScreen(); }

function startChore(c) {
  if (c.id === 'tidy') {
    closeModal();
    if (S.messes.length) say('Tap the messes to clean them up! 🧹', 2600);
    else say('The room is already sparkly! ✨', 2200);
    return;
  }
  if (S.stats.energy < CONFIG.choreEnergyCost) { closeModal(); sfx('bad'); say('Too tired for chores... 😴', 2200); return; }
  S.stats.energy = clamp(S.stats.energy - CONFIG.choreEnergyCost);
  const area = openGameScreen(c.name, c.bg, c.cls);
  current = scrubGame(area, choreStages(c.id), () => {
    current = null;
    S.cooldowns[c.id] = Date.now() + c.cd * 1000;
    S.totals.chores++;
    if (c.id === 'bath') { S.stats.clean = 100; S.stats.happy = clamp(S.stats.happy + 5); }
    else S.stats.clean = clamp(S.stats.clean + 10);
    const r = earn(c.coins, c.xp);
    showResults({ title: 'Squeaky clean! ✨', line: c.id === 'bath' ? `${esc(S.name)} smells like strawberries now 🍓` : 'Great helping! 🧽', coins: r.c, xp: r.x });
    save();
  });
}

/* ============================ MINI-GAME: LEAF CATCH ============================ */
function gameLeafCatch(area, done) {
  const cv = document.createElement('canvas'); cv.className = 'full'; area.appendChild(cv);
  const ctx = cv.getContext('2d'), dpr = window.devicePixelRatio || 1;
  const rect = area.getBoundingClientRect(), W = rect.width, H = rect.height;
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const koala = new Image(); koala.src = IMG.koala_happy || IMG.koala_idle || svgDataURL(petSVG('happy'));
  const TOTAL = 40;
  let px = W / 2, score = 0, lives = 3, time = TOTAL, items = [], pops = [], spawnT = 0.5, last = performance.now(), running = true, raf, hurt = 0;
  const keys = {};
  const kd = e => { keys[e.key] = true; }, ku = e => { keys[e.key] = false; };
  window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
  const move = e => { const r = cv.getBoundingClientRect(); px = clamp(e.clientX - r.left, 40, W - 40); };
  cv.addEventListener('pointermove', move); cv.addEventListener('pointerdown', move);

  function loop(t) {
    if (!running) return;
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    time -= dt; hurt = Math.max(0, hurt - dt);
    if (keys.ArrowLeft || keys.a) px -= 440 * dt;
    if (keys.ArrowRight || keys.d) px += 440 * dt;
    px = clamp(px, 40, W - 40);
    const diff = 1 + (TOTAL - time) / TOTAL;
    spawnT -= dt;
    if (spawnT <= 0) {
      spawnT = rand(0.35, 0.75) / diff;
      const r = Math.random();
      items.push({ x: rand(24, W - 24), y: -30, vy: rand(110, 170) * diff, kind: r < 0.1 ? 'star' : r < 0.32 ? 'bee' : 'leaf', rot: rand(0, 6), vr: rand(-2, 2), ph: rand(0, 6) });
    }
    const by = H - 64;
    for (const it of items) {
      it.y += it.vy * dt; it.rot += it.vr * dt;
      if (it.kind === 'bee') it.x += Math.sin(it.y / 28 + it.ph) * 1.6;
      if (!it.dead && it.y > by - 22 && it.y < by + 16 && Math.abs(it.x - px) < 50) {
        it.dead = true;
        if (it.kind === 'bee') { lives--; hurt = 0.5; sfx('bad'); pops.push({ x: it.x, y: it.y, t: 0.8, txt: '💥' }); }
        else { const v = it.kind === 'star' ? 5 : 1; score += v; sfx(v > 1 ? 'sparkle' : 'coin'); pops.push({ x: it.x, y: it.y, t: 0.8, txt: '+' + v }); }
      }
      if (it.y > H + 40) it.dead = true;
    }
    items = items.filter(i => !i.dead);
    pops.forEach(p => { p.t -= dt; p.y -= 40 * dt; }); pops = pops.filter(p => p.t > 0);
    draw(by);
    setHud(`🍃 ${score} · ${'❤️'.repeat(Math.max(0, lives))} · ⏱ ${Math.max(0, Math.ceil(time))}`);
    if (time <= 0 || lives <= 0) {
      running = false; cleanup();
      return done({ score, coins: score + 5, xp: Math.round(score * 0.8) + 5, text: `You caught <b>${score}</b> leaves! 🍃` });
    }
    raf = requestAnimationFrame(loop);
  }
  function draw(by) {
    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const it of items) {
      ctx.save(); ctx.translate(it.x, it.y); if (it.kind === 'leaf') ctx.rotate(it.rot);
      ctx.font = (it.kind === 'star' ? 34 : 32) + 'px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
      ctx.fillText(it.kind === 'leaf' ? '🌿' : it.kind === 'star' ? '⭐' : '🐝', 0, 0);
      ctx.restore();
    }
    // koala holding a basket
    const kw = 96, kh = kw * 1.1;
    ctx.globalAlpha = hurt > 0 && Math.floor(hurt * 12) % 2 ? 0.4 : 1;
    if (koala.complete && koala.naturalWidth) ctx.drawImage(koala, px - kw / 2, by - kh + 26, kw, kh);
    ctx.fillStyle = '#d9a066'; ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px - 50, by - 12); ctx.lineTo(px + 50, by - 12); ctx.lineTo(px + 40, by + 22); ctx.lineTo(px - 40, by + 22); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px - 46, by - 1); ctx.lineTo(px + 46, by - 1); ctx.moveTo(px - 43, by + 10); ctx.lineTo(px + 43, by + 10); ctx.stroke();
    ctx.fillStyle = '#ff8fb1'; ctx.beginPath(); ctx.arc(px + 40, by - 12, 7, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = 'bold 20px Fredoka, sans-serif'; ctx.fillStyle = '#e8557a';
    for (const p of pops) { ctx.globalAlpha = Math.min(1, p.t * 2); ctx.fillText(p.txt, p.x, p.y); }
    ctx.globalAlpha = 1;
  }
  function cleanup() { cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); }
  raf = requestAnimationFrame(loop);
  return { stop() { running = false; cleanup(); } };
}

/* ============================ MINI-GAME: MEMORY MATCH ============================ */
function gameMemory(area, done) {
  const icons = ['🍓', '🧁', '🌸', '🎀', '🍯', '🌿', '⭐', '🧸'];
  const deck = shuffle([...icons, ...icons]);
  area.innerHTML = `<div class="mem-grid">${deck.map((ic, i) => `<button class="mem-card" data-i="${i}"><span class="front">${ic}</span><span class="back">🐨</span></button>`).join('')}</div>`;
  let first = null, lock = false, moves = 0, matched = 0, alive = true;
  const t0 = Date.now();
  const hud = () => setHud(`🃏 ${moves} moves · ⏱ ${Math.floor((Date.now() - t0) / 1000)}s`);
  const iv = setInterval(hud, 500); hud();
  area.querySelectorAll('.mem-card').forEach(card => card.onclick = () => {
    if (lock || !alive || card.classList.contains('flipped')) return;
    card.classList.add('flipped'); sfx('click');
    if (!first) { first = card; return; }
    moves++;
    const a = first, b = card; first = null;
    if (deck[a.dataset.i] === deck[b.dataset.i]) {
      a.classList.add('matched'); b.classList.add('matched'); matched++; sfx('coin');
      if (matched === icons.length) {
        clearInterval(iv); hud();
        setTimeout(() => { if (alive) done({ score: moves, coins: Math.max(12, 60 - (moves - 8) * 3), xp: 20, text: `All pairs found in <b>${moves}</b> moves! 🧠` }); }, 600);
      }
    } else {
      lock = true;
      setTimeout(() => { a.classList.remove('flipped'); b.classList.remove('flipped'); lock = false; }, 750);
    }
    hud();
  });
  return { stop() { alive = false; clearInterval(iv); } };
}

/* ============================ MINI-GAME: BUBBLE POP ============================ */
function gameBubbles(area, done) {
  area.innerHTML = '<div class="bubble-field"></div>';
  const field = area.querySelector('.bubble-field');
  const H = area.getBoundingClientRect().height;
  field.style.setProperty('--h', H + 'px');
  let score = 0, time = 30, spawn = 0, alive = true;
  const iv = setInterval(() => {
    if (!alive) return;
    time -= 0.1; spawn -= 0.1;
    if (spawn <= 0) {
      spawn = rand(0.25, 0.55);
      const r = Math.random(), kind = r < 0.07 ? 'star' : r < 0.2 ? 'heart' : 'plain';
      const size = kind === 'plain' ? rand(48, 80) : 62;
      const b = document.createElement('div');
      b.className = 'bubble';
      b.style.cssText = `left:${rand(2, 82)}%;width:${size}px;height:${size}px;--dur:${rand(3.2, 5.5) * (1 - (30 - time) / 90)}s`;
      b.innerHTML = `<div class="b">${kind === 'star' ? '⭐' : kind === 'heart' ? '💖' : ''}</div>`;
      b.dataset.v = kind === 'star' ? 5 : kind === 'heart' ? 3 : 1;
      b.addEventListener('animationend', ev => { if (ev.target === b) b.remove(); });
      b.querySelector('.b').addEventListener('pointerdown', ev => {
        if (b.classList.contains('popped')) return;
        b.classList.add('popped');
        const v = +b.dataset.v; score += v;
        sfx(v > 1 ? 'sparkle' : 'pop');
        floatAt('+' + v, ev.clientX, ev.clientY, '#e8557a');
        setTimeout(() => b.remove(), 260);
      });
      field.appendChild(b);
    }
    setHud(`🫧 ${score} · ⏱ ${Math.max(0, Math.ceil(time))}`);
    if (time <= 0) {
      alive = false; clearInterval(iv);
      field.querySelectorAll('.bubble').forEach(b => b.remove());
      done({ score, coins: score, xp: Math.round(score * 0.6) + 5, text: `You popped <b>${score}</b> points of bubbles! 🫧` });
    }
  }, 100);
  return { stop() { alive = false; clearInterval(iv); } };
}

/* ============================ CHORES: SCRUB ENGINE ============================ */
const PLATE_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#9ec9ff" stroke-width="5"/><circle cx="50" cy="50" r="33" fill="#f7fbff" stroke="#d6e9ff" stroke-width="2"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="${heart(50 + 40 * Math.cos(a * Math.PI / 180), 50 + 40 * Math.sin(a * Math.PI / 180), 3)}" fill="#ffb3cf"/>`).join('')}</svg>`;
const WINDOW_SVG = `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9dcff"/><stop offset="1" stop-color="#eaf8ff"/></linearGradient></defs><rect x="6" y="6" width="188" height="208" rx="16" fill="#fff" stroke="#e7b48a" stroke-width="8"/><rect x="20" y="20" width="160" height="180" rx="8" fill="url(#sk)"/><circle cx="145" cy="55" r="18" fill="#ffe17a"/><g fill="#fff"><ellipse cx="60" cy="70" rx="26" ry="12"/><ellipse cx="78" cy="62" rx="18" ry="12"/><ellipse cx="130" cy="130" rx="24" ry="10"/><ellipse cx="146" cy="124" rx="14" ry="10"/></g><path d="M20 180 Q60 160 100 180 T180 175 L180 200 L20 200 Z" fill="#a8e6a0"/><path d="M100 20 V200 M20 110 H180" stroke="#fff" stroke-width="8"/></svg>`;
function choreStages(id) {
  if (id === 'bath') return [{ html: `<div class="bath-wrap">${petSVGorImg('dirty')}<div class="tub"></div></div>`, aspect: '200 / 220', region: { cx: .5, cy: .42, rx: .32, ry: .32 }, colors: ['#8b6b4a', '#a0785a', '#7a5c3e'], blobs: 22 }];
  if (id === 'dishes') return [0, 1, 2].map(() => ({ html: PLATE_SVG, aspect: '1 / 1', region: { cx: .5, cy: .5, rx: .36, ry: .36 }, colors: ['#d9534f', '#e8a33d', '#8bc34a', '#c27c3e'], blobs: 14 }));
  return [{ html: WINDOW_SVG, aspect: '200 / 220', region: { rect: true, x0: .14, x1: .86, y0: .14, y1: .86 }, colors: ['#9a9a9a', '#a1887f', '#b0b0b0'], blobs: 26 }];
}
function scrubGame(area, stages, done) {
  area.innerHTML = `<div class="scrub-wrap"><div class="scrub-tip">Rub to scrub! 🧽</div><div class="scrub-target"></div><div class="scrub-progress"><div></div></div></div><div class="sponge">🧽</div>`;
  const tgt = area.querySelector('.scrub-target'), sponge = area.querySelector('.sponge'), bar = area.querySelector('.scrub-progress div');
  let idx = 0, alive = true, busy = false, cv, ctx, initial = 1, down = false, lastP = null, lastSoap = 0;
  function setup() {
    const st = stages[idx];
    tgt.style.aspectRatio = st.aspect;
    tgt.innerHTML = st.html + '<canvas></canvas>';
    cv = tgt.querySelector('canvas');
    const r = tgt.getBoundingClientRect();
    cv.width = Math.round(r.width); cv.height = Math.round(r.height);
    ctx = cv.getContext('2d');
    paintDirt(st);
    initial = Math.max(1, countDirt());
    bar.style.width = '0%'; busy = false;
    setHud(stages.length > 1 ? `🧽 ${idx + 1} / ${stages.length}` : '');
    cv.addEventListener('pointerdown', e => { down = true; lastP = pos(e); try { cv.setPointerCapture(e.pointerId); } catch (_) {} scrub(e); });
    cv.addEventListener('pointermove', e => { if (down) scrub(e); });
    const up = () => { down = false; lastP = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  }
  function paintDirt(st) {
    const W = cv.width, H = cv.height, g = st.region;
    for (let i = 0; i < st.blobs; i++) {
      let x, y;
      if (g.rect) { x = rand(g.x0, g.x1) * W; y = rand(g.y0, g.y1) * H; }
      else { const a = rand(0, Math.PI * 2), d = Math.sqrt(Math.random()); x = (g.cx + Math.cos(a) * d * g.rx) * W; y = (g.cy + Math.sin(a) * d * g.ry) * H; }
      ctx.fillStyle = pick(st.colors); ctx.globalAlpha = rand(.7, .9);
      const R = rand(.05, .1) * W;
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(x + rand(-R, R) * .5, y + rand(-R, R) * .5, R * rand(.45, .85), 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }
  function countDirt() {
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 16) if (d[i] > 40) n++;
    return n;
  }
  function pos(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; }
  function scrub(e) {
    if (busy) return;
    const p = pos(e), R = cv.width * 0.09;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round'; ctx.lineWidth = R * 2;
    ctx.beginPath(); ctx.moveTo((lastP || p).x, (lastP || p).y); ctx.lineTo(p.x + 0.1, p.y); ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    lastP = p;
    const now = performance.now();
    if (now - lastSoap > 70) {
      lastSoap = now;
      const ar = area.getBoundingClientRect(), s = document.createElement('div'), sz = rand(10, 26);
      s.className = 'soap';
      s.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - ar.left + rand(-20, 20)}px;top:${e.clientY - ar.top + rand(-20, 20)}px`;
      area.appendChild(s); setTimeout(() => s.remove(), 900);
    }
  }
  const moveSponge = e => { const ar = area.getBoundingClientRect(); sponge.style.left = (e.clientX - ar.left) + 'px'; sponge.style.top = (e.clientY - ar.top) + 'px'; };
  area.addEventListener('pointermove', moveSponge); area.addEventListener('pointerdown', moveSponge);
  const iv = setInterval(() => {
    if (!alive || busy || !ctx) return;
    const p = 1 - countDirt() / initial;
    bar.style.width = Math.min(100, p / 0.92 * 100) + '%';
    if (p >= 0.92) {
      busy = true;
      ctx.clearRect(0, 0, cv.width, cv.height);
      sfx('sparkle');
      tgt.classList.remove('clean-flash'); void tgt.offsetWidth; tgt.classList.add('clean-flash');
      const r = tgt.getBoundingClientRect();
      for (let i = 0; i < 5; i++) setTimeout(() => floatAt('✨', r.left + rand(.2, .8) * r.width, r.top + rand(.2, .7) * r.height), i * 90);
      idx++;
      if (idx < stages.length) setTimeout(() => alive && setup(), 800);
      else setTimeout(() => { if (alive) { alive = false; clearInterval(iv); sponge.remove(); done(); } }, 900);
    }
  }, 200);
  setup();
  return { stop() { alive = false; clearInterval(iv); } };
}

/* ============================ SETTINGS / NAMING / DAILY ============================ */
function openNameModal(first) {
  openModal(first ? 'Welcome to Koalamochi! 🐨' : 'Rename your koala', body => {
    body.innerHTML = `<div class="center-box name-form"><div class="name-koala">${petSVGorImg('happy')}</div>
      <p>${first ? 'A tiny koala just moved in! What will you call them?' : 'Pick a new name:'}</p>
      <input id="name-in" maxlength="14" value="${esc(S.name)}"><br><button class="btn" id="name-ok">${first ? "Let's go! 💕" : 'Save'}</button></div>`;
    const inp = body.querySelector('#name-in');
    const ok = () => {
      S.name = inp.value.trim().slice(0, 14) || 'Mochi';
      S.named = true; save(); renderAll(true); closeModal(); sfx('level');
      say(`Hi! I'm ${S.name}! 💕`, 3000); hearts(4);
      if (first) setTimeout(checkDaily, 600);
    };
    body.querySelector('#name-ok').onclick = ok;
    inp.onkeydown = e => { if (e.key === 'Enter') ok(); };
    setTimeout(() => inp.focus(), 50);
  });
}
function openSettings() {
  openModal('Settings ⚙️', body => {
    const art = Object.keys(IMG).length;
    body.innerHTML = `
      <div class="set-row"><span>🐨 Name</span><span><input id="set-name" maxlength="14" value="${esc(S.name)}"> <button class="btn" id="set-save">Save</button></span></div>
      <div class="set-row"><span>🔊 Volume</span><span class="vol-box">${volumeRowsHTML()}</span></div>
      <div class="set-row"><span>📊 Stats</span><span class="tip">🪙 ${S.totals.coins} earned · 🎮 ${S.totals.games} games · 🧽 ${S.totals.chores} chores · 🔥 ${S.daily.streak}-day streak</span></div>
      <div class="set-row"><span>🎨 Art & music</span><span class="tip">${art} custom image${art === 1 ? '' : 's'} loaded · music ${trackOK.home ? 'found ✓' : 'not added yet'}</span></div>
      <div class="set-row"><span>🗑️ Start over</span><button class="btn soft" id="set-reset">Reset game</button></div>`;
    body.querySelector('#set-save').onclick = () => { S.name = body.querySelector('#set-name').value.trim().slice(0, 14) || S.name; save(); renderTop(); toast('Name saved! 💕'); };
    bindVolumeRows(body);
    let armed = false;
    body.querySelector('#set-reset').onclick = e => {
      if (!armed) { armed = true; e.target.textContent = 'Tap again to confirm'; return; }
      localStorage.removeItem(CONFIG.saveKey); location.reload();
    };
  });
}
const dayStr = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
function checkDaily() {
  const today = dayStr(new Date());
  if (S.daily.date === today) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  S.daily.streak = S.daily.date === dayStr(y) ? S.daily.streak + 1 : 1;
  S.daily.date = today;
  const c = 15 + 10 * Math.min(S.daily.streak, 7);
  S.coins += c; save(); renderTop();
  sfx('level');
  openModal('Daily Treat! 🎁', body => {
    body.innerHTML = `<div class="center-box"><div class="big-emo">🎁</div><p>Welcome back! You're on a <b>${S.daily.streak}-day</b> streak 🔥</p><p class="reward">🪙 +${c} coins</p><p class="tip">Come back tomorrow for an even bigger treat!</p><button class="btn" id="dly">Yay!</button></div>`;
    body.querySelector('#dly').onclick = () => { closeModal(); hearts(3); };
  });
}

/* ============================ EVENTS / LOOP ============================ */
function setupEvents() {
  document.addEventListener('pointerdown', () => { if (!userInteracted) { userInteracted = true; updateMusic(); } }, true);
  $('#pet').addEventListener('click', petThePet);
  $('#messes').addEventListener('click', e => { const b = e.target.closest('.mess'); if (b) cleanMess(b.dataset.id, e); });
  $('#shelf').addEventListener('click', e => { const b = e.target.closest('[data-gift]'); if (b) playWithGift(b.dataset.gift, e); });
  $('#actions').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    sfx('click');
    ({ feed: openFeed, play: openPlay, clean: openClean, sleep: toggleSleep, shop: () => openShop(), closet: openCloset })[b.dataset.act]();
  });
  $('#modal-close').onclick = closeModal;
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
  $('#modal-tabs').addEventListener('click', e => { const t = e.target.closest('[data-tab]'); if (t && modalState) { modalState.tab = t.dataset.tab; sfx('click'); drawModal(true); } });
  $('#game-quit').onclick = closeGameScreen;
  $('#btn-music').onclick = e => {
    e.stopPropagation();
    const pop = $('#vol-pop');
    if (pop.classList.toggle('hidden')) return;
    pop.innerHTML = volumeRowsHTML();
    bindVolumeRows(pop);
  };
  $('#vol-pop').addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', () => $('#vol-pop').classList.add('hidden'));
  $('#btn-settings').onclick = openSettings;
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
}

let chatterT = 8, saveT = 0;
function tick() {
  const now = Date.now(), dt = (now - S.last) / 1000;
  S.last = now;
  if (dt > 0) simulate(Math.min(dt, CONFIG.maxOfflineHours * 3600));
  if (S.sleeping && S.stats.energy >= 100) { S.sleeping = false; say("I'm fully rested! ☀️", 2500); setTrack('home'); }
  renderStats(); renderRoom(); renderPet(); renderActions();
  if (--chatterT <= 0) {
    chatterT = randi(14, 24);
    if (!modalState && $('#game').classList.contains('hidden')) { const l = needLine(); if (l) say(l); }
  }
  if (modalState && modalState.title.startsWith('Chores')) drawModal();
  if (++saveT >= 5) { saveT = 0; save(); }
}

async function boot() {
  load();
  await probeAll();
  probeTracks();
  // catch up on time away
  const away = (Date.now() - S.last) / 1000;
  if (away > 5) {
    simulate(Math.min(away, CONFIG.maxOfflineHours * 3600));
    for (const k in S.stats) if (S.stats[k] < 10) S.stats[k] = 10; // be gentle after long breaks
  }
  S.last = Date.now();
  renderAll(true);
  setupEvents();
  setInterval(tick, 1000);
  if (!S.named) openNameModal(true);
  else {
    if (away > 600) setTimeout(() => say(`I missed you! 💕`, 3000), 500);
    checkDaily();
  }
}
boot();
