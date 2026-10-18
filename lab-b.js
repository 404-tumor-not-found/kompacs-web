// Variant B: compass shards rebuild into a low-poly patient body. Scans fly into it.
gsap.registerPlugin(ScrollTrigger);

const P = pts => pts.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
const lerp = (a, b, t) => a + (b - a) * t;

// Torso: 3 cols x 4 rows (chest, chest, abdomen, pelvis).
const ROWS = [-180, -120, -60, 10, 70];
const halfW = y => (y <= -60 ? lerp(92, 72, (y + 180) / 120) : y <= 10 ? lerp(72, 64, (y + 60) / 70) : lerp(64, 74, (y - 10) / 60));
const torsoX = (c, y) => -halfW(y) + (c * 2 * halfW(y)) / 3;
const quads = [];
const region = [];
for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
  const y0 = ROWS[r], y1 = ROWS[r + 1];
  quads.push([[torsoX(c, y0), y0], [torsoX(c + 1, y0), y0], [torsoX(c + 1, y1), y1], [torsoX(c, y1), y1]]);
  region.push(r < 2 ? 'ok' : r === 2 ? 'miss' : 'ok');
}
for (const s of [-1, 1]) for (let r = 0; r < 4; r++) {
  const t0 = r / 4, t1 = (r + 1) / 4, y0 = lerp(-176, 58, t0), y1 = lerp(-176, 58, t1);
  quads.push([[s * lerp(98, 112, t0), y0], [s * lerp(130, 144, t0), y0], [s * lerp(130, 144, t1), y1], [s * lerp(98, 112, t1), y1]]);
  region.push('body');
}
for (const s of [-1, 1]) for (let c = 0; c < 2; c++) for (let r = 0; r < 4; r++) {
  const t0 = r / 4, t1 = (r + 1) / 4, y0 = lerp(70, 284, t0), y1 = lerp(70, 284, t1);
  const xin = t => lerp(6, 14, t), xout = t => lerp(70, 50, t), xm = t => lerp(xin(t), xout(t), 0.5);
  const a = c === 0 ? xin : xm, b = c === 0 ? xm : xout;
  quads.push([[s * a(t0), y0], [s * b(t0), y0], [s * b(t1), y1], [s * a(t1), y1]]);
  region.push('body');
}

const HEAD = [0, -240], HR = 40;
const hex = [0, 60, 120, 180, 240, 300].map(a => [HEAD[0] + HR * Math.sin((a * Math.PI) / 180), HEAD[1] - HR * Math.cos((a * Math.PI) / 180)]);
const tris = [];
for (let i = 0; i < 6; i++) tris.push([HEAD, hex[i], hex[(i + 1) % 6]]);
tris.push([[-14, -200], [14, -200], [14, -180]], [[-14, -200], [14, -180], [-14, -180]]);
for (const s of [-1, 1]) {
  tris.push([[s * 50, -180], [s * 98, -176], [s * 82, -196]], [[s * 50, -180], [s * 82, -196], [s * 26, -190]]);
  tris.push([[s * 112, 58], [s * 144, 58], [s * 132, 92]], [[s * 112, 58], [s * 132, 92], [s * 114, 84]]);
  tris.push([[s * 14, 284], [s * 50, 284], [s * 60, 300]], [[s * 14, 284], [s * 60, 300], [s * 8, 300]]);
  tris.push([[s * 8, -172], [s * 62, -172], [s * 34, -132]], [[s * 8, -112], [s * 54, -112], [s * 30, -78]]);
}

const triShards = shards.slice(0, 24);
const quadShards = shards.slice(24, 60);
const hub = shards[60];

const labels = [
  { y: -126, cs: 'Hrudník · CT ✓', en: 'Chest · CT ✓', c: '#7FE0C9' },
  { y: -18, cs: 'Břicho · CT chybí', en: 'Abdomen · CT missing', c: '#FF7A6B' },
  { y: 46, cs: 'Pánev · MR ✓', en: 'Pelvis · MRI ✓', c: '#7FE0C9' },
].map(l => {
  const t = svgEl('text', { x: 168, y: l.y, 'font-size': 17, 'font-weight': 800, fill: l.c, opacity: 0, 'font-family': 'Plus Jakarta Sans, sans-serif' }, rose);
  t.innerHTML = `<tspan data-l="cs">${l.cs}</tspan><tspan data-l="en">${l.en}</tspan>`;
  const line = svgEl('line', { x1: 74, y1: l.y - 6, x2: 158, y2: l.y - 6, stroke: l.c, 'stroke-width': 1.5, 'stroke-dasharray': '3 4', opacity: 0 }, rose);
  return [t, line];
}).flat();

const flag = svgEl('rect', { x: -78, y: -64, width: 156, height: 78, rx: 10, fill: 'none', stroke: '#FF7A6B', 'stroke-width': 3, 'stroke-dasharray': '8 6', opacity: 0, class: 'pulse' }, rose);

const stage = document.getElementById('stage');
const desktop = matchMedia('(min-width: 761px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;

document.fonts.ready.then(() => {
  if (!desktop) return;
  ringSpin.kill();
  nd.ring = 0;

  const b = stage.getBoundingClientRect(), h = hero.getBoundingClientRect();
  const k = Math.max(h.width / LAB_W, h.height / LAB_H);
  const cx = (b.left + b.width / 2 - (h.width - LAB_W * k) / 2) / k;
  const cy = (b.top + b.height / 2 - h.top - (h.height - LAB_H * k) / 2) / k;

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  tl.to(stage, { y: () => hero.offsetHeight * 0.45, ease: 'none', duration: 1.5 }, 0)
    .to([needle, priorsG, beam, '#caption'], { opacity: 0, duration: 0.1 }, 0)
    .to(scans.map(s => s.outer), { attr: { transform: `translate(${cx} ${cy}) rotate(0)` }, opacity: 0, duration: 0.3, stagger: 0.01, ease: 'power2.in' }, 0);

  triShards.forEach((el, i) => {
    const chest = [14, 15, 22, 23].includes(i);
    tl.to(el, { attr: { points: P(tris[i]), opacity: chest ? 0 : 0.95 }, fill: chest ? '#7FE0C9' : i < 6 ? (i % 2 ? '#3FA89D' : '#2B8F86') : '#2B8F86', duration: 0.35 }, 0.05 + (i % 6) * 0.01);
  });
  quadShards.forEach((el, i) => {
    const fill = region[i] === 'ok' ? '#7FE0C9' : region[i] === 'miss' ? '#FF7A6B' : i % 2 ? '#1E7A73' : '#2B8F86';
    tl.to(el, { attr: { points: P(quads[i]) }, duration: 0.35 }, 0.05 + (i % 9) * 0.01)
      .to(el, { fill, attr: { opacity: region[i] === 'body' ? 0.9 : region[i] === 'miss' ? 0.55 : 0.85 }, duration: 0.1 }, 0.38);
  });
  tl.to(hub, { attr: { points: P(hex) }, fill: '#13716B', duration: 0.35 }, 0.05)
    .to(labels, { opacity: 1, duration: 0.08, stagger: 0.02 }, 0.42)
    .to(flag, { opacity: 1, duration: 0.08 }, 0.45)
    .to({}, { duration: 0.0001 }, 1.5);

  labHeroTrigger(tl, {
    onUpdate: self => {
      const active = self.progress > 0.01;
      setDrift(!active);
      holdSearch = active;
    },
  });
});
