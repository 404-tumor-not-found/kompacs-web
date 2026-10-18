// Generic shard set: N polygons that morph between target shapes. Used by lab B_2, D, E.
const SH_NS = 'http://www.w3.org/2000/svg';
const shEl = (tag, attrs, parent) => {
  const el = document.createElementNS(SH_NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
};
const shPts = pts => pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const shRect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const shTri = (a, b, c) => [a, b, c, c];
const shDot = (x, y) => shRect(x, y, 0.01, 0.01);
const shBi = (cs, en) => `<tspan data-l="cs">${cs}</tspan><tspan data-l="en">${en}</tspan>`;
const shFont = 'Plus Jakarta Sans, sans-serif';
const shMotion = () => matchMedia('(min-width: 961px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;

function makeShards(svg, n, cx, cy) {
  const g = shEl('g', {}, svg);
  const polys = [];
  for (let i = 0; i < n; i++) {
    const x = cx + gsap.utils.random(-260, 260), y = cy + gsap.utils.random(-260, 260), s = gsap.utils.random(8, 22);
    const p = shEl('polygon', { points: shPts(shTri([x, y - s], [x + s, y + s], [x - s, y + s])), fill: '#7FE0C9' }, g);
    p.style.opacity = 0;
    polys.push(p);
  }
  return { g, polys };
}

// Morph every polygon to shapes[i] (4 points). Missing shapes collapse and fade.
function morphTo(tl, polys, shapes, at, { fill, opacity = 1, dur = 0.5, stagger = 0.006, collapse } = {}) {
  polys.forEach((p, i) => {
    const s = shapes[i];
    const target = s ? s : shDot(...(collapse || [300, 300]));
    tl.to(p, {
      attr: { points: shPts(target) },
      opacity: s ? (typeof opacity === 'function' ? opacity(i) : opacity) : 0,
      fill: fill ? fill(i) : undefined,
      duration: dur, ease: 'power3.inOut',
    }, at + i * stagger);
  });
}

function shText(svg, x, y, cs, en, attrs = {}) {
  const t = shEl('text', { x, y, 'font-family': shFont, 'font-weight': 800, 'font-size': 16, fill: '#14232A', ...attrs }, svg);
  t.innerHTML = shBi(cs, en);
  t.style.opacity = 0;
  return t;
}

function scrubSteps(stepsEls, builders, opts = {}) {
  builders.forEach((build, i) => {
    if (!build) return;
    const tl = gsap.timeline();
    build(tl);
    ScrollTrigger.create({ trigger: stepsEls[i], start: opts.start || 'top 80%', end: opts.end || 'top 30%', scrub: true, animation: tl });
  });
}

// Static waffle in the data section (24 of 40 cases miss a scan).
(() => {
  const w = document.querySelector('.waffle');
  if (!w || w.children.length) return;
  const miss = new Set([0, 2, 3, 5, 7, 8, 11, 12, 14, 16, 17, 19, 21, 22, 24, 26, 27, 30, 31, 33, 35, 36, 38, 39]);
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('i');
    c.className = miss.has(i) ? 'miss' : 'ok';
    c.style.transitionDelay = `${i * 18}ms`;
    w.appendChild(c);
  }
})();
