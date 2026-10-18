// M1 "Cesta pacienta": status colours only (teal = available, red = missing).
window.MESH_SCENES = {
  compass: () => null,
  scatter: MS.scatter,
  lanes: pal => MS.lanes(pal, { nis: pal.a, rep: pal.hi, ins: pal.c }),
  verdict: MS.verdict,
  envelope: MS.envelope,
  shield: MS.shield,
  timeline: MS.timeline,
  body: MS.body,
  dose: MS.dose,
  czmap: MS.czmap,
  roadmap: MS.roadmap,
};
