import json,re,glob,sys
s=sys.argv[1]
for f in sorted(glob.glob(s+'/ai/p*.json'),key=lambda x:int(x.split('/p')[-1][:-5])):
    n=f.split('/p')[-1][:-5]; u=json.load(open(f))['user']; m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S)
    h=re.search(r'# مسئلهٔ زندهٔ این سشن \((pb_l_\w+)\): «([^»]{0,40})',u)
    r=json.load(open(f'{s}/ai/r{n}.txt'))
    print(f'p{n} [{h.group(2) if h else "-"}] U:',(m.group(1)[:160] if m else '?').replace('\n',' '))
    print('    A:',r['reply'][:500].replace('\n',' '),[a.get('do') for a in r.get('actions',[])])
for f in sorted(glob.glob(s+'/out/s*.json'),key=lambda x:int(x.split('/s')[-1][:-5])):
    t=json.dumps(json.load(open(f)),ensure_ascii=False)
    if '💬' in t or 'پرسشی که بیشتر کمک' in t:
        for mm in re.finditer(r'(?:BEST=|lpBBest[^"]{0,80}|پرسشی که بیشتر کمک کرد)[^|]{0,1500}',t): print(f.split('/')[-1],'>>',mm.group(0)[:1500].replace('\\n',' / '))
