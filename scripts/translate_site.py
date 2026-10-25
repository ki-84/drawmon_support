#!/usr/bin/env python3
"""Prepare static website translation drafts using the local Apple translator."""
import argparse
import concurrent.futures
import hashlib
import json
from pathlib import Path
import subprocess

ROOT=Path(__file__).resolve().parents[1]
APP=ROOT.parent
LANGUAGES=['ja','en','ko','zh-Hans','zh-Hant','es','fr','de','pt','it','vi','tr','nl','sv','da','nb']

def write(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--languages',default=','.join(LANGUAGES[2:]))
    parser.add_argument('--keys', help='Comma-separated changed keys; merge only these translations')
    args=parser.parse_args()
    base=json.loads((ROOT/'src/base-copy.json').read_text())
    for locale in ['ja','en']:write(ROOT/f'src/locales/{locale}.json',{k:v[locale] for k,v in base.items()})
    keys=args.keys.split(',') if args.keys else list(base)
    values=[base[k]['en'] for k in keys]
    revision=hashlib.sha256(json.dumps(values).encode()).hexdigest()[:12]
    binary=APP/'.build/apple-mac/Build/Products/Debug/AppleNativeBenchmark'
    def translate(locale):
        target=ROOT/f'src/locales/{locale}.json'
        folder=APP/f'.build/promo-translations/{revision}/{locale}'
        write(folder/'input.json',values)
        output=folder/'translated.json'
        if not output.exists():
            with (folder/'generation.log').open('w') as log:
                subprocess.run([str(binary),str(APP/'Drawmon/Resources'),str(folder),'--translate-texts',str(folder/'input.json'),'--language',locale,'--source-language','en'],stdout=log,stderr=subprocess.STDOUT,check=True)
        result=json.loads(output.read_text())
        if len(result)!=len(keys) or any(not isinstance(value,str) or not value.strip() for value in result):raise ValueError(f'Invalid translation batch: {locale}')
        existing=json.loads(target.read_text()) if args.keys and target.exists() else {}
        existing.update(dict(zip(keys,result)))
        write(target,{key:existing[key] for key in base})
        print(f'{locale}: {len(result)} entries',flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        for result in pool.map(translate,args.languages.split(',')):pass

if __name__=='__main__':main()
