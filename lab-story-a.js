// Story A: compass shatters into scattered scans, scans sort into source lanes, merge into one timeline, missing scan found.
const LANES = { nis: -190, rep: -20, ins: 150 };
const LANE_X0 = -255, LANE_DX = 112;
const TL_Y = -110, tlX = i => -340 + i * 104, PLAN_X = 375;

const laneLabels = Object.entries({ nis: ['NIS', 'NIS'], rep: ['Zprávy (AI)', 'Reports (AI)'], ins: ['Pojišťovna', 'Insurer'] }).map(([k, [cs, en]]) => {
  const t = svgEl('text', { x: -395, y: LANES[k] + 5, 'font-size': 14, 'font-weight': 800, fill: '#7FE0C9', opacity: 0, 'font-family': FONT, 'letter-spacing': '0.04em' }, cardsG);
  t.innerHTML = bi(cs.toUpperCase(), en.toUpperCase());
  return t;
});
const laneIndex = {};
cards.forEach(c => { laneIndex[c.lane] = (laneIndex[c.lane] || 0); c.li = laneIndex[c.lane]++; });

const axis = svgEl('line', { x1: -380, y1: TL_Y, x2: 395, y2: TL_Y, stroke: '#7FE0C9', 'stroke-opacity': 0.6, 'stroke-width': 3, 'stroke-linecap': 'round' }, compassSvg);
compassSvg.insertBefore(axis, cardsG);
gsap.set(axis, { strokeDasharray: 775, strokeDashoffset: 775 });

const plan = svgEl('g', { transform: T(PLAN_X, TL_Y), opacity: 0 }, compassSvg);
svgEl('path', { d: 'M0 -13 L13 0 L0 13 L-13 0Z', fill: '#FFFFFF' }, plan);
const planT = svgEl('text', { x: 0, y: -26, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#FFFFFF', 'font-family': FONT }, plan);
planT.innerHTML = bi('plán', 'planned');

const ping = svgEl('circle', { r: 11, fill: 'none', stroke: '#7FE0C9', 'stroke-width': 2, opacity: 0 }, missCard.g);
const mi = relCards.indexOf(missCard);
const connector = svgEl('path', { d: `M${tlX(mi)} ${TL_Y + 16} V ${TL_Y + 88}`, stroke: '#7FE0C9', 'stroke-width': 2, 'stroke-dasharray': '4 4', fill: 'none', opacity: 0 }, compassSvg);
const verdict = makeVerdict(-200, TL_Y + 90);

const captionEl = document.getElementById('caption');

document.fonts.ready.then(() => {
  if (!desktopStory) return;
  holdCompassOnStory();

  // 1 Problem: compass shatters, scans scatter.
  stepTimeline(1, tl => {
    shards.forEach(el => {
      const b = el.getBBox(), cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      tl.to(el, { x: cx * 0.9, y: cy * 0.9, rotation: gsap.utils.random(-90, 90), opacity: 0.07, transformOrigin: '50% 50%', duration: 0.6, ease: 'power3.out' }, 0.05);
    });
    showCards(tl, 0.3);
  });

  // 2 Solution: lanes, filter, timeline.
  stepTimeline(2, tl => {
    cards.forEach(c => tl.to(c.outer, { attr: { transform: T(LANE_X0 + c.li * LANE_DX, LANES[c.lane], 0, 0.95) }, duration: 0.35 }, 0.02 * c.li));
    irrelCards.forEach(c => tl.to(c.g, { opacity: 0, scale: 0.5, duration: 0.15 }, 0.45));
    tl.to(laneLabels, { opacity: 1, duration: 0.15 }, 0.15)
      .to(laneLabels, { opacity: 0, duration: 0.12 }, 0.55)
      .to(axis, { strokeDashoffset: 0, duration: 0.3 }, 0.55);
    relCards.forEach((c, i) => {
      tl.to(c.outer, { attr: { transform: T(tlX(i), TL_Y, 0, 1) }, duration: 0.35 }, 0.55 + i * 0.015)
          .to(c.rect, { attr: { x: -13, y: -13, width: 26, height: 26, rx: 13 }, fill: c.miss ? 'rgba(7,43,41,1)' : '#7FE0C9', duration: 0.2 }, 0.7)
        .to(c.t1, { attr: { y: -26, 'font-size': 17 }, duration: 0.2 }, 0.7)
        .to(c.t3, { opacity: 0, duration: 0.1 }, 0.7)
        .to(c.t2, { attr: { y: 40, 'font-size': 14 }, duration: 0.2 }, 0.7);
    });
    tl.to(plan, { opacity: 1, duration: 0.1 }, 0.85);
  }, { end: 'top -40%' });

  // 3 AI: the missing scan is found, verdict card opens.
  stepTimeline(3, tl => {
    tl.to(missCard.rect, { attr: { 'stroke-opacity': 0 }, duration: 0.1 }, 0)
      .to(missCard.found, { opacity: 1, duration: 0.1 }, 0)
      .to(missCard.t1, { fill: '#7FE0C9', duration: 0.1 }, 0)
      .fromTo(ping, { attr: { r: 11 }, opacity: 0.9 }, { attr: { r: 70 }, opacity: 0, duration: 0.3, ease: 'power1.out' }, 0)
      .to(connector, { opacity: 1, duration: 0.1 }, 0.25)
      .to(verdict, { opacity: 1, attr: { transform: verdict.getAttribute('transform').replace('scale(0.9)', 'scale(1)') }, duration: 0.3, ease: 'back.out(1.6)' }, 0.3);
  });

  if (window.LAB_DIVE) {
    addDive(() => {
      const p = compassSvg.createSVGPoint();
      p.x = tlX(mi); p.y = TL_Y;
      const s = p.matrixTransform(compassSvg.getScreenCTM());
      return `${s.x}px ${s.y - (document.querySelector('.story-stage .stage').getBoundingClientRect().top)}px`;
    });
  }
});
