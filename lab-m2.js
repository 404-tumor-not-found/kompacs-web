// M2 "Data, ne dojmy": every piece keeps the colour of its data source (NIS, reports, insurer).
window.MESH_SCENES = {
  compass: () => null,
  waffle: MS.waffle,
  lanes: pal => MS.lanes(pal, MS.SRC),
  verdict: MS.verdict,
  funnel: pal => MS.funnel(pal, MS.SRC),
  envelope: MS.envelope,
  shield: MS.shield,
  timeline: MS.timeline,
  hours: MS.hours,
  czmap: MS.czmap,
  roadmap: MS.roadmap,
};
