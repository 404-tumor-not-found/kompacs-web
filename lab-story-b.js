// Story B: compass rebuilds into a patient body, scans land on body regions, the missing one fills the red flag.
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


const triShards = shards.slice(0, 24), quadShards = shards.slice(24, 60), hub = shards[60];
const regionOf = i => (i < 12 ? (Math.floor(i / 3) < 2 ? 'chest' : Math.floor(i / 3) === 2 ? 'abdomen' : 'pelvis') : 'body');
const REG = { chest: [0, -120], abdomen: [0, -25], pelvis: [0, 40] };

const lbl = (y, cs, en, color) => {
  const t = svgEl('text', { x: 172, y, 'font-size': 18, 'font-weight': 800, fill: color, opacity: 0, 'font-family': FONT }, compassSvg);
  t.innerHTML = bi(cs, en);
  return t;
};
const lines = [-126, -24, 46].map(y => svgEl('line', { x1: 80, y1: y - 6, x2: 162, y2: y - 6, stroke: '#FFFFFF', 'stroke-opacity': 0.4, 'stroke-width': 1.5, 'stroke-dasharray': '3 4', opacity: 0 }, compassSvg));
const lChest = lbl(-120, 'Hrudník · 4× CT/RTG ✓', 'Chest · 4 scans ✓', '#7FE0C9');
const lAbdMiss = lbl(-18, 'Břicho · chybí srovnání', 'Abdomen · no comparison', '#FF7A6B');
const lAbdOk = lbl(-18, 'Břicho · CT 12/2025 ✓', 'Abdomen · CT 12/2025 ✓', '#7FE0C9');
const lPelvis = lbl(52, 'Pánev · MR, CT ✓', 'Pelvis · MRI, CT ✓', '#7FE0C9');
const flag = svgEl('rect', { x: -80, y: -66, width: 160, height: 82, rx: 10, fill: 'none', stroke: '#FF7A6B', 'stroke-width': 3, 'stroke-dasharray': '8 6', opacity: 0, class: 'pulse' }, compassSvg);
const verdict = makeVerdict(-400, 120);

const edge = [[-310, -300], [-310, -170], [-310, 220], [-310, -40], [310, -300], [310, -170], [310, 330], [-310, 90], [310, 220], [-310, 340], [310, 90], [310, -40]];
cards.forEach((c, i) => { [c.x, c.y] = edge[i]; c.r = gsap.utils.random(-6, 6); });

document.fonts.ready.then(() => {
  if (!desktopStory) return;
  ringSpin.kill();
  nd.ring = 0;
  holdCompassOnStory();

  // 1 Problem: compass becomes the patient, abdomen flagged.
  stepTimeline(1, tl => {
    triShards.forEach((el, i) => {
      const chest = [14, 15, 22, 23].includes(i);
      tl.to(el, { attr: { points: P(tris[i]) }, opacity: chest ? 0 : 0.95, fill: i < 6 ? (i % 2 ? '#3FA89D' : '#2B8F86') : '#2B8F86', duration: 0.6 }, (i % 6) * 0.015);
    });
    quadShards.forEach((el, i) => {
      const r = regionOf(i);
      tl.to(el, { attr: { points: P(quads[i]) }, opacity: r === 'abdomen' ? 0.5 : 0.9, fill: r === 'abdomen' ? '#FF7A6B' : i % 2 ? '#1E7A73' : '#2B8F86', duration: 0.6 }, (i % 9) * 0.015);
    });
    tl.to(hub, { attr: { points: P(hex) }, fill: '#13716B', duration: 0.6 }, 0)
      .to(flag, { opacity: 1, duration: 0.15 }, 0.7)
      .to([lines[1], lAbdMiss], { opacity: 1, duration: 0.15 }, 0.75);
  });

  // 2 Solution: scans arrive from all sources and land on their body region.
  stepTimeline(2, tl => {
    cards.forEach((c, i) => tl.to(c.outer, { attr: { transform: T(c.x, c.y, c.r, 1.1) }, opacity: 1, duration: 0.25, ease: 'power3.out' }, i * 0.015));
    irrelCards.forEach(c => tl.to(c.outer, { opacity: 0, attr: { transform: T(c.x, c.y, 0, 0.4) }, duration: 0.12 }, 0.5));
    relCards.filter(c => !c.miss).forEach((c, i) => {
      const [rx, ry] = REG[c.region];
      tl.to(c.outer, { attr: { transform: T(rx, ry, 0, 0.15) }, duration: 0.3, ease: 'power2.in' }, 0.5 + i * 0.03)
        .to(c.outer, { opacity: 0, duration: 0.05 }, 0.75 + i * 0.03);
    });
    quadShards.forEach((el, i) => {
      const r = regionOf(i);
      if (r === 'chest' || r === 'pelvis') tl.to(el, { fill: '#7FE0C9', duration: 0.1 }, r === 'chest' ? 0.82 : 0.88);
    });
    tl.to([lines[0], lChest], { opacity: 1, duration: 0.1 }, 0.85)
      .to([lines[2], lPelvis], { opacity: 1, duration: 0.1 }, 0.9);
  }, { end: 'top -40%' });

  // 3 AI: the missing CT is found in a report and fills the abdomen.
  stepTimeline(3, tl => {
    tl.to(missCard.outer, { attr: { transform: T(REG.abdomen[0], REG.abdomen[1], 0, 0.15) }, duration: 0.35, ease: 'power2.in' }, 0)
      .to(missCard.outer, { opacity: 0, duration: 0.05 }, 0.33);
    quadShards.forEach((el, i) => { if (regionOf(i) === 'abdomen') tl.to(el, { fill: '#7FE0C9', opacity: 0.9, duration: 0.1 }, 0.36); });
    tl.to(flag, { opacity: 0, duration: 0.1 }, 0.36)
      .to(lAbdMiss, { opacity: 0, duration: 0.1 }, 0.36)
      .to(lAbdOk, { opacity: 1, duration: 0.1 }, 0.42)
      .to(verdict, { opacity: 1, attr: { transform: T(-400, 120, 0, 0.78) }, duration: 0.3, ease: 'back.out(1.6)' }, 0.5);
  });
});
