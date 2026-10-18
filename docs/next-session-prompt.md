normal mode

# Task: 3 scroll-driven "living mesh" variants of the KOMPACS landing page

Repo: /Users/bestak/Projects/rakathon/landing-page (GitHub 404-tumor-not-found/kompacs-web, branch feat/motion-labs).
Static HTML/CSS/JS, GSAP 3.12.5 + ScrollTrigger from cdnjs, no build. Local server: `python3 -m http.server 8765`.
Deadline: the pitch is today (Sun 2026-10-18) at 14:00. Ship working variants fast, then polish.

Use skills: frontend-design:frontend-design (visual direction), dataviz (any chart-like shape; run its validate_palette.js), claude-in-chrome (verify every variant with screenshots at several scroll positions).

## Read first
- index.html, style.css, main.js: the current live page (content source of truth) and the hero compass. The compass is 61 SVG polygons (`shards` in main.js: 24 triangles, 36 quads, 1 hexagon), plus needle and orbit dots. Globals: shards, nd, ringSpin, holdSearch, needle, priorsG, beam.
- lab-b2.html + lab-story.js + lab-story-b.js + lab-b2.js + lab-shards.js + lab-story.css: the variant the user LIKES (B_2). Copy its techniques: morphing polygon `points` with GSAP attr tweens, scrubbed by ScrollTrigger, compass → low-poly patient body → scans land on body regions → AI verdict card; second block: grid of 40 cases → funnel 286→127→34 → tile map of Czechia → duplicate-CT dose.
- lab-d.html, lab-e.html: variants the user REJECTED (mostly static; E's split screen freezes content while scrolling).
- ../rakathon/docs/prehled-funkci.cs.md, ../rakathon/docs/pitch.md, ../rakathon/docs/judging.md, ../rakathon/docs/challenge.md: product facts, numbers, judging criteria.

## What the user wants
3 NEW variants, all similar in spirit to B_2, files lab-m1.html, lab-m2.html, lab-m3.html (+ their JS/CSS). Do not edit index.html.
Core idea: ONE triangle mesh (the original compass shards) travels through the WHOLE page where it makes sense, changing shape, color and meaning at each section. It must catch attention and be memorable, but never distract from the information.
- The mesh lives in a fixed full-viewport layer (or a sticky column that may switch sides between sections). It may move left/right/center, scale, split, recolor between sections. Mix layouts: graphic left, right, full-width behind a section, so the page is not monotonous.
- Every section with a message gets a shape that ADDS meaning (no decorative or nonsense shapes). Team, contact, footer: the mesh may rest (e.g. back to a small compass / logo).
- Scroll must always feel like normal scrolling: content visibly moves with the wheel. FORBIDDEN: pinned sections where content freezes while the user scrolls (the user hated this). A fixed/sticky graphic beside or behind moving content is fine.
- Animations are scrubbed to scroll (scrub: true, so jumping via nav links stays consistent). Nobody ever waits for an animation.
- Phones (< 960px) and prefers-reduced-motion: no scroll animation; show each section's final shape as a static picture. No horizontal overflow at 390px.
- Keep ALL current information (do not remove content). You may reorder sections and add a section if it allows a strong visualization.

Shape ideas to choose from (pick what serves each variant): compass (hero) → shattered scattered scans (problem) → source lanes NIS/reports/insurer → one patient timeline → patient body with red flag on the missing region → found scan fills it → AI verdict card with guideline citation → envelope (e-mail, not AI phone calls) → shield/lock (EU Data Zone, human decides) → IRIS pipeline HL7 v2 → FHIR R4 → 40-case grid (24 missing) → funnel 286→127→34 → tile map of Czechia with hospitals (scale) → duplicate-CT avoided (less radiation, label as illustration) → roadmap (Motol pilot → Homolka → VZP data 2028) → logo.
Make the 3 variants clearly different (different shape sequences, layouts, color logic), and say in one line per variant who on the jury it targets.

## Content rules (do not break)
- Product name KOMPACS, "KOMparátor PACS". Tagline: "Žádné vyšetření bez srovnání." CZ default + EN switcher (data-l="cs"/"en" spans).
- Adam Karas (medic) quotes must stay highlighted: radiologists love darkness and complete data ("Bohužel, dnešní zdravotnictví jim většinou dopřeje jen tu tmu."), the insurer never forgets, the AI calling the porter vs GDPR. Closing: "Kompaktní data, abyste vy mohli v klidu léčit."
- Numbers (40 demo cases): 286 candidates (NIS 198, reports 74, insurer 14), 127 relevant, 34 missing in PACS in 24 of 40 cases (60 %), all 34 named only in report text. 1 duplicate alert. Estimates labelled "odhad": 10 h → 2 h, ~68 calls.
- Insurer data: simulated in the prototype; VZP connection target 1. 1. 2028 (consulted with a VZP representative). EHDS image exchange only from 2031. Never claim a live VZP API.
- "Prototyp, není zdravotnický prostředek." Never invent data (radiation dose visuals must say "ilustrace").
- Screenshots assets/app-case.jpg, assets/app-verdict.jpg may be used (they show real report sentences; prefer mocks if time allows).
- Team: Vojtěch Bešťák (ML/data, frontend), Adam Karas (medik, product owner), Pavel Kos (product), Vojtěch Novotný (backend), with e-mails as in index.html.

## Jury (design for them)
Clinicians (oncologists Cvek, Pirshtuk, Študentová; pneumologist Čierná Peterová; Komárek FN Motol/Homolka), VZP (Hlavinka; statistician Rybář: charts must be honest), InterSystems (Zubek), HL7/Asseco (Bušek), NCeZ (Foltýn), MZ (Foldyna Hellová), AI commissioner (Kačena), patient representative (Adámková: less radiation, patient benefit), digital medicine (Zápotocký, J. Šedo), research (A. Šedo), MEDDI Hub (Pecina), 2. LF UK (Keil).
Judging: 1 AI + execution, 2 usability (security, data, regulation, integration), 3 innovation, 4 scalability, 5 presentation + team. Jury opens the page on laptops during/after the pitch. Every team has a nice vibecoded UI, so the IDEA and memorability win.

## Technical notes from the previous session (avoid these bugs)
- Do not redeclare globals from main.js (e.g. `caption` is a function there).
- After the intro, shards carry inline CSS opacity: tween CSS `opacity`, not `attr: { opacity }`.
- A tween at time 0 inside a scrubbed timeline renders at progress 0 and can override other timelines: start hide/show tweens at > 0.
- Do not use svgOrigin on nested groups (it uses root SVG coordinates); use attr transform strings or transformOrigin.
- `.wordmark span` needs flex-shrink: 0 (the "C" clipped otherwise).
- ringSpin rotates the outer ring group; kill it and set nd.ring = 0 before morphing ring quads into other shapes.
- Phone check: Chrome window resize may not apply; use an iframe harness (390px wide), e.g. a local _m.html with iframes (git-excluded).
- Deploy runs only on a pushed `v*` tag (.github/workflows/pages.yml). Do not tag; the user decides what goes live.

## Done when
For each of lab-m1/m2/m3: screenshots at hero, every morph step, and the end, on a 1440×900 viewport, plus a 390px phone frame with no overflow. Then report to the user: one line per variant (shape sequence, layout, who it targets) and the local URLs. Commit to feat/motion-labs (no attribution lines), push via HTTPS with gh credentials if ssh-add has no keys.
