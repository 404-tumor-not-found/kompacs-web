# kompacs-web

Landing page for [KomPACS](https://kompacs.cz) (KOMparátor PACS), team 404 Tumor Not Found, Rakathon 2026. App repo: private.

Static HTML, CSS and JS. GSAP from cdnjs. A small Python build (stdlib only) renders one page per language.

- Run locally: `python3 scripts/build.py && python3 -m http.server 8765 -d _site`, open http://localhost:8765
- Deploy: push a tag `v*` from `main` (`git tag v1 && git push origin v1`), or run the workflow by hand. The workflow runs the build and publishes `_site/`. `CNAME` sets `kompacs.cz`.
- Texts: `template.html` holds `{{key}}` placeholders. `locales/<lang>.json` holds the texts. JS texts are under `js` and read with `tr('key')`. The build fails on a missing, extra or unused key.
- Languages: Czech at `/`, others at `/<lang>/`. Old `?lang=en` links redirect.
- Add a language: copy `locales/en.json` to `locales/<lang>.json` and translate it. The build adds the page, the switcher link, hreflang and the sitemap entry.
- Demo video: replace the hero `<img>` in `template.html` with the commented `<video>` tag and add `assets/demo.mp4`.

Built with help from Claude Code.
