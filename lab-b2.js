// B_2 block 2: the same pieces become the 40-case grid, the funnel, a map of Czechia, and the duplicate-scan dose.
(() => {
  const svg = document.getElementById('viz2');
  const vsteps = [...document.querySelectorAll('.vstep')];
  const N = 40;
  const { polys } = makeShards(svg, N, 300, 300);
  const OK = '#0F6B66', MISS = '#C9372C';

  // 1 Waffle 8 x 5.
  const missSet = new Set([0, 2, 3, 5, 7, 8, 11, 12, 14, 16, 17, 19, 21, 22, 24, 26, 27, 30, 31, 33, 35, 36, 38, 39]);
  const waffle = [...Array(N)].map((_, i) => shRect(44 + (i % 8) * 64, 150 + Math.floor(i / 8) * 64, 56, 56));
  const wLabel = shText(svg, 44, 128, '24 ze 40 případů: chybí snímek', '24 of 40 cases: scan missing', { fill: MISS, 'font-size': 18 });

  // 2 Funnel 286 -> 127 -> 34, one piece = ~14 exams.
  const funnel = [];
  const fFill = [];
  const rowY = [180, 300, 420];
  for (let i = 0; i < 20; i++) { funnel.push(shRect(40 + i * 26, rowY[0], 23, 46)); fFill.push(i < 14 ? '#2B5BB8' : i < 19 ? '#00957F' : '#B4441C'); }
  for (let i = 0; i < 9; i++) { funnel.push(shRect(40 + i * 26, rowY[1], 23, 46)); fFill.push(OK); }
  for (let i = 0; i < 3; i++) { funnel.push(shRect(40 + i * 26, rowY[2], 23, 46)); fFill.push(MISS); }
  const fLabels = [
    shText(svg, 40, rowY[0] - 12, 'Kandidáti · 286', 'Candidates · 286'),
    shText(svg, 40, rowY[1] - 12, 'Relevantní · 127', 'Relevant · 127'),
    shText(svg, 40, rowY[2] - 12, 'Chybí v PACS · 34', 'Missing in PACS · 34', { fill: MISS }),
    shText(svg, 40, 520, 'NIS 198 · zprávy 74 · pojišťovna 14', 'NIS 198 · reports 74 · insurer 14', { 'font-size': 13, 'font-weight': 600, fill: '#5C6E74' }),
  ];

  // 3 Tile map of Czechia, 10 x 6.
  const mask = ['..XXX.....', '.XXXXXX.XX', 'XXXXXXXXXX', '.XXXXXXXX.', '..XXXXXX..', '...XX..XX.'];
  const map = [];
  mask.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'X') map.push(shRect(50 + c * 50, 170 + r * 50, 46, 46)); }));
  const cities = [['Praha', 3.5, 2.3, 4], ['Plzeň', 1.5, 2.8, 1], ['Brno', 6.6, 3.9, 2], ['Olomouc', 7.8, 2.6, 1], ['Ostrava', 9.0, 1.6, 1], ['Č. Budějovice', 3.9, 4.6, 1]];
  const hub = [300, 92];
  const mapG = shEl('g', {}, svg);
  mapG.style.opacity = 0;
  shEl('rect', { x: hub[0] - 120, y: hub[1] - 24, width: 240, height: 40, rx: 20, fill: '#14232A' }, mapG);
  const hubT = shEl('text', { x: hub[0], y: hub[1] + 2, 'text-anchor': 'middle', 'font-family': shFont, 'font-weight': 800, 'font-size': 14, fill: '#7FE0C9' }, mapG);
  hubT.innerHTML = shBi('KOMPACS + data pojišťovny', 'KOMPACS + insurer data');
  const cityEls = cities.map(([name, c, r, n]) => {
    const x = 50 + c * 50, y = 170 + r * 50;
    const line = shEl('line', { x1: x, y1: y, x2: hub[0], y2: hub[1] + 16, stroke: '#14232A', 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: 0.5 }, mapG);
    shEl('circle', { cx: x, cy: y, r: 7 + n * 2, fill: '#FFFFFF', stroke: '#14232A', 'stroke-width': 2.5 }, mapG);
    const t = shEl('text', { x, y: y + 30, 'text-anchor': 'middle', 'font-family': shFont, 'font-weight': 800, 'font-size': 14, fill: '#FFFFFF', stroke: '#072B29', 'stroke-width': 4, 'paint-order': 'stroke' }, mapG);
    t.textContent = name;
    return line;
  });

  // 4 Dose: a needed CT and a duplicate within 6 weeks that the alert prevents.
  const dose = [];
  for (let i = 0; i < 20; i++) dose.push(shRect(130 + (i % 4) * 34, 470 - Math.floor(i / 4) * 34, 30, 30));
  for (let i = 0; i < 20; i++) dose.push(shRect(350 + (i % 4) * 34, 470 - Math.floor(i / 4) * 34, 30, 30));
  const dLabels = [
    shText(svg, 130, 540, 'Plánované CT', 'Planned CT'),
    shText(svg, 350, 540, 'Duplicita do 6 týdnů', 'Duplicate within 6 weeks', { fill: MISS }),
    shText(svg, 300, 300, 'upozornění → odpadá', 'alert → avoided', { fill: MISS, 'text-anchor': 'middle', 'font-size': 15 }),
  ];
  const strike = shEl('line', { x1: 330, y1: 330, x2: 510, y2: 510, stroke: MISS, 'stroke-width': 5, 'stroke-linecap': 'round' }, svg);
  strike.style.opacity = 0;

  const show = (tl, els, at) => tl.to(els, { opacity: 1, duration: 0.15 }, at);
  const hide = (tl, els, at) => tl.to(els, { opacity: 0, duration: 0.1 }, at);

  if (!shMotion()) {
    // Static: the map is the most useful single picture on a phone.
    polys.forEach((p, i) => { p.setAttribute('points', shPts(map[i] || shDot(300, 300))); p.style.opacity = map[i] ? 1 : 0; p.setAttribute('fill', i % 3 ? '#13716B' : '#0F6B66'); });
    mapG.style.opacity = 1;
    return;
  }

  scrubSteps(vsteps, [
    tl => { morphTo(tl, polys, waffle, 0, { fill: i => (missSet.has(i) ? MISS : OK), opacity: i => (missSet.has(i) ? 0.85 : 1) }); show(tl, wLabel, 0.6); },
    tl => { hide(tl, wLabel, 0.02); morphTo(tl, polys, funnel, 0.05, { fill: i => fFill[i] || OK, collapse: [520, 470] }); show(tl, fLabels, 0.6); },
    tl => { hide(tl, fLabels, 0.02); morphTo(tl, polys, map, 0.05, { fill: i => (i % 3 ? '#13716B' : i % 2 ? '#2B8F86' : '#0F6B66') }); show(tl, mapG, 0.6); },
    tl => {
      hide(tl, mapG, 0.02);
      morphTo(tl, polys, dose, 0.05, { fill: i => (i < 20 ? OK : MISS), opacity: i => (i < 20 ? 1 : 0.8) });
      show(tl, dLabels.slice(0, 2), 0.6);
      tl.to(polys.slice(20), { opacity: 0.15, duration: 0.2 }, 0.8);
      show(tl, [strike, dLabels[2]], 0.85);
    },
  ]);
})();
