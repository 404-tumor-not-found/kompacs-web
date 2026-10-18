// E: "Dnes vs. s KOMPACS" split screen (5 steps) and a data pipeline with flowing triangles.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const motion = shMotion();

  // ---- Split screen ----
  const sL = document.getElementById('sL'), sR = document.getElementById('sR');
  const N = 36;
  const L = makeShards(sL, N, 250, 200), R = makeShards(sR, N, 250, 200);
  const steps = [...document.querySelectorAll('.sstep')];
  const caps = [...document.querySelectorAll('.split [data-i]')];
  const bigs = [...document.querySelectorAll('.split .big[data-b]')];

  const grid = (n, cols, x, y, cell, gap) => [...Array(n)].map((_, i) => shRect(x + (i % cols) * (cell + gap), y + Math.floor(i / cols) * (cell + gap), cell, cell));
  const outline = (x, y, w, h, t) => [shRect(x, y, w, t), shRect(x + w - t, y, t, h), shRect(x, y + h - t, w, t), shRect(x, y, t, h)];
  const lines = (x, y, w, n, gap, h, short = []) => [...Array(n)].map((_, i) => shRect(x, y + i * gap, short.includes(i) ? w * 0.6 : w, h));

  const rightShapes = [
    // 1 report text: 34 of 34 found
    grid(34, 7, 110, 70, 30, 9),
    // 2 insurer ledger: 6 rows of receipts, one highlighted
    [...outline(90, 60, 320, 280, 8), ...lines(120, 95, 260, 6, 40, 18, [1, 4])],
    // 3 envelope
    [...outline(100, 100, 300, 200, 10), shTri([110, 110], [250, 215], [250, 230]), shTri([390, 110], [250, 215], [250, 230]), shRect(240, 210, 20, 20)],
    // 4 document with a cited line
    [...outline(130, 40, 240, 320, 8), ...lines(160, 80, 180, 7, 36, 14, [2, 5]), shRect(150, 222, 200, 26)],
    // 5 three sources into one hub
    [shRect(40, 70, 110, 50), shRect(40, 175, 110, 50), shRect(40, 280, 110, 50), shRect(150, 92, 120, 6), shRect(150, 197, 120, 6), shRect(150, 302, 120, 6), shRect(264, 95, 6, 213), shRect(270, 175, 190, 60)],
  ];
  const highlight = [[], [7], [11, 12], [11], [7]];

  const chaos = () => [...Array(N)].map(() => {
    const x = gsap.utils.random(40, 460), y = gsap.utils.random(40, 360), s = gsap.utils.random(10, 30), a = gsap.utils.random(0, 6.28);
    return shTri([x + s * Math.cos(a), y + s * Math.sin(a)], [x + s * Math.cos(a + 2.2), y + s * Math.sin(a + 2.2)], [x + s * Math.cos(a + 4.1), y + s * Math.sin(a + 4.1)]);
  });

  const showCap = i => {
    caps.forEach(c => c.classList.toggle('on', +c.dataset.i === i));
    bigs.forEach(b => b.classList.toggle('on', +b.dataset.b === i));
  };

  if (!motion) {
    morphStatic(L.polys, chaos(), '#FF7A6B', 0.6);
    morphStatic(R.polys, rightShapes[2], '#7FE0C9', 1);
    caps.forEach(c => c.classList.add('on'));
  } else {
    L.polys.forEach(p => gsap.to(p, { x: () => gsap.utils.random(-8, 8), y: () => gsap.utils.random(-8, 8), rotation: () => gsap.utils.random(-25, 25), transformOrigin: '50% 50%', duration: () => gsap.utils.random(0.6, 1.4), repeat: -1, yoyo: true, repeatRefresh: true, ease: 'sine.inOut' }));
    steps.forEach((st, i) => {
      const tl = gsap.timeline();
      morphTo(tl, L.polys, chaos(), 0, { fill: () => (Math.random() < 0.5 ? '#FF7A6B' : '#8A9BA1'), opacity: 0.7, dur: 0.6 });
      morphTo(tl, R.polys, rightShapes[i], 0, { fill: j => (highlight[i].includes(j) ? '#FFFFFF' : '#7FE0C9'), dur: 0.6, collapse: [250, 200] });
      ScrollTrigger.create({ trigger: st, start: 'top 75%', end: 'top 25%', scrub: true, animation: tl, onUpdate: s => showCap(s.progress > 0.5 ? i : Math.max(0, i - 1)) });
    });
    showCap(0);
  }

  function morphStatic(polys, shapes, fill, op) {
    polys.forEach((p, i) => { const s = shapes[i]; p.setAttribute('points', shPts(s || shDot(250, 200))); p.style.opacity = s ? op : 0; p.setAttribute('fill', fill); });
  }

  // ---- Pipeline ----
  const pipe = document.getElementById('pipe');
  if (!pipe) return;
  const SRC = [{ y: 70, c: '#5B8DEF', cs: 'NIS · 198', en: 'NIS · 198' }, { y: 170, c: '#2EC4A9', cs: 'Zprávy (AI) · 74', en: 'Reports (AI) · 74' }, { y: 270, c: '#E07A4F', cs: 'Pojišťovna · 14', en: 'Insurer · 14' }];
  const HUB = { x: 420, y: 120, w: 300, h: 140 }, OUT = { x: 880, y: 140, w: 220, h: 100 };
  SRC.forEach(s => {
    shEl('rect', { x: 20, y: s.y - 26, width: 200, height: 52, rx: 12, fill: 'rgba(255,255,255,0.06)', stroke: s.c, 'stroke-width': 2 }, pipe);
    const t = shEl('text', { x: 120, y: s.y + 6, 'text-anchor': 'middle', 'font-family': shFont, 'font-weight': 800, 'font-size': 16, fill: '#FFFFFF' }, pipe);
    t.innerHTML = shBi(s.cs, s.en);
    shEl('path', { d: `M220 ${s.y} C 320 ${s.y}, 320 ${HUB.y + HUB.h / 2}, ${HUB.x} ${HUB.y + HUB.h / 2}`, fill: 'none', stroke: s.c, 'stroke-opacity': 0.35, 'stroke-width': 2 }, pipe);
  });
  shEl('rect', { x: HUB.x, y: HUB.y, width: HUB.w, height: HUB.h, rx: 16, fill: '#0F6B66', stroke: '#7FE0C9', 'stroke-width': 2 }, pipe);
  [['InterSystems IRIS for Health', 'InterSystems IRIS for Health', 30, 18, 800], ['HL7 v2 → FHIR R4', 'HL7 v2 → FHIR R4', 60, 15, 700], ['vektorové hledání ve zprávách', 'vector search over reports', 86, 14, 600], ['AI hodnocení · EU Data Zone', 'AI verdict · EU Data Zone', 112, 14, 600]].forEach(([cs, en, dy, fs, fw]) => {
    const t = shEl('text', { x: HUB.x + HUB.w / 2, y: HUB.y + dy, 'text-anchor': 'middle', 'font-family': shFont, 'font-weight': fw, 'font-size': fs, fill: dy === 30 ? '#FFFFFF' : '#CFF5EC' }, pipe);
    t.innerHTML = shBi(cs, en);
  });
  shEl('path', { d: `M${HUB.x + HUB.w} ${HUB.y + HUB.h / 2} H ${OUT.x}`, stroke: '#7FE0C9', 'stroke-opacity': 0.4, 'stroke-width': 2 }, pipe);
  shEl('rect', { x: OUT.x, y: OUT.y, width: OUT.w, height: OUT.h, rx: 16, fill: 'rgba(127,224,201,0.15)', stroke: '#7FE0C9', 'stroke-width': 2 }, pipe);
  const o1 = shEl('text', { x: OUT.x + OUT.w / 2, y: OUT.y + 42, 'text-anchor': 'middle', 'font-family': shFont, 'font-weight': 800, 'font-size': 18, fill: '#FFFFFF' }, pipe);
  o1.innerHTML = shBi('PACS · dostupné ✓', 'PACS · available ✓');
  const o2 = shEl('text', { x: OUT.x + OUT.w / 2, y: OUT.y + 70, 'text-anchor': 'middle', 'font-family': shFont, 'font-weight': 600, 'font-size': 14, fill: '#CFF5EC' }, pipe);
  o2.innerHTML = shBi('schválí koordinátor/ka', 'approved by the coordinator');

  if (!motion) return;
  const flows = [];
  SRC.forEach((s, si) => {
    for (let k = 0; k < 6; k++) {
      const tri = shEl('polygon', { points: '0,-6 6,5 -6,5', fill: s.c }, pipe);
      const midY = HUB.y + HUB.h / 2;
      const tl = gsap.timeline({ repeat: -1, delay: k * 0.55 + si * 0.2, paused: true });
      tl.set(tri, { x: 220, y: s.y, fill: s.c, opacity: 1 })
        .to(tri, { keyframes: [{ x: 300, y: (s.y + midY) / 2 }, { x: HUB.x, y: midY }], duration: 1.4, ease: 'none' })
        .set(tri, { opacity: 0 })
        .set(tri, { x: HUB.x + HUB.w, y: midY + gsap.utils.random(-14, 14), fill: '#7FE0C9', opacity: si === 1 || k % 2 ? 1 : 0 })
        .to(tri, { x: OUT.x, rotation: 180, duration: 1.1, ease: 'none' }, '+=0.5');
      flows.push(tl);
    }
  });
  ScrollTrigger.create({ trigger: pipe, start: 'top 90%', end: 'bottom 10%', onToggle: s => flows.forEach(f => (s.isActive ? f.play() : f.pause())) });
})();
