#!/usr/bin/env python3
"""Check generated pages, locale metadata and local links without dependencies."""
import json
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from build_site import LANGUAGES, ROOT, URL, page_url

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids = []
        self.refs = []
        self.lang = ''
        self.canonical = ''
        self.alternates = []
        self.h1 = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'html':
            self.lang = attrs.get('lang')
        if tag == 'h1':
            self.h1 += 1
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')
        if tag == 'link' and attrs.get('rel') == 'alternate':
            self.alternates.append(attrs.get('hreflang'))
        for key in ('href', 'src'):
            if key in attrs:
                self.refs.append(attrs[key])

def main():
    docs = ROOT / 'docs'
    expected_keys = set(json.loads((ROOT / 'src/base-copy.json').read_text()))
    pages = {}
    for code in LANGUAGES:
        path = docs / ('' if code == 'ja' else code) / 'index.html'
        page = Page(path)
        text = path.read_text()
        page.feed(text)
        assert page.lang == code, f'{code}: incorrect html lang'
        assert page.canonical == page_url(code), f'{code}: incorrect canonical'
        assert set(page.alternates) == set(LANGUAGES) | {'x-default'}, f'{code}: missing alternates'
        assert page.h1 == 1, f'{code}: expected one h1'
        assert all(count == 1 for count in Counter(page.ids).values()), f'{code}: duplicate id'
        match = re.search(r'<script id="page-copy" type="application/json">(.*?)</script>', text, re.S)
        copy = json.loads(match[1])
        assert set(copy) == expected_keys, f'{code}: incomplete UI copy'
        assert 'width="128" height="128"' in text, f'{code}: incorrect drawing resolution'
        assert not re.search(r'boss\.webp|白紙の創世竜|bossTitle|bossBody|memory-photo|group picture|集合写真', text), f'{code}: spoiler remains'
        assert not re.search(r'\{\{\w+\}\}|__[A-Z_]+__', text), f'{code}: unresolved token'
        pages[path.resolve()] = page
    links = 0
    for page in pages.values():
        for ref in page.refs:
            url = urlsplit(ref)
            if url.scheme or url.netloc:
                continue
            target = (page.path.parent / unquote(url.path)).resolve() if url.path else page.path.resolve()
            if target.is_dir():
                target /= 'index.html'
            assert target.is_file(), f'{page.path}: missing {ref}'
            if url.fragment and target in pages:
                assert unquote(url.fragment) in pages[target].ids, f'{page.path}: broken anchor {ref}'
            links += 1
    for css in (docs / 'assets').glob('*.css'):
        for quoted_double, quoted_single, unquoted in re.findall(r'''url\(\s*(?:"([^"]+)"|'([^']+)'|([^\s)]+))\s*\)''', css.read_text()):
            ref = quoted_double or quoted_single or unquoted
            if ref.startswith('data:'):
                continue
            assert (css.parent / ref).is_file(), f'Missing CSS asset: {ref}'
    assert (docs / '.nojekyll').is_file()
    print(f'PASS: {len(pages)} locales, {len(expected_keys)} strings each, {links} local links, 128×128 canvases, no spoilers, CSS assets and anchors')

if __name__ == '__main__':
    main()
