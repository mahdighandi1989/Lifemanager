# chk.py sid -> grep evidence for recurring defects across all out jsons
import json,glob,re,sys
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27C'
sid=sys.argv[1]
pats={'C26-1 n-of-m':r'مسئلهٔ [۰-۹0-9]+ از [۰-۹0-9]+[^"\\]{0,50}','solved-label':r'(حل شد ✓|به مقصد رسیدی|بسته شد)[^"\\]{0,40}','closure':r'closure[^"\\]{0,60}|هنوز بسته نشده[^"\\]{0,30}','raw-id':r'\((?:it|pb|pid|sh)[0-9a-z_]{4,}\)','undefined':r'undefined','u1':r'مجهول چیست[^"\\]{0,30}'}
for f in sorted(glob.glob(f'{R}/{sid}/out/s*.json'),key=lambda x:int(re.findall(r's(\d+)\.json',x)[0])):
    t=open(f).read(); t=json.dumps(json.loads(t),ensure_ascii=False)
    n=re.findall(r's(\d+)\.json',f)[0]
    for k,p in pats.items():
        m=sorted(set(re.findall(p,t)))
        if m: print(f'c{n} {k}:',' | '.join(x[:90] for x in m[:4]))
