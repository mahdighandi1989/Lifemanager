import json,sys,re
d=json.load(open(sys.argv[1]))
u=d['user']
parts=re.split(r'(?m)^(?=# )',u)
for p in parts:
    hd=p.split('\n',1)[0]
    if hd.startswith('# نقشهٔ سامانه'): continue
    if hd.startswith('# صفحهٔ فعلی'): print(p[:int(sys.argv[2]) if len(sys.argv)>2 else 1200]); continue
    if hd.startswith('# گفت‌وگو'): print(hd+'\n...'+p[-1500:]); continue
    print(p[:2500])
