// Scroll-story engine for the opening. Uses globals from main.js.
gsap.registerPlugin(ScrollTrigger);

const SVGNS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs, parent) => {
  const el = document.createElementNS(SVGNS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
};
const FONT = 'Plus Jakarta Sans, sans-serif';
const compassSvg = document.getElementById('compass');
const steps = [...document.querySelectorAll('.story .step')];
const desktopStory = matchMedia('(min-width: 961px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;

// Waffle: 24 of 40 cases miss a scan.
const waffle = document.querySelector('.waffle');
if (waffle) {
  const miss = new Set([0, 2, 3, 5, 7, 8, 11, 12, 14, 16, 17, 19, 21, 22, 24, 26, 27, 30, 31, 33, 35, 36, 38, 39]);
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('i');
    c.className = miss.has(i) ? 'miss' : 'ok';
    c.style.transitionDelay = `${i * 18}ms`;
    waffle.appendChild(c);
  }
}

// Scan cards inside the compass svg. lane: nis | rep | ins.
const cardData = [
  { m: 'CT', d: '4/2025', src: 'FN Motol', lane: 'nis', rel: true, region: 'chest' },
  { m: 'MR', d: '7/2025', src: 'FN Motol', lane: 'nis', rel: true, region: 'pelvis' },
  { m: 'PET/CT', d: '9/2025', src: 'Homolka', lane: 'rep', rel: true, miss: true, region: 'chest' },
  { m: 'CT', d: '12/2025', src: 'Thomayer', lane: 'rep', rel: true, miss: true, primary: true, region: 'abdomen' },
  { m: 'CT', d: '2/2026', src: 'FN Motol', lane: 'nis', rel: true, region: 'chest' },
  { m: 'MR', d: '3/2026', src: 'Bulovka', lane: 'rep', rel: true, miss: true, region: 'pelvis' },
  { m: 'RTG', d: '5/2026', src: 'FN Motol', lane: 'nis', rel: true, region: 'chest' },
  { m: 'CT', d: '8/2026', src: tr('story.lane_insurer'), lane: 'ins', rel: true, miss: true, region: 'pelvis' },
  { m: 'USG', d: '2019', src: tr('story.report'), lane: 'rep' },
  { m: 'RTG', d: '2017', src: 'NIS', lane: 'nis' },
  { m: 'CT', d: '2014', src: 'NIS', lane: 'nis' },
  { m: 'USG', d: '2016', src: tr('story.lane_insurer'), lane: 'ins' },
];
const scatter = [[-300, -300, -9], [-40, -340, 6], [260, -290, -6], [330, 40, 8], [-330, 60, 7], [120, 320, -5], [-160, 300, 4], [-250, -120, 11], [190, -150, -10], [300, 230, 6], [-330, 230, -8], [40, 150, 9]];

const cardsG = svgEl('g', {}, compassSvg);
compassSvg.insertBefore(cardsG, document.getElementById('needle'));
const T = (x, y, r = 0, s = 1) => `translate(${x} ${y}) rotate(${r}) scale(${s})`;

const cards = cardData.map((c, i) => {
  const [x, y, r] = scatter[i];
  const outer = svgEl('g', { transform: T(0, 0, 0, 0.2), opacity: 0 }, cardsG);
  const g = svgEl('g', {}, outer);
  const color = c.miss ? '#FF7A6B' : '#7FE0C9';
  const rect = svgEl('rect', { x: -60, y: -30, width: 120, height: 62, rx: 10, fill: 'rgba(7,43,41,0.85)', stroke: color, 'stroke-opacity': 0.8, 'stroke-width': 1.6, 'stroke-dasharray': c.miss ? '6 4' : '0' }, g);
  const found = svgEl('circle', { r: 11, fill: '#7FE0C9', opacity: 0 }, g);
  const t1 = svgEl('text', { x: 0, y: -8, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: color, 'font-family': FONT }, g);
  t1.textContent = c.m;
  const t2 = svgEl('text', { x: 0, y: 11, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff', 'fill-opacity': 0.8, 'font-family': FONT }, g);
  t2.textContent = c.d;
  const t3 = svgEl('text', { x: 0, y: 25, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: '#fff', 'fill-opacity': 0.55, 'font-family': FONT }, g);
  t3.textContent = c.src;
  const drift = gsap.to(g, { y: gsap.utils.random(-10, 10), rotation: gsap.utils.random(-3, 3), duration: gsap.utils.random(3.5, 6), yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 50%', paused: true });
  return { ...c, x, y, r, outer, g, rect, found, t1, t2, t3, drift };
});
const relCards = cards.filter(c => c.rel);
const irrelCards = cards.filter(c => !c.rel);
const missCard = cards.find(c => c.primary);
const missCards = cards.filter(c => c.miss);
const setCardDrift = on => cards.forEach(c => (on ? c.drift.play() : c.drift.pause()));

function showCards(tl, at) {
  cards.forEach((c, i) => tl.to(c.outer, { attr: { transform: T(c.x, c.y, c.r, 1.15) }, opacity: 1, duration: 0.5, ease: 'power3.out' }, at + i * 0.02));
}

// AI verdict card, shared by A and B.
function makeVerdict(x, y) {
  const g = svgEl('g', { transform: T(x, y, 0, 1.0), opacity: 0 }, compassSvg);
  svgEl('rect', { x: 0, y: 0, width: 360, height: 168, rx: 14, fill: '#FFFFFF' }, g);
  svgEl('rect', { x: 18, y: 18, width: 104, height: 26, rx: 13, fill: '#DDF2EC' }, g);
  const tag = svgEl('text', { x: 70, y: 36, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#155B4F', 'font-family': FONT }, g);
  tag.textContent = tr('story.relevant');
  const title = svgEl('text', { x: 18, y: 72, 'font-size': 16, 'font-weight': 800, fill: '#14232A', 'font-family': FONT }, g);
  title.textContent = tr('story.verdict_title');
  const why = svgEl('text', { x: 18, y: 98, 'font-size': 13, fill: '#2C3D44', 'font-family': FONT }, g);
  why.textContent = tr('story.verdict_why');
  const cite = svgEl('text', { x: 18, y: 124, 'font-size': 13, 'font-weight': 700, fill: '#0F6B66', 'text-decoration': 'underline', 'font-family': FONT }, g);
  cite.textContent = tr('story.verdict_cite');
  const req = svgEl('text', { x: 18, y: 150, 'font-size': 12.5, fill: '#5C6E74', 'font-family': FONT }, g);
  req.textContent = tr('story.verdict_request');
  return g;
}

function stepTimeline(stepIndex, build, opts = {}) {
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  build(tl);
  ScrollTrigger.create({
    trigger: steps[stepIndex],
    start: opts.start || 'top 85%',
    end: opts.end || 'top 25%',
    scrub: true,
    animation: tl,
    onUpdate: opts.onUpdate,
  });
  return tl;
}

// Pause the compass search loop once the story leaves the hero.
function holdCompassOnStory() {
  ScrollTrigger.create({
    trigger: steps[1], start: 'top 85%',
    onEnter: () => { holdSearch = true; setCardDrift(true); compassSvg.classList.add('story-on'); },
    onLeaveBack: () => { holdSearch = false; setCardDrift(false); compassSvg.classList.remove('story-on'); },
  });
}

// Optional exit: the found scan opens into the light page below.
function addDive(getPoint) {
  const dive = document.querySelector('.dive');
  const story = document.querySelector('.story');
  const tl = gsap.timeline();
  tl.fromTo(dive, { clipPath: () => `circle(0px at ${getPoint()})` }, { clipPath: () => `circle(150vmax at ${getPoint()})`, ease: 'power2.in' });
  ScrollTrigger.create({ trigger: story, start: 'bottom bottom', end: 'bottom 35%', scrub: true, animation: tl, invalidateOnRefresh: true });
}
