// Variant A: scattered scans collect into one patient timeline. LAB_DIVE adds C: dive into the found scan.
gsap.registerPlugin(ScrollTrigger);

const AXIS_Y = 500, AXIS_X0 = 160, AXIS_X1 = 1290;
const rel = scans.filter(s => s.rel);
const irrel = scans.filter(s => !s.rel);
const miss = scans.find(s => s.miss);
const slotX = i => 230 + i * 150;
const PLAN_X = 1240;

const axis = svgEl('line', { x1: AXIS_X0, y1: AXIS_Y, x2: AXIS_X1, y2: AXIS_Y, stroke: '#7FE0C9', 'stroke-opacity': 0.55, 'stroke-width': 3, 'stroke-linecap': 'round' }, backG);
backG.insertBefore(axis, backG.firstChild);
const axisLen = AXIS_X1 - AXIS_X0;
gsap.set(axis, { strokeDasharray: axisLen, strokeDashoffset: axisLen });

const plan = svgEl('g', { transform: `translate(${PLAN_X} ${AXIS_Y})`, opacity: 0 }, backG);
svgEl('path', { d: 'M0 -14 L14 0 L0 14 L-14 0Z', fill: '#FFFFFF' }, plan);
svgEl('line', { x1: 0, y1: -60, x2: 0, y2: 60, stroke: '#FFFFFF', 'stroke-opacity': 0.5, 'stroke-dasharray': '4 4' }, plan);
const planLabel = svgEl('text', { x: 0, y: -72, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: '#FFFFFF', 'font-family': 'Plus Jakarta Sans, sans-serif' }, plan);
planLabel.innerHTML = '<tspan data-l="cs">plánované CT</tspan><tspan data-l="en">planned CT</tspan>';

const foundLabel = svgEl('text', { x: 0, y: 50, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#7FE0C9', opacity: 0, 'font-family': 'Plus Jakarta Sans, sans-serif' }, miss.g);
foundLabel.innerHTML = '<tspan data-l="cs">nalezeno ✓</tspan><tspan data-l="en">found ✓</tspan>';
const ping = svgEl('circle', { r: 11, fill: 'none', stroke: '#7FE0C9', 'stroke-width': 2, opacity: 0 }, miss.g);

const stage = document.getElementById('stage');
const desktop = matchMedia('(min-width: 761px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;

document.fonts.ready.then(() => {
  if (!desktop) return;
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  const heroH = () => hero.offsetHeight;

  tl.to([fxBack, fxTop], { y: () => heroH() * 0.6, ease: 'none', duration: 1.5 }, 0)
    .to(stage, { opacity: 0.12, scale: 0.86, duration: 0.35 }, 0)
    .to(irrel.map(s => s.outer), { opacity: 0, scale: 0.5, transformOrigin: '50% 50%', duration: 0.25, stagger: 0.01 }, 0)
    .to(rel.map(s => s.g), { y: 0, rotation: 0, duration: 0.1 }, 0)
    .to(axis, { strokeDashoffset: 0, duration: 0.3 }, 0.12);

  rel.forEach((s, i) => {
    tl.to(s.outer, { attr: { transform: `translate(${slotX(i)} ${AXIS_Y}) rotate(0)` }, duration: 0.32 }, 0.04 + i * 0.015)
      .to(s.rect, { attr: { x: -11, y: -11, width: 22, height: 22, rx: 11, 'stroke-opacity': 1 }, fill: s.miss ? 'rgba(255,122,107,0)' : '#7FE0C9', duration: 0.18 }, 0.2)
      .to(s.t1, { attr: { y: -24, 'font-size': 14, 'fill-opacity': 1 }, duration: 0.18 }, 0.2)
      .to(s.t2, { attr: { y: 34, 'font-size': 11 }, duration: 0.18 }, 0.2);
  });

  tl.to(plan, { opacity: 1, duration: 0.08 }, 0.36)
    .to(miss.rect, { attr: { 'stroke-opacity': 0 }, duration: 0.06 }, 0.45)
    .to(miss.found, { opacity: 1, duration: 0.06 }, 0.45)
    .to(miss.t1, { fill: '#7FE0C9', duration: 0.06 }, 0.45)
    .to(miss.t2, { opacity: 0, duration: 0.04 }, 0.45)
    .to(foundLabel, { opacity: 1, duration: 0.06 }, 0.47)
    .fromTo(ping, { attr: { r: 11 }, opacity: 0.9 }, { attr: { r: 60 }, opacity: 0, duration: 0.12, ease: 'power1.out' }, 0.45);

  if (window.LAB_DIVE) {
    const mx = slotX(rel.indexOf(miss)), k = 9;
    backG.setAttribute('transform', 'translate(0 0) scale(1)');
    tl.to(backG, { attr: { transform: `translate(${mx * (1 - k)} ${AXIS_Y * (1 - k)}) scale(${k})` }, duration: 0.35, ease: 'power2.in' }, 0.55)
      .to(miss.found, { attr: { r: 160 }, duration: 0.3, ease: 'power2.in' }, 0.6)
      .to(fxBack, { opacity: 0, duration: 0.12 }, 0.8);
  }

  tl.to({}, { duration: 0.0001 }, 1.5);

  labHeroTrigger(tl, {
    onUpdate: self => {
      const active = self.progress > 0.01;
      setDrift(!active);
      holdSearch = active;
    },
  });
});
