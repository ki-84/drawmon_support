#!/usr/bin/env python3
"""Render all locale pages. Deploy docs/ directly to GitHub Pages."""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://ki-84.github.io/drawmon_support/'
LANGUAGES = {
    'ja': '日本語', 'en': 'English', 'ko': '한국어',
    'zh-Hans': '简体中文', 'zh-Hant': '繁體中文', 'es': 'Español',
    'fr': 'Français', 'de': 'Deutsch', 'pt': 'Português', 'it': 'Italiano',
    'vi': 'Tiếng Việt', 'tr': 'Türkçe', 'nl': 'Nederlands', 'sv': 'Svenska',
    'da': 'Dansk', 'nb': 'Norsk bokmål',
}

def page_url(code):
    return URL + ('' if code == 'ja' else code + '/')

def main():
    template = (ROOT / 'src/index.template.html').read_text()
    required = set(re.findall(r'\{\{(\w+)\}\}', template))
    base = json.loads((ROOT / 'src/base-copy.json').read_text())
    base_keys = set(base)
    overrides = json.loads((ROOT / 'src/editorial-overrides.json').read_text())
    alternate = '\n  '.join(
        f'<link rel="alternate" hreflang="{code}" href="{page_url(code)}">'
        for code in LANGUAGES
    ) + f'\n  <link rel="alternate" hreflang="x-default" href="{URL}">'
    for code in LANGUAGES:
        copy = ({key: value[code] for key, value in base.items()} if code in ('ja', 'en')
                else json.loads((ROOT / f'src/locales/{code}.json').read_text()))
        copy.update(overrides.get(code, {}))
        if set(copy) != base_keys or not all(isinstance(v, str) and v.strip() for v in copy.values()):
            raise ValueError(f'{code}: incomplete locale dictionary')
        if required - set(copy):
            raise ValueError(f'{code}: missing template keys {required - set(copy)}')
        content = re.sub(r'\{\{(\w+)\}\}', lambda m: html.escape(copy[m[1]], quote=True), template)
        options = ''.join(f'<option value="{key}"' + (' selected' if key == code else '') + f'>{label}</option>' for key, label in LANGUAGES.items())
        tokens = {
            '__LANG__': code, '__BASE__': './' if code == 'ja' else '../',
            '__CANONICAL__': page_url(code), '__ALTERNATES__': alternate,
            '__LANGUAGE_OPTIONS__': options,
            '__COPY_JSON__': json.dumps(copy, ensure_ascii=False).replace('<', '\\u003c'),
        }
        for key, value in tokens.items():
            content = content.replace(key, value)
        if re.search(r'__[A-Z_]+__|\{\{\w+\}\}', content):
            raise ValueError(f'{code}: unresolved template token')
        target = ROOT / 'docs' / ('' if code == 'ja' else code) / 'index.html'
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content)
        print(f'{code}: {target.relative_to(ROOT)}')
    urls = ''.join(f'<url><loc>{page_url(code)}</loc></url>' for code in LANGUAGES)
    (ROOT / 'docs/sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls + '</urlset>\n')
    (ROOT / 'docs/robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {URL}sitemap.xml\n')

if __name__ == '__main__':
    main()
