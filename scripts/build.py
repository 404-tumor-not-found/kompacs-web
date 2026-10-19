#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# ///
"""Build _site/: one page per locale in locales/, plus sitemap.xml. Fails on missing or unused keys.

Run: python3 scripts/build.py
"""
import html
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / '_site'
SITE = 'https://kompacs.cz'
DEFAULT = 'cs'
SKIP = {'.git', '.github', '.gitignore', '_site', 'locales', 'scripts', 'docs', 'template.html', 'README.md'}
PLACEHOLDER = re.compile(r'\{\{([\w.]+)\}\}')


def flatten(d, prefix=''):
    out = {}
    for k, v in d.items():
        if isinstance(v, dict):
            out.update(flatten(v, f'{prefix}{k}.'))
        else:
            out[f'{prefix}{k}'] = v
    return out


def url_path(code):
    return '/' if code == DEFAULT else f'/{code}/'


def check(locales, template, js_src):
    errors = []
    base = set(locales[DEFAULT])
    for code, loc in locales.items():
        errors += [f'{code}: missing key {k}' for k in sorted(base - set(loc))]
        errors += [f'{code}: extra key {k}' for k in sorted(set(loc) - base)]
        errors += [f'{code}: empty value {k}' for k, v in loc.items() if not isinstance(v, str) or not v.strip()]
    html_keys = {k for k in base if not k.startswith('js.') and k not in ('meta.label',)}
    used = {k for k in PLACEHOLDER.findall(template) if not k.startswith('page.')}
    errors += [f'template: unknown key {k}' for k in sorted(used - base)]
    errors += [f'template: unused key {k}' for k in sorted(html_keys - used)]
    js_keys = {k[3:] for k in base if k.startswith('js.')}
    sections = sorted({k.split('.')[0] for k in js_keys})
    js_used = set(re.findall(r"'((?:%s)\.\w+)'" % '|'.join(sections), js_src))
    errors += [f'js: unknown key {k}' for k in sorted(js_used - js_keys)]
    errors += [f'js: unused key {k}' for k in sorted(js_keys - js_used)]
    if errors:
        sys.exit('i18n check failed:\n  ' + '\n  '.join(errors))


def page_values(code, codes, locales):
    loc = locales[code]
    paths = {c: url_path(c) for c in codes}
    alternates = [f'<link rel="alternate" hreflang="{c}" href="{SITE}{p}">' for c, p in paths.items()]
    alternates.append(f'<link rel="alternate" hreflang="x-default" href="{SITE}/">')
    current = ' aria-current="page"'
    switch = ''.join(
        f'<a href="{paths[c]}" hreflang="{c}" lang="{c}" data-goatcounter-click="click-lang-{c}"'
        f'{current if c == code else ""}>{html.escape(locales[c]["meta.label"])}</a>'
        for c in codes)
    js = {k[3:]: v for k, v in loc.items() if k.startswith('js.')}
    return {
        'page.lang': code,
        'page.url': SITE + paths[code],
        'page.alternates': '\n'.join(alternates),
        'page.og_alternates': '\n'.join(
            f'<meta property="og:locale:alternate" content="{locales[c]["meta.og_locale"]}">' for c in codes if c != code),
        'page.in_language': json.dumps(codes),
        'page.lang_switch': switch,
        'page.js': json.dumps(js, ensure_ascii=False).replace('</', '<\\/'),
        # Old links used ?lang=en. Send them to the page of that language.
        'page.legacy_redirect': f'const P = {json.dumps(paths)}, l = new URLSearchParams(location.search).get("lang"); '
                                'if (Object.hasOwn(P, l) && P[l] !== location.pathname) location.replace(P[l] + location.hash);',
    }


def render(template, values):
    ld = re.search(r'<script type="application/ld\+json">.*?</script>', template, re.S).span()

    def sub(m):
        key, pos = m.group(1), m.start()
        value = values[key]
        if key.startswith('page.'):
            return value
        if ld[0] < pos < ld[1]:
            return json.dumps(value, ensure_ascii=False)[1:-1]
        if template.rfind('<', 0, pos) > template.rfind('>', 0, pos):
            return html.escape(value, quote=True)
        return value

    return PLACEHOLDER.sub(sub, template)


def sitemap(codes):
    links = ''.join(f'\n    <xhtml:link rel="alternate" hreflang="{c}" href="{SITE}{url_path(c)}"/>' for c in codes)
    urls = ''.join(f'\n  <url>\n    <loc>{SITE}{url_path(c)}</loc>{links}\n  </url>' for c in codes)
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
            f'{urls}\n</urlset>\n')


def main():
    files = {p.stem: p for p in (ROOT / 'locales').glob('*.json')}
    codes = [DEFAULT] + sorted(c for c in files if c != DEFAULT)
    locales = {c: flatten(json.loads(files[c].read_text())) for c in codes}
    template = (ROOT / 'template.html').read_text()
    js_src = ''.join(p.read_text() for p in ROOT.glob('*.js'))
    check(locales, template, js_src)

    shutil.rmtree(OUT, ignore_errors=True)
    OUT.mkdir()
    for p in ROOT.iterdir():
        if p.name in SKIP:
            continue
        (shutil.copytree if p.is_dir() else shutil.copy2)(p, OUT / p.name)
    for code in codes:
        out = OUT / url_path(code).strip('/') / 'index.html'
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(render(template, {**locales[code], **page_values(code, codes, locales)}))
    (OUT / 'sitemap.xml').write_text(sitemap(codes))
    print(f'built {", ".join(url_path(c) for c in codes)} into {OUT.relative_to(ROOT)}/')


if __name__ == '__main__':
    main()
