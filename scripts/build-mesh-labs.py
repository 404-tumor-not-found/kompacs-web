#!/usr/bin/env python3
# Builds lab-m1/m2/m3.html from index.html content (index.html stays the source of truth).
# Run: python3 scripts/build-mesh-labs.py
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "index.html").read_text().split("\n")


def L(a, b=None):
    return "\n".join(SRC[a - 1:(b or a)])


assert 'class="hero-copy"' in L(48) and 'id="stage"' in L(70) and 'class="team"' in L(379)

HEAD = L(1, 20).replace("<title>KOMPACS · KOMparátor PACS</title>", "<title>KOMPACS lab {name}</title>").replace(
    '<link rel="stylesheet" href="style.css">', '<link rel="stylesheet" href="style.css">\n<link rel="stylesheet" href="lab-mesh.css">')
TOP = L(21, 45)
STAGE = L(70, 97).replace('viewBox="-330 -330 660 660"', 'viewBox="-400 -400 800 800"')
HERO = f'<section class="hero" aria-label="KOMPACS">\n  <div class="wrap">\n{L(48, 68)}\n    <div class="slot">\n{STAGE}\n    </div>\n  </div>\n{L(99, 100)}'
SHOWCASE = L(102, 109)

PROB = f'<div class="reveal">\n{L(115, 121)}\n</div>\n<div class="reveal" style="margin-top:34px">\n{L(124, 125)}\n</div>'
Q_DARK = L(129, 133)
RES_HEAD, FIT, FLOW = L(140, 141), L(142, 143), L(145, 158)
FEAT_COPY, FEAT_IMG, Q_INS, NOTE_VZP = L(161, 165), L(166), L(169, 173), L(174, 177)
JIN_HEAD, COMPARE = L(184, 185), L(186, 210)
BEZ_HEAD, Q_GDPR, MAIL, SEC_CARDS, BADGES = L(217, 218), L(221, 225), L(226, 234), L(237, 256), L(257, 259)
BUILT_HEAD, BUILT, SIM = L(266, 267), L(268, 275), L(276)
LEK_KICK, LEK_H2 = L(283), L(284)
TL_FULL, TL_TEXT, MAP_FULL, MAP_TEXT = L(287, 309), L(306, 308), L(310, 329), L(326, 328)
SKALA_HEAD, SKALA_CARDS = L(337, 338), L(339, 343)
DOP_HEAD, STATS = L(350, 351), L(352, 357)
NEXT_HEAD, ROADMAP = L(364, 365), L(366, 370)
TEAM, CLOSING, FOOTER = L(375, 386), L(388, 396), L(400, 405)


def sec(inner, id_=None, cls=None):
    a = (f' id="{id_}"' if id_ else "") + (f' class="{cls}"' if cls else "")
    return f"<section{a}>\n  <div class=\"wrap\">\n{inner}\n  </div>\n</section>"


def split(scene, *txt, rev=False):
    return f'<div class="split{" rev" if rev else ""}" data-scene="{scene}">\n<div class="txt">\n' + "\n".join(txt) + '\n</div>\n<div class="slot"></div>\n</div>'


def split3(scene, left, right):
    return f'<div class="split3" data-scene="{scene}">\n<div class="txt">\n{left}\n</div>\n<div class="slot"></div>\n<div class="txt">\n{right}\n</div>\n</div>'


def rest(*inner):
    return '<div class="rest-block" data-scene="compass" data-place="rest">\n' + "\n".join(inner) + "\n</div>"


def bg(scene, *inner, op=0.2):
    return f'<div class="bg-block" data-scene="{scene}" data-place="bg" data-op="{op}">\n' + "\n".join(inner) + '\n<div class="slot pic-only"></div>\n</div>'


TEAM_REST = TEAM.replace('<div class="wrap">', '<div class="wrap" data-scene="compass" data-place="rest">', 1)
CLOSING_BG = CLOSING.replace('<div class="wrap">', '<div class="wrap" data-scene="compass" data-place="bg" data-op="0.22">', 1)


def page(name, script, sections):
    body = "\n\n".join([HERO, SHOWCASE, *sections, TEAM_REST, CLOSING_BG])
    return "\n".join([
        HEAD.format(name=name), TOP, body, "\n</main>\n", FOOTER, "",
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>',
        '<script src="lab-mesh-shapes.js"></script>', f'<script src="{script}"></script>',
        '<script src="main.js"></script>', '<script src="lab-mesh.js"></script>', "</body>", "</html>", ""])


