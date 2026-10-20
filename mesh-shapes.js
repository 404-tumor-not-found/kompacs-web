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
  const T = (g, x, y, text, a = {}) => {
    const t = el('text', { x, y, 'font-family': FONT, 'font-weight': 800, ...a, 'font-size': Math.max(19, (a['font-size'] || 22) * 1.15) }, g);
    t.textContent = text;
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
        [['mesh.imaging', -120], ['mesh.reports', 40], ['mesh.treatment', 140]].forEach(([k, y]) => T(g, -370, y, tr(k), { fill: pal.sub, 'font-size': 16, 'letter-spacing': '0.08em' }));
        ex.forEach(([d, x]) => T(g, x, Y - 40, d, { 'text-anchor': 'middle', fill: pal.sub, 'font-size': 16, 'font-weight': 700 }));
        T(g, 310, Y - 44, tr('common.planned'), { 'text-anchor': 'middle', fill: pal.ink, 'font-size': 17 });
        el('circle', { cx: -205, cy: Y, r: 34, fill: 'none', stroke: pal.miss, 'stroke-width': 3, 'stroke-dasharray': '6 5', class: 'pulse' }, g);
        T(g, -205, 128, tr('mesh.ct_missing'), { 'text-anchor': 'middle', fill: pal.miss, 'font-size': 18 });
        T(g, -190, 250, tr('mesh.report_quote'), { fill: pal.ink, 'font-size': 19, 'font-weight': 600, 'font-style': 'italic', 'text-anchor': 'middle' });
        el('path', { d: `M-205 ${Y + 36} V 222`, stroke: pal.miss, 'stroke-width': 2, 'stroke-dasharray': '4 5', fill: 'none' }, g);
      },
    };
  }

  // Patient body as a few hand-placed shards, deliberately uneven. Chest and pelvis have priors, the abdomen is missing and planned.
  function body(pal) {
    const GAP = 3;
    const inset = pts => {
      const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
      return pts.map(([x, y]) => { const d = Math.hypot(cx - x, cy - y) || 1; return [x + ((cx - x) / d) * GAP, y + ((cy - y) / d) * GAP]; });
    };
    const L0 = [-86, -194], M0 = [8, -204], R0 = [92, -198];
    const L1 = [-66, -100], M1 = [-6, -106], R1 = [70, -96];
    const L2 = [-58, -10], M2 = [10, -6], R2 = [60, -14];
    const L3 = [-72, 66], M3 = [-4, 76], R3 = [74, 62];
    const shards = [
      ...[[[-36, -258], [4, -292], [34, -266]], [[-36, -258], [34, -266], [24, -222]], [[-36, -258], [24, -222], [-20, -218]], [[-14, -214], [18, -216], [8, -204]]].map(t => [t, 'grey']),
      ...[[L0, M0, L1], [M0, M1, L1], [M0, R0, R1], [M0, R1, M1]].map(t => [t, 'chest']),
      ...[[L1, M1, M2], [L1, M2, L2], [M1, R1, M2], [R1, R2, M2]].map(t => [t, 'abd']),
      ...[[L2, M2, L3], [M2, M3, L3], [M2, R2, R3], [M2, R3, M3]].map(t => [t, 'pelvis']),
      ...[
        [[-120, -180], [-91, -190], [-94, -84]], [[-120, -180], [-94, -84], [-122, -90]], [[-122, -90], [-94, -84], [-100, 6]], [[-122, -90], [-100, 6], [-122, 2]], [[-122, 2], [-100, 6], [-112, 50]],
        [[97, -194], [126, -184], [140, -92]], [[97, -194], [140, -92], [113, -88]], [[113, -88], [140, -92], [154, -4]], [[113, -88], [154, -4], [130, 0]], [[130, 0], [154, -4], [154, 46]],
        [[-70, 74], [-10, 84], [-20, 182]], [[-70, 74], [-20, 182], [-58, 180]], [[-58, 180], [-20, 182], [-28, 286]], [[-58, 180], [-28, 286], [-52, 286]], [[-52, 288], [-26, 288], [-66, 304]],
        [[2, 84], [72, 70], [56, 178]], [[2, 84], [56, 178], [18, 184]], [[18, 184], [56, 178], [50, 282]], [[18, 184], [50, 282], [26, 286]], [[24, 290], [52, 286], [64, 304]],
      ].map(t => [t, 'grey']),
    ];
    const look = { chest: [pal.hi, pal.c, pal.a], pelvis: [pal.c, pal.hi, pal.a], abd: [pal.miss, pal.miss, pal.miss], grey: [pal.grey, pal.grey, pal.grey] };
    const alpha = { chest: [1, 0.9, 0.85], pelvis: [0.9, 1, 0.85], abd: [0.55, 0.42, 0.65], grey: [0.95, 0.75, 0.85] };
    const dx = -110;
    const polys = shards.map(([t, kind], i) => P(inset(t).map(([x, y]) => [x + dx, y]), look[kind][i % 3], alpha[kind][i % 3]));
    return {
      polys,
      deco: g => {
        el('rect', { x: dx - 76, y: -112, width: 156, height: 110, rx: 12, fill: 'none', stroke: pal.dec, 'stroke-width': 3, 'stroke-dasharray': '8 6', class: 'pulse' }, g);
        [[-148, 'mesh.chest', pal.hi, 90], [-52, 'mesh.abdomen', pal.miss, 86], [30, 'mesh.pelvis', pal.hi, 76]].forEach(([y, k, f, x0]) => {
          el('line', { x1: dx + x0, y1: y - 6, x2: dx + 168, y2: y - 6, stroke: pal.line, 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }, g);
          T(g, dx + 178, y, tr(k), { fill: f, 'font-size': 19 });
        });
      },
    };
  }

  // Tile map of Czechia with hospital cities (illustration).
  const CITY = [[tr('mesh.prague'), 3.5, 2.3], ['Plzeň', 1.5, 2.8], ['Brno', 6.6, 3.9], ['Olomouc', 7.8, 2.6], ['Ostrava', 9.0, 1.6], ['Č. Budějovice', 3.9, 4.6], ['Hradec Králové', 5.4, 1.6]];
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
          T(g, x, y + (i === 0 || i === 6 ? -30 : 40), n, { 'text-anchor': 'middle', fill: '#FFFFFF', 'font-size': i === 0 ? 19 : 16, stroke: '#072B29', 'stroke-width': 5, 'paint-order': 'stroke' });
        });
        T(g, -310, -240, tr('mesh.one_stack'), { fill: pal.ink, 'font-size': 26 });
        T(g, -310, 250, tr('mesh.on_prem'), { fill: pal.sub, 'font-size': 18, 'font-weight': 700 });
        T(g, -310, 280, tr('mesh.rollout_note'), { fill: pal.sub, 'font-size': 15, 'font-weight': 600 });
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
        T(g, -320, -184, tr('mesh.hours_today'), { fill: pal.ink, 'font-size': 21 });
        T(g, -320, -54, tr('mesh.hours_with'), { fill: pal.a, 'font-size': 21 });
        T(g, -180, -2, tr('mesh.hours_note'), { fill: pal.sub, 'font-size': 16, 'font-weight': 700 });
        T(g, -320, 96, tr('mesh.scans_found'), { fill: pal.ink, 'font-size': 21 });
      },
    };
  }

  // Roadmap: Motol pilot -> Homolka -> insurer data -> EHDS 2031 (not ours).
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
        [['mesh.roadmap_motol', 'mesh.roadmap_motol_sub'], ['mesh.roadmap_homolka', 'mesh.roadmap_homolka_sub'], ['mesh.roadmap_insurer', 'mesh.roadmap_insurer_sub'], ['mesh.roadmap_ehds', 'mesh.roadmap_ehds_sub']].forEach(([k, sub], i) => {
          const [x, y] = M[i];
          T(g, x, y + 62, tr(k), { 'text-anchor': 'middle', fill: i === 3 ? pal.sub : pal.ink, 'font-size': 19 });
          T(g, x, y + 86, tr(sub), { 'text-anchor': 'middle', fill: pal.sub, 'font-size': 15, 'font-weight': 700 });
        });
      },
    };
  }

  return { PAL, timeline, body, czmap, hours, roadmap };
})();
