const root = document.documentElement;

function setLang(lang) {
  root.dataset.lang = lang;
  root.lang = lang === 'en' ? 'en' : 'cs';
  try { localStorage.setItem('lang', lang); } catch {}
}
const urlLang = new URLSearchParams(location.search).get('lang');
let savedLang = null;
try { savedLang = localStorage.getItem('lang'); } catch {}
setLang(urlLang || savedLang || 'cs');
document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.set)));

const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function countUp(el) {
  const end = +el.dataset.count;
  if (reduced) return;
  const t0 = performance.now();
  const step = t => {
    const p = Math.min(1, (t - t0) / 1200);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  e.target.querySelectorAll('[data-count]').forEach(countUp);
  io.unobserve(e.target);
}), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* Hero compass */
const NS = 'http://www.w3.org/2000/svg';
const nd = { r: 0, s: 1, ring: 0 };
let rot = 0;
const rose = document.getElementById('rose');
const ring = document.getElementById('ring');
const priorsG = document.getElementById('priors');
const needle = document.getElementById('needle');
const beam = document.getElementById('beam');
const rad = d => (d * Math.PI) / 180;
const pt = (deg, r) => [r * Math.sin(rad(deg)), -r * Math.cos(rad(deg))];

function poly(parent, pts, fill, opacity = 1) {
  const p = document.createElementNS(NS, 'polygon');
  p.setAttribute('points', pts.map(q => q.join(',')).join(' '));
  p.setAttribute('fill', fill);
  p.setAttribute('opacity', opacity);
  parent.appendChild(p);
  return p;
}

const shards = [];
// Intercardinal arms sit behind the cardinal ones.
[45, 135, 225, 315].forEach(a => {
  const tip = pt(a, 150), l = pt(a - 45, 30), r = pt(a + 45, 30);
  shards.push(poly(rose, [[0, 0], l, tip], '#1E8079', 0.95));
  shards.push(poly(rose, [[0, 0], tip, r], '#0F5E5A', 0.95));
});
[0, 90, 180, 270].forEach(a => {
  const tip = pt(a, 238), mid = pt(a, 105), l = pt(a - 45, 40), r = pt(a + 45, 40);
  shards.push(poly(rose, [[0, 0], l, mid], '#3FA89D'));
  shards.push(poly(rose, [l, tip, mid], '#7DBFB6'));
  shards.push(poly(rose, [[0, 0], mid, r], '#13716B'));
  shards.push(poly(rose, [mid, tip, r], '#2B8F86'));
});
const SEG = 36;
for (let i = 0; i < SEG; i++) {
  const a0 = (360 / SEG) * i + 1.2, a1 = (360 / SEG) * (i + 1) - 1.2;
  const major = i % 9 === 0;
  const rIn = major ? 244 : 252, rOut = 262;
  shards.push(poly(ring, [pt(a0, rIn), pt(a0, rOut), pt(a1, rOut), pt(a1, rIn)], major ? '#7FE0C9' : i % 2 ? '#1B6E69' : '#2B8F86'));
}
shards.push(poly(rose, [0, 60, 120, 180, 240, 300].map(a => pt(a, 26)), '#0A3F3C'));

const ORBIT = 292;
const priors = [
  { a: 22, cs: 'CT 2/2026', en: 'CT 2/2026', s: 'ok' },
  { a: 78, cs: 'CT hrudníku 12/2025', en: 'Chest CT 12/2025', s: 'miss' },
  { a: 141, cs: 'MR 7/2025', en: 'MRI 7/2025', s: 'ok' },
  { a: 200, cs: 'PET/CT 2024', en: 'PET/CT 2024', s: 'dec' },
  { a: 262, cs: 'RTG 5/2026', en: 'X-ray 5/2026', s: 'ok' },
  { a: 318, cs: 'CT břicha 4/2025', en: 'Abdomen CT 4/2025', s: 'ok' },
];
const STYLE = {
  ok: { fill: '#7FE0C9', stroke: '#7FE0C9', dash: '0' },
  dec: { fill: '#9B87F5', stroke: '#9B87F5', dash: '0' },
  miss: { fill: 'rgba(255,122,107,0)', stroke: '#FF7A6B', dash: '5 4' },
};
priors.forEach(p => {
  const [x, y] = pt(p.a, ORBIT);
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('transform', `translate(${x} ${y})`);
  const halo = document.createElementNS(NS, 'circle');
  halo.setAttribute('r', 14);
  halo.setAttribute('fill', 'none');
  halo.setAttribute('stroke', '#FF7A6B');
  halo.setAttribute('stroke-width', 2);
  halo.setAttribute('opacity', 0);
  const dot = document.createElementNS(NS, 'circle');
  dot.setAttribute('r', 11);
  dot.setAttribute('stroke-width', 3);
  const check = document.createElementNS(NS, 'path');
  check.setAttribute('d', 'M-5 0 l3.5 3.5 6.5 -7');
  check.setAttribute('fill', 'none');
  check.setAttribute('stroke', '#072B29');
  check.setAttribute('stroke-width', 2.6);
  check.setAttribute('stroke-linecap', 'round');
  check.setAttribute('stroke-linejoin', 'round');
  check.setAttribute('opacity', 0);
  const label = document.createElementNS(NS, 'text');
  const right = x >= 0;
  label.setAttribute('x', right ? 22 : -22);
  label.setAttribute('y', 5);
  label.setAttribute('text-anchor', right ? 'start' : 'end');
  label.setAttribute('font-size', 15);
  label.setAttribute('font-weight', 600);
  label.setAttribute('font-family', 'Plus Jakarta Sans, sans-serif');
  label.setAttribute('fill', 'rgba(255,255,255,.78)');
  ['cs', 'en'].forEach(l => {
    const t = document.createElementNS(NS, 'tspan');
    t.dataset.l = l;
    t.textContent = p[l];
    label.appendChild(t);
  });
  g.append(halo, dot, check, label);
  priorsG.appendChild(g);
  Object.assign(p, { g, halo, dot, check, label });
  paint(p, p.s);
});