# M1: patient journey. Sticky column that switches sides.
m1 = [
    sec(split("scatter", PROB, Q_DARK, rev=True), "problem"),
    sec(split("lanes", RES_HEAD, FIT, FLOW) + "\n" + split("verdict", FEAT_COPY, Q_INS, NOTE_VZP, rev=True), "reseni", "alt"),
    sec(rest(JIN_HEAD, COMPARE), "jinak"),
    sec(split("envelope", BEZ_HEAD, Q_GDPR, MAIL) + "\n" + split("shield", SEC_CARDS, BADGES, rev=True), "bezpecnost", "dark"),
    sec(rest(BUILT_HEAD, BUILT, SIM), "postaveno", "alt"),
    sec(split("timeline", LEK_KICK, LEK_H2, TL_TEXT) + "\n" + split("body", MAP_TEXT, rev=True), "lekari"),
    sec(split("dose", DOP_HEAD, STATS), "dopady"),
    sec(split("czmap", SKALA_HEAD, SKALA_CARDS, rev=True), "skala", "alt"),
    sec(split("roadmap", NEXT_HEAD, ROADMAP), None, "dark"),
]

# M2: data first. Honest charts, colour = data source.
m2 = [
    sec(split("waffle", PROB, Q_DARK), "problem"),
    sec(split3("lanes", RES_HEAD + "\n" + FIT, FLOW) + "\n" + split("verdict", FEAT_COPY, FEAT_IMG, Q_INS, NOTE_VZP, rev=True), "reseni", "alt"),
    sec(split3("funnel", JIN_HEAD, '<p class="sub reveal"><span data-l="cs">Dotaz do NIS a PACS najde 0 z 34 chybějících. AI čte text zpráv a najde všech 34.</span><span data-l="en">A NIS and PACS query finds 0 of 34 missing priors. AI reads report text and finds all 34.</span></p>') + "\n" + rest(COMPARE), "jinak"),
    sec(split("envelope", BEZ_HEAD, Q_GDPR, MAIL, rev=True) + "\n" + split("shield", SEC_CARDS, BADGES), "bezpecnost", "dark"),
    sec(rest(BUILT_HEAD, BUILT, SIM), "postaveno", "alt"),
    sec(split("timeline", LEK_KICK, LEK_H2, TL_TEXT, MAP_FULL), "lekari"),
    sec(split3("hours", DOP_HEAD, STATS), "dopady"),
    sec(split("czmap", SKALA_HEAD, SKALA_CARDS, rev=True), "skala", "alt"),
    sec(split("roadmap", NEXT_HEAD, ROADMAP), None, "dark"),
]

# M3: safe and at scale. Pipeline centre band, risk turns red, map behind the scale section.
m3 = [
    sec(split("scatter", PROB, Q_DARK, rev=True), "problem"),
    sec(split3("pipeline", RES_HEAD + "\n" + FIT, FLOW) + "\n" + split("verdict", FEAT_COPY, Q_INS, NOTE_VZP), "reseni", "alt"),
    sec(rest(JIN_HEAD, COMPARE), "jinak"),
    sec(split("phone", BEZ_HEAD, Q_GDPR, rev=True) + "\n" + split("envelope", MAIL) + "\n" + split("shield", SEC_CARDS, BADGES, rev=True), "bezpecnost", "dark"),
    sec(rest(BUILT_HEAD, BUILT, SIM), "postaveno", "alt"),
    sec(split("timeline", LEK_KICK, LEK_H2, TL_TEXT) + "\n" + split("body", MAP_TEXT, rev=True), "lekari"),
    sec(bg("czmap", SKALA_HEAD, SKALA_CARDS, op=0.14), "skala", "alt"),
    sec(split3("dose", DOP_HEAD, STATS), "dopady"),
    sec(split("roadmap", NEXT_HEAD, ROADMAP), None, "dark"),
]

for n, s in [("m1", m1), ("m2", m2), ("m3", m3)]:
    (ROOT / f"lab-{n}.html").write_text(page(n.upper(), f"lab-{n}.js", s))
    print(f"lab-{n}.html")
