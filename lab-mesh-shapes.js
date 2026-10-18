// Shape library for the mesh labs. Box: -400..400. A shape = { polys: [{ p, f, o }], deco(g) }.
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
  const rot = (pts, deg, cx, cy) => {
    const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
  };
  const bar = (x, y, len, h, n, gap = 3) => {
    const w = (len - gap * (n - 1)) / n;
    return [...Array(n)].map((_, i) => R(x + i * (w + gap), y, w, h));
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  let seed = 1;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const PAL = {
    dark: { a: '#2B8F86', b: '#1E7A73', c: '#3FA89D', hi: '#7FE0C9', miss: '#FF7A6B', dec: '#9B87F5', ink: '#FFFFFF', sub: 'rgba(255,255,255,.7)', line: 'rgba(255,255,255,.4)', card: '#FFFFFF', grey: '#5E7C7A', star: '#F2C94C' },
    light: { a: '#0F6B66', b: '#13716B', c: '#2B8F86', hi: '#00957F', miss: '#C9372C', dec: '#4B33B5', ink: '#14232A', sub: '#5C6E74', line: 'rgba(20,35,42,.35)', card: '#E3F1EF', grey: '#A9B6B9', star: '#C99A06' },
  };
  const SRC = { nis: '#2B5BB8', rep: '#00957F', ins: '#B4441C' };
  const P = (p, f, o = 1) => ({ p, f, o });

  // Problem: one patient's scans lie in different hospitals. Only ours is in PACS.
  function scatter(pal) {
    seed = 11;
    const C = [
      { x: -205, y: -170, n: 20, cs: 'FN Motol · v PACS', en: 'FN Motol · in PACS', f: i => (i % 3 ? pal.a : pal.hi), o: 1 },
      { x: 210, y: -185, n: 14, cs: 'Homolka · k ověření', en: 'Homolka · to check', f: () => pal.dec, o: 0.9 },
      { x: -200, y: 190, n: 14, cs: 'Thomayer · chybí', en: 'Thomayer · missing', f: () => pal.miss, o: 0.85 },
      { x: 205, y: 185, n: 13, cs: 'jen věta ve zprávě', en: 'only a sentence in a report', f: () => pal.miss, o: 0.4 },
    ];
    const polys = [];
    C.forEach(c => {
      for (let i = 0; i < c.n; i++) {
        const x = c.x + (rnd() - 0.5) * 190, y = c.y + (rnd() - 0.5) * 120;
        polys.push(P(rot(R(x - 22, y - 16, 44, 32), (rnd() - 0.5) * 60, x, y), c.f(i), c.o));
      }
    });
    return {
      polys,
      deco: g => C.forEach(c => T(g, c.x, c.y < 0 ? c.y - 100 : c.y + 120, c.cs, c.en, { 'text-anchor': 'middle', fill: c.f(1) === pal.a ? pal.hi : c.f(1), 'font-size': 21 })),
    };
  }

  // Source lanes. Bar length is proportional to the count.
  function lanes(pal, col = SRC) {
    const rows = [
      ['nis', 198, 40, 'Záznam v NIS', 'NIS record', -170],
      ['rep', 74, 18, 'Zmínka ve zprávě (AI)', 'Mention in a report (AI)', -20],
      ['ins', 14, 3, 'Zdravotní pojišťovna', 'Health insurer', 130],
    ];
    const k = 600 / 198, x0 = -330;
    const polys = [];
    rows.forEach(([key, n, cnt, , , y]) => bar(x0, y, n * k, 58, cnt, cnt > 3 ? 3 : 2).forEach(p => polys.push(P(p, col[key]))));
    return {
      polys,
      deco: g => {
        rows.forEach(([key, n, , cs, en, y]) => {
          T(g, x0, y - 14, cs, en, { fill: pal.ink, 'font-size': 21 });
          T(g, x0 + n * k + 14, y + 42, String(n), null, { fill: col[key], 'font-size': 34 });
        });
        T(g, x0 + 14 * k + 70, 172, '(v prototypu simulováno)', '(simulated in the prototype)', { fill: pal.sub, 'font-size': 17, 'font-weight': 600 });
        T(g, x0, 270, '286 kandidátních vyšetření · délka = počet', '286 candidate exams · length = count', { fill: pal.sub, 'font-size': 18, 'font-weight': 600 });
      },
    };
  }

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

  // AI verdict card, built from mesh tiles.
  function verdict(pal) {
    const polys = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) polys.push(P(R(-330 + c * 110, -170 + r * 114, 106, 110), pal.card, 1));
    polys.push(P(R(-300, -140, 170, 38), '#0F6B66'));
    polys.push(P(R(-302, 0, 520, 40), '#7FE0C9', 0.45));
    polys.push(P(R(-300, 92, 270, 4), '#0F6B66'));
    fan(250, -110, 46).forEach(t => polys.push(P(t, '#4B33B5')));
    return {
      polys,
      deco: g => {
        const ink = '#14232A';
        T(g, -215, -114, 'relevantní ✓', 'relevant ✓', { 'text-anchor': 'middle', fill: '#FFFFFF', 'font-size': 19 });
        T(g, -300, -50, 'CT hrudníku a břicha · 12/2025', 'Chest and abdomen CT · 12/2025', { fill: ink, 'font-size': 27 });
        T(g, -300, -14, 'Proč: nejnovější CT pro srovnání.', 'Why: the latest CT for comparison.', { fill: '#2C3D44', 'font-size': 19, 'font-weight': 600 });
        T(g, -290, 27, '„CT v Thomayerově nemocnici 12/2025“', '“CT at Thomayer Hospital 12/2025”', { fill: ink, 'font-size': 19, 'font-weight': 600, 'font-style': 'italic' });
        T(g, -300, 84, 'Modrá kniha ČOS, s. 220', 'Modrá kniha (guideline), p. 220', { fill: '#0F6B66', 'font-size': 21 });
        T(g, -300, 135, 'Ověřená citace. Neověřenou systém zahodí.', 'Verified citation. An unverified one is dropped.', { fill: '#5C6E74', 'font-size': 17, 'font-weight': 600 });
        el('circle', { cx: 250, cy: -122, r: 11, fill: '#FFFFFF' }, g);
        el('path', { d: 'M232 -88 a18 16 0 0 1 36 0', fill: '#FFFFFF' }, g);
        T(g, 250, -40, 'nejisté rozhoduje', 'a human decides', { 'text-anchor': 'middle', fill: '#4B33B5', 'font-size': 15 });
        T(g, 250, -22, 'člověk', 'the uncertain', { 'text-anchor': 'middle', fill: '#4B33B5', 'font-size': 15 });
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

  // E-mail instead of a phone robot.
  function envelope(pal) {
    const sub = t => { const [a, b, c] = t, m = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; const ab = m(a, b), bc = m(b, c), ca = m(c, a); return [[a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]]; };
    const sub2 = t => sub(t).flatMap(sub);
    const TL = [-300, -190], TR = [300, -190], BR = [300, 190], BL = [-300, 190], C = [0, 40];
    const polys = [
      ...sub2([TL, TR, C]).map((t, i) => P(t, i % 2 ? pal.c : pal.hi, 0.95)),
      ...sub2([BL, C, BR]).map((t, i) => P(t, i % 2 ? pal.a : pal.b)),
      ...sub([TL, C, BL]).map(t => P(t, pal.b)),
      ...sub([TR, BR, C]).map(t => P(t, pal.b)),
    ];
    return {
      polys,
      deco: g => {
        T(g, 0, -228, 'Komu: radiologie@thomayer.example', 'To: radiologie@thomayer.example', { 'text-anchor': 'middle', fill: pal.ink, 'font-size': 21 });
        el('circle', { cx: 0, cy: 40, r: 32, fill: '#FFFFFF' }, g);
        el('path', { d: 'M-15 40 l10 11 21 -23', stroke: '#0A3F3C', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
        T(g, 0, 240, 'ověřený kontakt · schvaluje člověk', 'verified contact · a human approves', { 'text-anchor': 'middle', fill: pal.sub, 'font-size': 20, 'font-weight': 700 });
      },
    };
  }

  // The obvious approach: an AI voice bot calls whoever picks up.
  function phone(pal) {
    const polys = [];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) polys.push(P(R(-230 + c * 54, -220 + r * 54, 50, 50), pal.miss, r === 0 || r === 7 ? 0.5 : 0.8));
    [150, 205, 260].forEach((rad, k) => {
      for (let i = 0; i < 5; i++) {
        const a0 = -40 + i * 16, a1 = a0 + 13, w = 12, cx = -122, cy = -4;
        const pt = (a, r) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
        polys.push(P([pt(a0, rad), pt(a1, rad), pt(a1, rad + w), pt(a0, rad + w)], pal.miss, 0.8 - k * 0.2));
      }
    });
    return {
      polys,
      deco: g => {
        T(g, -122, -250, 'Očividné řešení: AI robot volá', 'Obvious approach: an AI bot calls', { 'text-anchor': 'middle', fill: pal.miss, 'font-size': 20 });
        T(g, -122, 270, 'rodné číslo + diagnóza → komukoli', 'birth number + diagnosis → anyone', { 'text-anchor': 'middle', fill: pal.ink, 'font-size': 20 });
        el('path', { d: 'M-260 -200 L 20 200 M 20 -200 L -260 200', stroke: pal.miss, 'stroke-width': 10, 'stroke-linecap': 'round', opacity: 0.9 }, g);
      },
    };
  }

  // Shield ringed by 12 EU stars.
  function shield(pal) {
    const B = [[0, -250], [200, -190], [190, 30], [120, 170], [0, 250], [-120, 170], [-190, 30], [-200, -190]];
    const per = [];
    const L = B.map((p, i) => Math.hypot(B[(i + 1) % 8][0] - p[0], B[(i + 1) % 8][1] - p[1]));
    const tot = L.reduce((a, b) => a + b);
    for (let k = 0; k < 36; k++) {
      let d = (k / 36) * tot, i = 0;
      while (d > L[i]) { d -= L[i]; i++; }
      const a = B[i], b = B[(i + 1) % 8];
      per.push([lerp(a[0], b[0], d / L[i]), lerp(a[1], b[1], d / L[i])]);
    }
    const c = [0, -10];
    const polys = per.map((p, i) => P([c, p, per[(i + 1) % 36]], p[1] < -10 ? (i % 2 ? pal.c : pal.a) : i % 2 ? pal.a : pal.b, 0.95));
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 * Math.PI) / 180, x = 330 * Math.sin(a), y = -330 * Math.cos(a);
      polys.push(P([[x, y - 17], [x + 15, y + 10], [x - 15, y + 10]], pal.star));
    }
    return {
      polys,
      deco: g => {
        el('rect', { x: -52, y: -24, width: 104, height: 84, rx: 12, fill: '#FFFFFF' }, g);
        el('path', { d: 'M-30 -24 V -54 a30 30 0 0 1 60 0 V -24', stroke: '#FFFFFF', 'stroke-width': 14, fill: 'none' }, g);
        el('circle', { cx: 0, cy: 12, r: 10, fill: '#0F6B66' }, g);
        T(g, 0, 392, 'EU Data Zone · auditní stopa', 'EU Data Zone · audit trail', { 'text-anchor': 'middle', fill: pal.ink, 'font-size': 22 });
      },
    };
  }

  // HL7 v2 in, IRIS inside, FHIR R4 out.
  function pipeline(pal) {
    const N = [[-275, 70, pal.c], [0, 100, pal.a], [275, 70, pal.hi]];
    const polys = [];
    N.forEach(([x, r, f]) => fan(x, -20, r).forEach((t, i) => polys.push(P(t, f, i % 2 ? 0.85 : 1))));
    [[-195, -110], [110, 195]].forEach(([a, b]) => bar(a + 6, -26, b - a - 12, 12, 5, 6).forEach(p => polys.push(P(p, pal.hi, 0.8))));
    ['ServiceRequest', 'ImagingStudy', 'Composition', 'Basic'].forEach((_, i) => polys.push(P(R(205 + (i % 2) * 74, 110 + Math.floor(i / 2) * 44, 66, 34), pal.card, 0.9)));
    return {
      polys,
      deco: g => {
        [[-275, 'HL7 v2', 'ORM^O01'], [0, 'IRIS for Health', 'FHIR SQL · Vector Search'], [275, 'FHIR R4', 'Composition']].forEach(([x, a, b]) => {
          T(g, x, -140, a, null, { 'text-anchor': 'middle', fill: pal.ink, 'font-size': 23 });
          T(g, x, -114, b, null, { 'text-anchor': 'middle', fill: pal.sub, 'font-size': 15, 'font-weight': 700 });
        });
        T(g, -152, -42, '~1 s', null, { 'text-anchor': 'middle', fill: pal.hi, 'font-size': 20 });
        ['SR', 'IS', 'Comp', 'Basic'].forEach((s, i) => T(g, 238 + (i % 2) * 74, 133 + Math.floor(i / 2) * 44, s, null, { 'text-anchor': 'middle', fill: '#14232A', 'font-size': 14 }));
        T(g, -360, 150, 'Nemocnice nic nemění:', 'The hospital changes nothing:', { fill: pal.ink, 'font-size': 20 });
        T(g, -360, 178, 'HL7 v2, FHIR, PACS feed', 'HL7 v2, FHIR, a PACS feed', { fill: pal.sub, 'font-size': 18, 'font-weight': 600 });
        T(g, -360, 250, '89 461 vět ze zpráv jako vektory v IRIS', '89,461 report sentences as vectors in IRIS', { fill: pal.sub, 'font-size': 18, 'font-weight': 600 });
      },
    };
  }

  const MISS40 = new Set([0, 2, 3, 5, 7, 8, 11, 12, 14, 16, 17, 19, 21, 22, 24, 26, 27, 30, 31, 33, 35, 36, 38, 39]);
  function waffle(pal) {
    const polys = [...Array(40)].map((_, i) => P(R(-318 + (i % 8) * 80, -190 + Math.floor(i / 8) * 80, 72, 72), MISS40.has(i) ? pal.miss : pal.a, MISS40.has(i) ? 0.85 : 1));
    return {
      polys,
      deco: g => {
        T(g, -318, -222, '24 ze 40 případů: chybí snímek', '24 of 40 cases: a scan is missing', { fill: pal.miss, 'font-size': 27 });
        el('rect', { x: -318, y: 238, width: 18, height: 18, rx: 3, fill: pal.a }, g);
        T(g, -292, 254, 'srovnání v PACS', 'comparison in PACS', { fill: pal.sub, 'font-size': 17, 'font-weight': 700 });
        el('rect', { x: -90, y: 238, width: 18, height: 18, rx: 3, fill: pal.miss }, g);
        T(g, -64, 254, 'chybí · 1 čtverec = 1 případ', 'missing · 1 square = 1 case', { fill: pal.sub, 'font-size': 17, 'font-weight': 700 });
      },
    };
  }

  // 286 -> 127 -> 34. Width is proportional. All 34 come from report text.
  function funnel(pal, col = SRC) {
    const k = 640 / 286, x0 = -320, Y = [-200, -20, 160];
    const polys = [];
    bar(x0, Y[0], 198 * k - 3, 66, 24).forEach(p => polys.push(P(p, col.nis)));
    bar(x0 + 198 * k, Y[0], 74 * k - 3, 66, 9).forEach(p => polys.push(P(p, col.rep)));
    bar(x0 + 272 * k, Y[0], 14 * k, 66, 2).forEach(p => polys.push(P(p, col.ins)));
    bar(x0, Y[1], 127 * k, 66, 16).forEach(p => polys.push(P(p, pal.a)));
    bar(x0, Y[2], 34 * k, 66, 4).forEach(p => polys.push(P(p, col.rep)));
    return {
      polys,
      deco: g => {
        T(g, x0, Y[0] - 14, 'Kandidáti · 286', 'Candidates · 286', { fill: pal.ink, 'font-size': 23 });
        T(g, x0, Y[0] + 92, 'NIS 198 · zprávy 74 · pojišťovna 14', 'NIS 198 · reports 74 · insurer 14', { fill: pal.sub, 'font-size': 16, 'font-weight': 700 });
        T(g, x0, Y[1] - 14, 'Relevantní · 127', 'Relevant · 127', { fill: pal.ink, 'font-size': 23 });
        T(g, x0, Y[2] - 14, 'Chybí v PACS · 34', 'Missing in PACS · 34', { fill: pal.miss, 'font-size': 23 });
        el('rect', { x: x0 - 5, y: Y[2] - 5, width: 34 * k + 10, height: 76, rx: 8, fill: 'none', stroke: pal.miss, 'stroke-width': 3, 'stroke-dasharray': '7 5' }, g);
        T(g, x0 + 34 * k + 22, Y[2] + 30, 'všech 34 jen v textu zpráv', 'all 34 only in report text', { fill: col.rep, 'font-size': 19 });
        T(g, x0 + 34 * k + 22, Y[2] + 56, 'hledání v NIS a PACS: 0 z 34', 'NIS and PACS search: 0 of 34', { fill: pal.sub, 'font-size': 17, 'font-weight': 700 });
        T(g, x0, 300, 'šířka = počet vyšetření, 40 demo případů', 'width = number of exams, 40 demo cases', { fill: pal.sub, 'font-size': 15, 'font-weight': 600 });
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

  // Duplicate CT avoided (illustration, not a measured dose).
  function dose(pal) {
    const polys = [];
    for (let i = 0; i < 20; i++) polys.push(P(R(-290 + (i % 4) * 44, 120 - Math.floor(i / 4) * 44, 40, 40), pal.a));
    for (let i = 0; i < 20; i++) polys.push(P(R(90 + (i % 4) * 44, 120 - Math.floor(i / 4) * 44, 40, 40), pal.miss, 0.28));
    return {
      polys,
      deco: g => {
        T(g, -202, 210, 'Plánované CT', 'Planned CT', { 'text-anchor': 'middle', fill: pal.ink, 'font-size': 21 });
        T(g, 178, 210, 'Stejné CT do 6 týdnů', 'Same CT within 6 weeks', { 'text-anchor': 'middle', fill: pal.miss, 'font-size': 21 });
        el('path', { d: 'M70 -70 L 290 170', stroke: pal.miss, 'stroke-width': 8, 'stroke-linecap': 'round' }, g);
        T(g, 178, -110, 'upozornění → odpadá', 'alert → avoided', { 'text-anchor': 'middle', fill: pal.miss, 'font-size': 22 });
        T(g, -202, -110, 'dávka záření', 'radiation dose', { 'text-anchor': 'middle', fill: pal.sub, 'font-size': 18, 'font-weight': 700 });
        T(g, 0, 270, 'ilustrace, ne měřená dávka · v demu 1 upozornění', 'illustration, not a measured dose · 1 alert in the demo', { 'text-anchor': 'middle', fill: pal.sub, 'font-size': 16, 'font-weight': 600 });
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

  return { PAL, SRC, scatter, lanes, timeline, verdict, body, envelope, phone, shield, pipeline, waffle, funnel, czmap, dose, hours, roadmap };
})();
