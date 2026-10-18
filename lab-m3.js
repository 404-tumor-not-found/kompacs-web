// M3 "Bezpečně a ve velkém": one mint mesh. Only risk turns red.
const mono = f => pal => f({ ...pal, a: pal.a, b: pal.a, c: pal.hi, dec: pal.hi });
window.MESH_SCENES = {
  compass: () => null,
  scatter: mono(MS.scatter),
  pipeline: mono(MS.pipeline),
  verdict: MS.verdict,
  phone: MS.phone,
  envelope: mono(MS.envelope),
  shield: mono(MS.shield),
  timeline: mono(MS.timeline),
  body: mono(MS.body),
  czmap: mono(MS.czmap),
  dose: mono(MS.dose),
  roadmap: mono(MS.roadmap),
};
