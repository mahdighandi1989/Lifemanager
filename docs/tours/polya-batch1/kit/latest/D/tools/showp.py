#!/usr/bin/env python3
# showp.py file [maxsec]  — print the prompt's hook sections (user part), skipping known boilerplate sections
import sys,json,re
p=json.load(open(sys.argv[1])); u=p['user']
skip=('# نقشهٔ صفحه','# واژه','# دانش','# صفحه‌ها','# فهرستِ')
secs=re.split(r'\n(?=# )',u)
for s in secs:
    h=s.split('\n')[0]
    if len(s)>4000 and not h.startswith('# گفت‌وگو'): print(h,'… [%d chars]'%len(s)); continue
    print(s[-6000:] if h.startswith('# گفت‌وگو') else s)
