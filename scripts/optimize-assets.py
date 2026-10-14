"""Refresh source art and produce compact web assets. Requires Pillow; no source game edits."""
from pathlib import Path
import hashlib,json,re,io
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT.parent/'Game_claude'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
size=lambda p:sum(f.stat().st_size for f in p.rglob('*') if f.is_file())
before=size(ROOT/'assets')
records=[]
paths=json.loads((GAME/'docs/assets-path-map-2026-10-09.json').read_text())['files']
manifest=json.loads((ROOT/'assets/game-claude-manifest.json').read_text())
source_map={e['path']: GAME/paths.get(e['source'].replace('Game_claude/',''),e['source'].replace('Game_claude/','')) for e in manifest['assets'] if e['path'].endswith('.webp')}
for name,src in [('world-nightfall','illustrations/chapters/prologue-nightfall'),('world-bell','illustrations/chapters/prologue-bell-prayer'),('world-crystal','props/archive-crystal')]:
 source_map[f'assets/images/scenes/{name}.webp']=GAME/f'assets/story/{src}.webp'
for dst in (ROOT/'assets/images').rglob('*.webp'):
 rel=dst.relative_to(ROOT).as_posix();src=source_map.get(rel,dst)
 if dst.parent.name=='screenshots':src=ROOT/'source-screenshots'/f'{dst.stem}.png'
 if not src.exists():src=dst
 old=dst.stat().st_size;oldhash=sha(dst);sourcehash=sha(src)
 im=Image.open(src);im.load();original=im.size
 # Preserve readable screenshot resolution and transparent actor edges.
 cap=1200 if dst.parent.name=='characters' else 1600
 im.thumbnail((cap,cap),Image.Resampling.LANCZOS)
 buf=io.BytesIO();im.save(buf,format='WEBP',quality=82,method=6,alpha_quality=100)
 data=buf.getvalue()
 # Do not recompress an already smaller identical current export.
 if src==dst or (sourcehash==oldhash and len(data)>=old):data=dst.read_bytes()
 dst.write_bytes(data)
 records.append({'path':rel,'source':str(src.relative_to(ROOT)) if src.is_relative_to(ROOT) else str(src.relative_to(GAME)),'sourceProject':'portfolio' if src.is_relative_to(ROOT) else 'Game_claude','sourceSha256':sourcehash,'sha256':sha(dst),'bytesBefore':old,'bytesAfter':len(data),'width':Image.open(dst).width,'height':Image.open(dst).height,'sourceDimensions':original})
# Retain complete unicode slices needed by all authored strings, including UI symbols.
text=''.join(p.read_text() for folder in ['js','css'] for p in (ROOT/folder).glob('*') if p.suffix in ['.js','.css'] and p.name!='fonts.css')+(ROOT/'index.html').read_text()
chars={ord(c) for c in text}|set(range(32,127))|{0x2190,0x2192,0x2193,0x2197,0x2026}
fontcss=(GAME/'src/css/base/fonts.gallery-all.css').read_text();blocks=re.findall(r'@font-face\s*\{[^}]+\}',fontcss)
kept=[];names=set()
for block in blocks:
 ranges=re.search(r'unicode-range:\s*([^;]+)',block).group(1)
 hits=False
 for entry in ranges.split(','):
  v=entry.strip()[2:];pair=v.split('-');lo=int(pair[0],16);hi=int(pair[-1],16)
  if any(lo<=c<=hi for c in chars):hits=True;break
 if hits:
  name=re.search(r'([^/()]+\.woff2)',block).group(1);names.add(name)
  target=ROOT/'assets/fonts/noto-serif-tc'/name;target.write_bytes((GAME/'assets/fonts/noto-serif-tc'/name).read_bytes())
  kept.append(re.sub(r'(?:\.\./)+assets/', '../assets/',block))
for p in (ROOT/'assets/fonts/noto-serif-tc').glob('*.woff2'):
 if p.name not in names:p.unlink()
(ROOT/'css/fonts.css').write_text('/* Used Noto Serif TC unicode slices. Regenerate with scripts/optimize-assets.py after copy changes. */\n'+'\n'.join(kept)+'\n:root{--typeface:"Noto Serif TC",serif;--serif:var(--typeface);--sans:var(--typeface);--mono:var(--typeface)}\n')
# Synchronize dimension metadata with compressed exports.
p=ROOT/'js/content.js';content=p.read_text()
for r in records:
 pattern=r'("path": "'+re.escape(r['path'])+r'",\s*"width": )\d+(,\s*"height": )\d+'
 content=re.sub(pattern,lambda m:m[1]+str(r['width'])+m[2]+str(r['height']),content)
p.write_text(content)
report={'updatedAt':'2026-10-14','assetsBytesBefore':before,'assetsBytesAfter':size(ROOT/'assets'),'fontSlicesBefore':len(blocks),'fontSlicesAfter':len(kept),'images':records}
(ROOT/'assets/optimization-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='images'},indent=2))
