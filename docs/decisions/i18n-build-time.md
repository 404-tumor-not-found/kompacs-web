# One static page per language, rendered at build time

- Each language has its own URL (`/`, `/en/`). Search engines index each page with its own title, description, `lang` and hreflang. One page that switches language with JS showed search engines only the Czech head.
- Texts live in `locales/<lang>.json`, not inline in the HTML. A new language is one new file.
- The build fills the template before deploy. Text in the HTML at load time is better for SEO than text that JS fills in.
- No framework or dependency. `scripts/build.py` uses only the Python standard library.
