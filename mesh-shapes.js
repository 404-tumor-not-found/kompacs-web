// Shape library for the mesh. Box: -400..400. A shape = { polys: [{ p, f, o }], deco(g) }.
const MS = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const FONT = 'Plus Jakarta Sans, sans-serif';
  const el = (tag, a, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in a) e.setAttribute(k, a[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const bi = (cs, en) => `<tspan data-l="cs">${cs}</tspan><tspan data-l="en">${en}</tspan>`;
  const T = (g, x, y, cs, en, a = {}) => {
    const t = el('text', { x, y, 'font-family': FONT, 'font-weight': 800, ...a, 'font-size': Math.max(19, (a['font-size'] || 22) * 1.15) }, g);
    t.innerHTML = en == null ? cs : bi(cs, en);
    return t;
  };
  const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const D = (cx, cy, r) => [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]];
  const hexPts = (cx, cy, r) => [0, 60, 120, 180, 240, 300].map(a => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)]);
  const fan = (cx, cy, r) => { const h = hexPts(cx, cy, r); return h.map((p, i) => [[cx, cy], p, h[(i + 1) % 6]]); };
  const bar = (x, y, len, h, n, gap = 3) => {
    const w = (len - gap * (n - 1)) / n;
    return [...Array(n)].map((_, i) => R(x + i * (w + gap), y, w, h));
  };
  const lerp = (a, b, t) => a + (b - a) * t;

  const PAL = {
    dark: { a: '#2B8F86', b: '#1E7A73', c: '#3FA89D', hi: '#7FE0C9', miss: '#FF7A6B', dec: '#9B87F5', ink: '#FFFFFF', sub: 'rgba(255,255,255,.7)', line: 'rgba(255,255,255,.4)', card: '#FFFFFF', grey: '#5E7C7A', star: '#F2C94C' },
    light: { a: '#0F6B66', b: '#13716B', c: '#2B8F86', hi: '#00957F', miss: '#C9372C', dec: '#4B33B5', ink: '#14232A', sub: '#5C6E74', line: 'rgba(20,35,42,.35)', card: '#E3F1EF', grey: '#A9B6B9', star: '#C99A06' },
  };
  const P = (p, f, o = 1) => ({ p, f, o });

  // One patient timeline with the missing CT flagged.
  function timeline(pal) {
    const Y = -40;
    const polys = bar(-370, Y - 3, 650, 6, 16, 5).map(p => P(p, pal.line === PAL.dark.line ? '#2B8F86' : '#9FC9C3', 0.9));
    const ex = [['11/2025', -300], ['12/2025', -205, 1], ['2/2026', -110], ['4/2026', -20], ['5/2026', 70], ['7/2026', 160]];
    ex.forEach(([, x, m]) => polys.push(P(D(x, Y, 22), m ? pal.miss : pal.hi, m ? 0.55 : 1)));
    polys.push(P(D(310, Y, 26), pal.ink));
    [-300, -205, -110, 70, 160].forEach(x => polys.push(P(R(x - 11, 64, 22, 22), x === -205 ? pal.miss : pal.c)));
    [-250, -60, 110].forEach(x => polys.push(P(hexPts(x, 165, 13), pal.dec)));
    return {
      polys,
      deco: g => {
        [['ZOBRAZOVÁNÍ', 'IMAGING', -120], ['ZPRÁVY', 'REPORTS', 40], ['LÉČBA', 'TREATMENT', 140]].forEach(([cs, en, y]) => T(g, -370, y, cs, en, { fill: pal.sub, 'font-size': 16, 'letter-spacing': '0.08em' }));
        ex.forEach(([d, x]) => T(g, x, Y - 40, d, null, { 'text-anchor': 'middle', fill: pal.sub, 'font-size': 16, 'font-weight': 700 }));
        T(g, 310, Y - 44, 'plán', 'planned', { 'text-anchor': 'middle', fill: pal.ink, 'font-size': 17 });
        el('circle', { cx: -205, cy: Y, r: 34, fill: 'none', stroke: pal.miss, 'stroke-width': 3, 'stroke-dasharray': '6 5', class: 'pulse' }, g);
        T(g, -205, 128, 'CT · chybí v PACS', 'CT · missing in PACS', { 'text-anchor': 'middle', fill: pal.miss, 'font-size': 18 });
        T(g, -190, 250, '„CT v Thomayerově nemocnici 12/2025“', '“CT at Thomayer Hospital 12/2025”', { fill: pal.ink, 'font-size': 19, 'font-weight': 600, 'font-style': 'italic', 'text-anchor': 'middle' });
        el('path', { d: `M-205 ${Y + 36} V 222`, stroke: pal.miss, 'stroke-width': 2, 'stroke-dasharray': '4 5', fill: 'none' }, g);
      },
    };
  }

  // Patient body: chest and pelvis have priors, the abdomen is flagged.
  function body(pal) {
    const ROWS = [-180, -120, -60, 10, 70];
    const halfW = y => (y <= -60 ? lerp(92, 72, (y + 180) / 120) : y <= 10 ? lerp(72, 64, (y + 60) / 70) : lerp(64, 74, (y - 10) / 60));
    const tx = (c, y) => -halfW(y) + (c * 2 * halfW(y)) / 3;
    const quads = [], reg = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      const y0 = ROWS[r], y1 = ROWS[r + 1];
      quads.push([[tx(c, y0), y0], [tx(c + 1, y0), y0], [tx(c + 1, y1), y1], [tx(c, y1), y1]]);
      reg.push(r < 2 ? 'chest' : r === 2 ? 'abd' : 'pelvis');
    }
    for (const s of [-1, 1]) for (let r = 0; r < 4; r++) {
      const t0 = r / 4, t1 = (r + 1) / 4, y0 = lerp(-176, 58, t0), y1 = lerp(-176, 58, t1);
      quads.push([[s * lerp(98, 112, t0), y0], [s * lerp(130, 144, t0), y0], [s * lerp(130, 144, t1), y1], [s * lerp(98, 112, t1), y1]]);
      reg.push('limb');
    }
    for (const s of [-1, 1]) for (let c = 0; c < 2; c++) for (let r = 0; r < 4; r++) {
      const t0 = r / 4, t1 = (r + 1) / 4, y0 = lerp(70, 284, t0), y1 = lerp(70, 284, t1);
      const xin = t => lerp(6, 14, t), xout = t => lerp(70, 50, t), xm = t => lerp(xin(t), xout(t), 0.5);
      const a = c === 0 ? xin : xm, b = c === 0 ? xm : xout;
      quads.push([[s * a(t0), y0], [s * b(t0), y0], [s * b(t1), y1], [s * a(t1), y1]]);
      reg.push('limb');
    }
    const HEAD = [0, -240], hex = hexPts(0, -240, 40);
    const tris = [];
    for (let i = 0; i < 6; i++) tris.push([HEAD, hex[i], hex[(i + 1) % 6]]);
    tris.push([[-14, -200], [14, -200], [14, -180]], [[-14, -200], [14, -180], [-14, -180]]);
    for (const s of [-1, 1]) {
      tris.push([[s * 50, -180], [s * 98, -176], [s * 82, -196]], [[s * 50, -180], [s * 82, -196], [s * 26, -190]]);
      tris.push([[s * 112, 58], [s * 144, 58], [s * 132, 92]], [[s * 112, 58], [s * 132, 92], [s * 114, 84]]);
      tris.push([[s * 14, 284], [s * 50, 284], [s * 60, 300]], [[s * 14, 284], [s * 60, 300], [s * 8, 300]]);
    }
    const dx = -110;
    const sh = pts => pts.map(([x, y]) => [x + dx, y]);
    const polys = [
      ...tris.map(t => P(sh(t), pal.grey, 0.95)),
      ...quads.map((q, i) => P(sh(q), reg[i] === 'abd' ? pal.miss : reg[i] === 'limb' ? pal.grey : pal.hi, reg[i] === 'abd' ? 0.55 : 0.92)),
    ];
    return {
      polys,
      deco: g => {
        el('rect', { x: dx - 80, y: -66, width: 160, height: 82, rx: 10, fill: 'none', stroke: pal.miss, 'stroke-width': 3, 'stroke-dasharray': '8 6', class: 'pulse' }, g);
        [[-126, 'Hrudník · CT 2/2026 ✓', 'Chest · CT 2/2026 ✓', pal.hi], [-24, 'Břicho · CT 12/2025 chybí', 'Abdomen · CT 12/2025 missing', pal.miss], [46, 'Pánev · MR 7/2025 ✓', 'Pelvis · MRI 7/2025 ✓', pal.hi]].forEach(([y, cs, en, f]) => {
          el('line', { x1: dx + 80, y1: y - 6, x2: dx + 150, y2: y - 6, stroke: pal.line, 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }, g);
          T(g, dx + 160, y, cs, en, { fill: f, 'font-size': 19 });
        });
      },
    };
  }

  // Tile map of Czechia with hospital cities (illustration).
  const CITY = [['Praha · FN Motol, Homolka', 3.5, 2.3], ['Plzeň', 1.5, 2.8], ['Brno', 6.6, 3.9], ['Olomouc', 7.8, 2.6], ['Ostrava', 9.0, 1.6], ['Č. Budějovice', 3.9, 4.6], ['Hradec Králové', 5.4, 1.6]];
  function czmap(pal) {
    const mask = ['..XXX.....', '.XXXXXX.XX', 'XXXXXXXXXX', '.XXXXXXXX.', '..XXXXXX..', '...XX..XX.'];
    const S = 62, x0 = -310, y0 = -190;
    const polys = [];
    mask.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'X') polys.push(P(R(x0 + c * S, y0 + r * S, S - 5, S - 5), (r + c) % 3 === 0 ? pal.c : (r + c) % 2 ? pal.a : pal.b, 0.75)); }));
    const at = (c, r) => [x0 + c * S, y0 + r * S];
    CITY.forEach(([, c, r], i) => polys.push(P(hexPts(...at(c, r), i === 0 ? 24 : 16), i === 0 ? pal.ink : pal.hi)));
    return {
      polys,
      deco: g => {
        CITY.forEach(([n, c, r], i) => {
          const [x, y] = at(c, r);
          T(g, x, y + (i === 0 || i === 6 ? -30 : 40), n, null, { 'text-anchor': 'middle', fill: '#FFFFFF', 'font-size': i === 0 ? 19 : 16, stroke: '#072B29', 'stroke-width': 5, 'paint-order': 'stroke' });
        });
        T(g, -310, -240, 'Jeden balík na nemocnici', 'One stack per hospital', { fill: pal.ink, 'font-size': 26 });
        T(g, -310, 250, 'on-prem nebo EU cloud · český IT integrátor', 'on-prem or EU cloud · a Czech IT integrator', { fill: pal.sub, 'font-size': 18, 'font-weight': 700 });
        T(g, -310, 280, 'ilustrace možného rozšíření', 'illustration of a possible rollout', { fill: pal.sub, 'font-size': 15, 'font-weight': 600 });
      },
    };
  }

  // Work time: 1 piece = 1 hour (estimate). Below: the 34 found scans.
  function hours(pal) {
    const polys = [...bar(-320, -170, 600, 60, 10, 4).map(p => P(p, pal.grey)), ...bar(-320, -40, 120, 60, 2, 4).map(p => P(p, pal.a))];
    for (let i = 0; i < 34; i++) polys.push(P(R(-320 + (i % 17) * 38, 110 + Math.floor(i / 17) * 40, 32, 32), pal.hi));
    return {
      polys,
      deco: g => {
        T(g, -320, -184, 'Dnes · 10 h na 40 případů', 'Today · 10 h for 40 cases', { fill: pal.ink, 'font-size': 21 });
        T(g, -320, -54, 'S KOMPACS · 2 h', 'With KOMPACS · 2 h', { fill: pal.a, 'font-size': 21 });
        T(g, -180, -2, 'odhad · 1 dílek = 1 hodina · ~68 telefonátů méně', 'estimate · 1 block = 1 hour · ~68 fewer calls', { fill: pal.sub, 'font-size': 16, 'font-weight': 700 });
        T(g, -320, 96, '34 chybějících snímků nalezeno', '34 missing scans found', { fill: pal.ink, 'font-size': 21 });
      },
    };
  }

  // Roadmap: Motol pilot -> Homolka -> VZP data 2028 -> EHDS 2031 (not ours).
  function roadmap(pal) {
    const M = [[-300, 170], [-95, 60], [110, -50], [315, -160]];
    const polys = [];
    for (let i = 0; i < 3; i++) {
      const [a, b] = [M[i], M[i + 1]];
      for (let k = 0; k < 7; k++) {
        const t0 = 0.16 + (k / 7) * 0.68, t1 = t0 + 0.07;
        const p0 = [lerp(a[0], b[0], t0), lerp(a[1], b[1], t0)], p1 = [lerp(a[0], b[0], t1), lerp(a[1], b[1], t1)];
        polys.push(P([[p0[0], p0[1] - 4], [p1[0], p1[1] - 4], [p1[0], p1[1] + 4], [p0[0], p0[1] + 4]], pal.hi, i === 2 ? 0.35 : 0.8));
      }
    }
    M.forEach(([x, y], i) => fan(x, y, 34).forEach((t, j) => polys.push(P(t, i === 3 ? pal.grey : j % 2 ? pal.a : pal.hi, i === 3 ? 0.6 : 1))));
    return {
      polys,
      deco: g => {
        [['Pilot FN Motol', 'Pilot at FN Motol', 'skutečné objednávky', 'real orders'], ['Nemocnice Na Homolce', 'Na Homolce Hospital', 'napojení na ePACS', 'ePACS connection'], ['Data VZP', 'VZP data', 'cílově 1. 1. 2028', 'target 2028-01-01'], ['EHDS', 'EHDS', 'sdílení snímků 2031', 'image exchange 2031']].forEach(([cs, en, s1, s2], i) => {
          const [x, y] = M[i];
          T(g, x, y + 62, cs, en, { 'text-anchor': 'middle', fill: i === 3 ? pal.sub : pal.ink, 'font-size': 19 });
          T(g, x, y + 86, s1, s2, { 'text-anchor': 'middle', fill: pal.sub, 'font-size': 15, 'font-weight': 700 });
        });
      },
    };
  }

  return { PAL, timeline, body, czmap, hours, roadmap };
})();
