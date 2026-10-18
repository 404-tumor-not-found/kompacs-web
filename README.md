# kompacs-web

Landing page for [KOMPACS](https://kompacs.cz) (KOMparátor PACS), team 404 Tumor Not Found, Rakathon 2026. App repo: private.

Static HTML, CSS and JS. GSAP from cdnjs. No build.

- Run locally: `python3 -m http.server 8765`, open http://localhost:8765
- Deploy: push a tag `v*` from `main` (`git tag v1 && git push origin v1`), or run the workflow by hand. `CNAME` sets `kompacs.cz`.
- Language: CZ default, EN via the switcher or `?lang=en`.
- Demo video: replace the hero `<img>` in `index.html` with the commented `<video>` tag and add `assets/demo.mp4`.

Built with help from Claude Code.
