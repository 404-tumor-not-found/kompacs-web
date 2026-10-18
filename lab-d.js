// D: one patient's journey. A timeline band stays on top; each section moves the "now" marker. Points assemble from triangles.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const PTS = [
    { d: '4/2025', cs: 'CT · FN Motol', en: 'CT · FN Motol', s: 'ok' },
    { d: '12/2025', cs: 'CT · Thomayer', en: 'CT · Thomayer', s: 'miss' },
    { d: '2/2026', cs: 'zpráva zmiňuje CT', en: 'report names the CT', s: 'rep' },
    { d: '23. 10.', cs: 'objednávka CT plic', en: 'lung CT ordered', s: 'trig' },
    { d: '+1 s', cs: 'kontrola KOMPACS', en: 'KOMPACS check', s: 'k' },
    { d: '1 klik', cs: 'e-mail žádost', en: 'e-mail request', s: 'k' },
    { d: '≤ 2 dny', cs: 'snímky v PACS ✓', en: 'images in PACS ✓', s: 'k' },
  ];
  const X = k => 90 + k * 170, Y = 24;
  const COLOR = { ok: '#7FE0C9', miss: '#FF7A6B', rep: '#7FA8FF', trig: '#FFFFFF', k: '#7FE0C9' };

  const band = document.createElement('div');
  band.className = 'band';
  band.innerHTML = '<div class="wrap"><svg viewBox="0 0 1200 78" preserveAspectRatio="xMidYMid meet" aria-label="Časová osa pacienta / Patient timeline"></svg></div>';
  document.body.appendChild(band);
  const svg = band.querySelector('svg');
  shEl('line', { x1: 40, y1: Y, x2: 1160, y2: Y, stroke: '#FFFFFF', 'stroke-opacity': 0.18, 'stroke-width': 2 }, svg);
  const progress = shEl('line', { x1: 40, y1: Y, x2: 40, y2: Y, stroke: '#7FE0C9', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);

  const pts = PTS.map((p, k) => {
    const g = shEl('g', {}, svg);
    const tris = [];
    for (let j = 0; j < 6; j++) {
      const a0 = (j * Math.PI) / 3, a1 = ((j + 1) * Math.PI) / 3, r = 11;
      const t = shEl('polygon', { points: shPts([[X(k), Y], [X(k) + r * Math.sin(a0), Y - r * Math.cos(a0)], [X(k) + r * Math.sin(a1), Y - r * Math.cos(a1)]]), fill: COLOR[p.s] }, g);
      if (p.s === 'miss') t.setAttribute('fill-opacity', 0.35);
      tris.push(t);
    }
    const ring = shEl('circle', { cx: X(k), cy: Y, r: 15, fill: 'none', stroke: COLOR[p.s], 'stroke-width': 2, 'stroke-dasharray': p.s === 'miss' ? '4 3' : '0', opacity: 0 }, g);
    const d = shEl('text', { x: X(k), y: Y + 30, 'text-anchor': 'middle', 'font-family': shFont, 'font-weight': 800, 'font-size': 13, fill: '#FFFFFF' }, g);
    d.textContent = p.d;
    const l = shEl('text', { x: X(k), y: Y + 47, 'text-anchor': 'middle', 'font-family': shFont, 'font-weight': 600, 'font-size': 12, fill: '#FFFFFF' }, g);
    l.innerHTML = shBi(p.cs, p.en);
    gsap.set([d, l], { opacity: 0.45 });
    return { g, tris, ring, d, l };
  });

  const motion = shMotion();
  if (motion) pts.forEach(p => p.tris.forEach(t => gsap.set(t, { x: gsap.utils.random(-60, 60), y: gsap.utils.random(20, 60), rotation: gsap.utils.random(-180, 180), opacity: 0, transformOrigin: '50% 50%' })));

  let assembled = false;
  function assemble() {
    if (assembled || !motion) return;
    assembled = true;
    pts.forEach((p, k) => gsap.to(p.tris, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.03, delay: k * 0.08 }));
  }

  let active = -1;
  function setActive(k) {
    if (k === active) return;
    active = k;
    gsap.to(progress, { attr: { x2: X(k) }, duration: 0.6, ease: 'power3.out' });
    pts.forEach((p, i) => {
      gsap.to([p.d, p.l], { opacity: i === k ? 1 : i < k ? 0.7 : 0.35, duration: 0.3 });
      gsap.to(p.ring, { opacity: i === k ? 1 : 0, duration: 0.3 });
    });
    const found = k >= 6;
    pts[1].tris.forEach(t => gsap.to(t, { fill: found ? '#7FE0C9' : '#FF7A6B', attr: { 'fill-opacity': found ? 1 : 0.35 }, duration: 0.4 }));
    pts[1].l.innerHTML = found ? shBi('CT · Thomayer ✓', 'CT · Thomayer ✓') : shBi(PTS[1].cs, PTS[1].en);
  }

  ScrollTrigger.create({
    trigger: '.hero', start: 'bottom 70%',
    onEnter: () => { band.classList.add('on'); assemble(); },
    onLeaveBack: () => band.classList.remove('on'),
  });
  document.querySelectorAll('[data-pt]').forEach(sec => {
    const k = +sec.dataset.pt;
    ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: self => self.isActive && setActive(k) });
  });
  setActive(0);
})();

// Hero: compass shards fly up into the band.
(() => {
  if (!shMotion()) return;
  const tl = gsap.timeline();
  tl.to(['#needle', '#priors', '#beam', '#caption'], { opacity: 0, duration: 0.2 }, 0)
    .to(shards, { y: () => gsap.utils.random(-700, -500), x: () => gsap.utils.random(-200, 200), rotation: () => gsap.utils.random(-120, 120), scale: 0.3, opacity: 0, transformOrigin: '50% 50%', duration: 0.8, stagger: { amount: 0.3, from: 'random' }, ease: 'power2.in' }, 0);
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom 40%', scrub: true, animation: tl,
    onUpdate: s => { holdSearch = s.progress > 0.02; } });
})();
