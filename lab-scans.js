// Faded scan cards in the hero background. Shared by the lab variants.
const LAB_W = 1440, LAB_H = 900;
const hero = document.querySelector('.hero');

function labLayer(cls) {
  const div = document.createElement('div');
  div.className = 'fx ' + cls;
  div.innerHTML = `<svg viewBox="0 0 ${LAB_W} ${LAB_H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"></svg>`;
  hero.appendChild(div);
  return div;
}
const fxBack = labLayer('fx-back');
const fxTop = labLayer('fx-top');
const backSvg = fxBack.querySelector('svg');
const topSvg = fxTop.querySelector('svg');
const backG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
backSvg.appendChild(backG);

const svgEl = (tag, attrs, parent) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
};

// rel: on the timeline, in date order. Others are irrelevant and fade out.
const scanData = [
  { m: 'CT', d: '4/2025', src: 'FN Motol', rel: true, x: 120, y: 160, r: -8 },
  { m: 'MR', d: '7/2025', src: 'FN Motol', rel: true, x: 610, y: 90, r: 6 },
  { m: 'PET/CT', d: '9/2025', src: 'Homolka', rel: true, x: 1300, y: 140, r: -5 },
  { m: 'CT', d: '12/2025', src: 'Thomayer', rel: true, miss: true, x: 1340, y: 520, r: 9 },
  { m: 'CT', d: '2/2026', src: 'FN Motol', rel: true, x: 90, y: 600, r: 7 },
  { m: 'RTG', d: '5/2026', src: 'FN Motol', rel: true, x: 760, y: 840, r: -6 },
  { m: 'CT', d: '8/2026', src: 'VZP', rel: true, x: 400, y: 820, r: 4 },
  { m: 'USG', d: '2019', src: 'zpráva', x: 330, y: 300, r: 12 },
  { m: 'RTG', d: '2017', src: 'NIS', x: 980, y: 60, r: -10 },
  { m: 'MR', d: '2015', src: 'zpráva', x: 1180, y: 330, r: 5 },
  { m: 'CT', d: '2014', src: 'NIS', x: 1100, y: 780, r: -7 },
  { m: 'USG', d: '2016', src: 'VZP', x: 200, y: 420, r: -11 },
];

const scans = scanData.map(s => {
  const outer = svgEl('g', { transform: `translate(${s.x} ${s.y}) rotate(${s.r})` }, backG);
  const g = svgEl('g', {}, outer);
  const color = s.miss ? '#FF7A6B' : '#7FE0C9';
  const rect = svgEl('rect', {
    x: -66, y: -25, width: 132, height: 50, rx: 10,
    fill: 'rgba(255,255,255,0.04)', stroke: color, 'stroke-opacity': 0.55, 'stroke-width': 1.5,
    'stroke-dasharray': s.miss ? '6 4' : '0',
  }, g);
  const found = svgEl('circle', { r: 11, fill: '#7FE0C9', opacity: 0 }, g);
  const t1 = svgEl('text', { x: 0, y: -2, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: color, 'fill-opacity': 0.75, 'font-family': 'Plus Jakarta Sans, sans-serif' }, g);
  t1.textContent = s.m;
  const t2 = svgEl('text', { x: 0, y: 16, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 600, fill: '#fff', 'fill-opacity': 0.5, 'font-family': 'Plus Jakarta Sans, sans-serif' }, g);
  t2.textContent = `${s.d} · ${s.src}`;
  const drift = gsap.to(g, { y: gsap.utils.random(-14, 14), rotation: gsap.utils.random(-4, 4), duration: gsap.utils.random(4, 7), yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 50%' });
  return { ...s, outer, g, rect, found, t1, t2, drift };
});

gsap.from(scans.map(s => s.outer), { opacity: 0, duration: 1.4, stagger: 0.06, delay: 0.6 });

const labHeroTrigger = (tl, extra = {}) => ScrollTrigger.create({
  trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6, animation: tl, ...extra,
});

const setDrift = on => scans.forEach(s => (on ? s.drift.resume() : s.drift.pause()));
