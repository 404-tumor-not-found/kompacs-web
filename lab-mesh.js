// Mesh engine: the 61 compass shards travel through the page. Each [data-scene] block gets one shape.
// One paused timeline maps scroll px to time, so nav jumps and resizes always land on the same picture.
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
  const parse = s => s.trim().split(/\s+/).map(q => q.split(',').map(Number));
  const mid = pts => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
  const motion = typeof gsap !== 'undefined' && matchMedia('(min-width: 961px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;

  const compass = shards.map(s => ({ p: parse(s.getAttribute('points')), f: s.getAttribute('fill'), o: +s.getAttribute('opacity') }));
  const scenes = [...document.querySelectorAll('[data-scene]')].map(el => {
    const pal = MS.PAL[el.closest('.dark, .hero') ? 'dark' : 'light'];
    const s = window.MESH_SCENES[el.dataset.scene](pal) || {};
    return { el, slot: el.querySelector('.slot'), place: el.dataset.place || 'slot', polys: s.polys || compass, deco: s.deco };
  });

  if (!motion) {
    document.documentElement.classList.add('mesh-static');
    scenes.forEach(s => {
      if (!s.slot) return;
      const svg = mk('svg', { viewBox: '-400 -400 800 800', class: 'mesh-pic', role: 'img', 'aria-hidden': 'true' });
      s.polys.forEach(q => mk('polygon', { points: str(q.p), fill: q.f, opacity: q.o }, svg));
      if (s.deco) s.deco(mk('g', {}, svg));
      s.slot.appendChild(svg);
    });
    return;
  }

  const stage = document.getElementById('stage');
  const heroSlot = stage.parentElement;
  const layer = document.createElement('div');
  layer.className = 'mesh-layer';
  document.body.appendChild(layer);
  layer.appendChild(stage);
  heroSlot.classList.add('slot-empty');
  const svg = document.getElementById('compass');

  const all = [{ el: document.querySelector('.hero'), slot: heroSlot, place: 'hero', polys: compass }, ...scenes];
  all.forEach(s => {
    if (!s.deco || s.place === 'bg') return;
    s.g = mk('g', { class: 'mesh-deco' }, svg);
    s.g.style.opacity = 0;
    s.deco(s.g);
  });

  const place = s => {
    const vw = innerWidth, vh = innerHeight;
    if (s.place === 'bg') { const w = Math.min(vw * 0.9, vh * 1.1); return { left: (vw - w) / 2, top: vh / 2 + 34, width: w, opacity: +(s.el.dataset.op || 0.18) }; }
    if (s.place === 'rest') { const w = 130; return { left: vw - w - 26, top: vh - w / 2 - 26, width: w, opacity: 0.6 }; }
    const r = s.slot.getBoundingClientRect();
    const w = Math.min(r.width, vh - 150);
    const top = s.place === 'hero' ? r.top + scrollY + r.height / 2 : vh / 2 + 34;
    return { left: r.left + (r.width - w) / 2, top, width: w, opacity: 1 };
  };

  let tl, firstStart = 0;
  function build() {
    if (tl) tl.kill();
    tl = gsap.timeline({ paused: true });
    const vh = innerHeight, span = vh * 0.55;
    const P = all.map(place);
    gsap.set(stage, P[0]);
    for (let k = 1; k < all.length; k++) {
      const A = all[k - 1], B = all[k];
      const start = Math.max(1, B.el.getBoundingClientRect().top + scrollY - vh * 0.85);
      if (k === 1) firstStart = start;
      const at = f => start + span * f;
      tl.fromTo(stage, P[k - 1], { ...P[k], duration: span * 0.6, ease: 'power2.inOut', immediateRender: false }, at(0.02));
      shards.forEach((el, i) => {
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

  const onScroll = () => {
    tl.time(Math.min(scrollY, tl.duration()));
    const on = scrollY > firstStart;
    svg.classList.toggle('story-on', on);
    holdSearch = on;
  };

  document.fonts.ready.then(() => {
    ringSpin && ringSpin.kill();
    nd.ring = 0;
    shards.forEach((s, i) => s.setAttribute('points', str(compass[i].p)));
    build();
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    let t;
    const rebuild = () => { clearTimeout(t); t = setTimeout(() => { build(); onScroll(); }, 150); };
    addEventListener('resize', rebuild);
    addEventListener('load', rebuild);
  });
})();
