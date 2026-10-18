// One mesh travels from "Pro lékaře" to "Co dál", switching sides.
// Its own polygons, in a fixed layer. One paused timeline maps scroll px to time.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, a, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in a) e.setAttribute(k, a[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const pad = pts => { const o = pts.slice(0, 6); while (o.length < 6) o.push(o[o.length - 1]); return o; };
  const str = pts => pad(pts).map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const mid = pts => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
  const motion = typeof gsap !== 'undefined' && matchMedia('(min-width: 961px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SCENES = { timeline: MS.timeline, body: MS.body, hours: MS.hours, czmap: MS.czmap, roadmap: MS.roadmap };
  const scenes = [...document.querySelectorAll('.mz [data-scene]')].map(el => {
    const pal = MS.PAL[el.closest('.dark') ? 'dark' : 'light'];
    const s = SCENES[el.dataset.scene](pal);
    return { el, slot: el.querySelector('.slot'), polys: s.polys, deco: s.deco };
  });

  if (!motion) {
    document.documentElement.classList.add('mesh-static');
    scenes.forEach(s => {
      const svg = mk('svg', { viewBox: '-400 -400 800 800', class: 'mesh-pic', role: 'img', 'aria-hidden': 'true' });
      s.polys.forEach(q => mk('polygon', { points: str(q.p), fill: q.f, opacity: q.o }, svg));
      if (s.deco) s.deco(mk('g', {}, svg));
      s.slot.appendChild(svg);
    });
    return;
  }

  // Start and end states: the pieces drift in loose and leave the same way.
  const N = Math.max(...scenes.map(s => s.polys.length));
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const loose = [...Array(N)].map(() => {
    const x = rnd() * 760 - 380, y = rnd() * 760 - 380, r = 8 + rnd() * 14;
    return { p: [[x, y - r], [x + r, y + r], [x - r, y + r]], f: '#7FA8A2', o: 0 };
  });

  const layer = document.createElement('div');
  layer.className = 'mesh-layer';
  const stage = document.createElement('div');
  stage.className = 'mesh-stage';
  layer.appendChild(stage);
  document.body.appendChild(layer);
  const svg = mk('svg', { viewBox: '-400 -400 800 800', 'aria-hidden': 'true' }, stage);
  const polys = loose.map(q => { const p = mk('polygon', { points: str(q.p), fill: q.f }, svg); p.style.opacity = 0; return p; });
  scenes.forEach(s => {
    if (!s.deco) return;
    s.g = mk('g', { class: 'mesh-deco' }, svg);
    s.g.style.opacity = 0;
    s.deco(s.g);
  });

  const place = s => {
    const vh = innerHeight, r = s.slot.getBoundingClientRect();
    const w = Math.min(r.width, vh - 150);
    return { left: r.left + (r.width - w) / 2, top: vh / 2 + 34, width: w };
  };
  const startOf = el => Math.max(1, el.getBoundingClientRect().top + scrollY - innerHeight * 0.85);

  let tl;
  function build() {
    if (tl) tl.kill();
    tl = gsap.timeline({ paused: true });
    const vh = innerHeight, span = vh * 0.55;
    const P = scenes.map(place);
    const states = [{ polys: loose }, ...scenes, { polys: loose }];
    const starts = [...scenes.map(s => startOf(s.el)), startOf(document.getElementById('tym')) - vh * 0.1];
    gsap.set(stage, P[0]);
    for (let k = 1; k < states.length; k++) {
      const A = states[k - 1], B = states[k], start = starts[k - 1];
      const at = f => start + span * f;
      if (k > 1 && k < states.length - 1) tl.fromTo(stage, P[k - 2], { ...P[k - 1], duration: span * 0.6, ease: 'power2.inOut', immediateRender: false }, at(0.02));
      polys.forEach((el, i) => {
        const a = A.polys[i], b = B.polys[i];
        if (!a && !b) return;
        const fa = a || { p: [mid(b.p)], f: b.f, o: 0 }, fb = b || { p: [mid(a.p)], f: a.f, o: 0 };
        tl.fromTo(el, { attr: { points: str(fa.p) }, fill: fa.f, opacity: fa.o },
          { attr: { points: str(fb.p) }, fill: fb.f, opacity: fb.o, duration: span * 0.5, ease: 'power3.inOut', immediateRender: false }, at(0.04 + (i % 12) * 0.012));
      });
      if (A.g) tl.fromTo(A.g, { opacity: 1 }, { opacity: 0, duration: span * 0.12, immediateRender: false }, at(0.02));
      if (B.g) tl.fromTo(B.g, { opacity: 0 }, { opacity: 1, duration: span * 0.2, immediateRender: false }, at(0.62));
    }
    tl.time(Math.min(scrollY, tl.duration()));
  }

  const onScroll = () => tl && tl.time(Math.min(scrollY, tl.duration()));
  document.fonts.ready.then(() => {
    build();
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    let t;
    const rebuild = () => { clearTimeout(t); t = setTimeout(() => { build(); onScroll(); }, 150); };
    addEventListener('resize', rebuild);
    addEventListener('load', rebuild);
  });
})();