function paint(p, s) {
  const st = STYLE[s];
  p.dot.setAttribute('fill', st.fill);
  p.dot.setAttribute('stroke', st.stroke);
  p.dot.setAttribute('stroke-dasharray', st.dash);
  p.check.setAttribute('opacity', s === 'ok' ? 1 : 0);
  p.s = s;
}

const captions = [...document.querySelectorAll('#caption [data-step]')];
const caption = i => captions.forEach((c, j) => (c.hidden = i !== j));

if (typeof gsap === 'undefined' || reduced) {
  caption(2);
  priors.forEach(p => paint(p, p.s === 'miss' ? 'ok' : p.s));
  needle.setAttribute('transform', `rotate(${priors[1].a})`);
} else {
  document.fonts.ready.then(runCompass);
}

function runCompass() {
  gsap.ticker.add(() => {
    needle.setAttribute('transform', `rotate(${nd.r}) scale(${nd.s})`);
    ring.setAttribute('transform', `rotate(${nd.ring})`);
  });

  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .from(shards, {
      x: () => gsap.utils.random(-520, 520),
      y: () => gsap.utils.random(-420, 420),
      rotation: () => gsap.utils.random(-200, 200),
      scale: () => gsap.utils.random(0.2, 0.7),
      opacity: 0,
      transformOrigin: '50% 50%',
      duration: 1.6,
      stagger: { amount: 0.9, from: 'random' },
    })
    .from('#wordmark span:not(.c)', { y: 70, opacity: 0, duration: 0.9, stagger: 0.06 }, 0.2)
    .from('#wm-c', { width: 0, y: -120, rotation: -40, opacity: 0, duration: 1, ease: 'bounce.out', clearProps: 'width' }, 1.3)
    .from(nd, { s: 0, r: -270, duration: 1.2, ease: 'back.out(1.6)' }, 1.4)
    .from(priors.map(p => p.g), { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(2)', stagger: 0.08 }, 1.9)
    .add(() => search(priors[1]), 2.6);

  gsap.to(nd, { ring: 360, duration: 140, ease: 'none', repeat: -1 });

  const stage = document.getElementById('stage');
  const svg = document.getElementById('compass');
  const rx = gsap.quickTo(svg, 'rotationX', { duration: 0.8, ease: 'power3' });
  const ry = gsap.quickTo(svg, 'rotationY', { duration: 0.8, ease: 'power3' });
  stage.addEventListener('pointermove', e => {
    const b = stage.getBoundingClientRect();
    ry(((e.clientX - b.left) / b.width - 0.5) * 18);
    rx(-((e.clientY - b.top) / b.height - 0.5) * 18);
  });
  stage.addEventListener('pointerleave', () => { rx(0); ry(0); });
}

function search(target) {
  caption(0);
  const [x2, y2] = pt(target.a, ORBIT - 16);
  let end = target.a;
  while (end < rot + 300) end += 360;
  rot = end;
  const tl = gsap.timeline();
  tl.to(nd, { r: end - 40, duration: 1.5, ease: 'power2.inOut' })
      .to(nd, { r: end, duration: 1.1, ease: 'elastic.out(1.1, 0.35)' })
    .add(() => caption(1), '-=0.9')
    .set(beam, { attr: { x2, y2 }, strokeDasharray: ORBIT, strokeDashoffset: ORBIT, opacity: 1 }, '-=0.9')
    .to(beam, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' }, '-=0.9')
    .fromTo(target.halo, { attr: { r: 14 }, opacity: 0.9 }, { attr: { r: 46 }, opacity: 0, duration: 1, ease: 'power2.out', repeat: 2 }, '-=0.5')
    .to(target.g, { scale: 1.35, transformOrigin: '50% 50%', duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.inOut' }, '+=0.1')
    .add(() => { paint(target, 'ok'); caption(2); })
    .fromTo(target.check, { strokeDasharray: 20, strokeDashoffset: 20 }, { strokeDashoffset: 0, duration: 0.4 })
    .to(beam, { opacity: 0, duration: 0.6 }, '+=0.4')
    .add(() => {
      const decide = priors.find(p => p.s === 'dec');
      if (decide) gsap.delayedCall(0.2, () => paint(decide, 'ok'));
    })
    .add(() => nextSearch(target), '+=2.6');
}

function nextSearch(prev) {
  const pool = priors.filter(p => p !== prev);
  const next = pool[Math.floor(Math.random() * pool.length)];
  gsap.to(next.dot, { opacity: 0.2, duration: 0.25, yoyo: true, repeat: 1, onRepeat: () => paint(next, 'miss') });
  gsap.delayedCall(0.7, () => search(next));
}
