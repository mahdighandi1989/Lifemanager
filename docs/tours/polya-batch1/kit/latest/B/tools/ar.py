#!/usr/bin/env python3
"""ar.py sid : per prompt, the page arithmetic block lines and prior-ledger check lines (compact)"""
import json,os,re,sys
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B'
s=sys.argv[1]; D=f'{B}/{s}/ai'
for n in sorted(int(f[1:-5]) for f in os.listdir(D) if re.match(r'p\d+\.json$',f)):
    u=json.load(open(f'{D}/p{n}.json'))['user']; j=u.rfind('# نوبتِ تازه'); out=[]
    for hd in ('# حسابِ صفحه','# کارِ پیشینِ تو'):
        i=u.find(hd)
        if i>=0:
            k=u.find('\n# ',i+5); blk=u[i:k if k>0 else i+3000]
            for l in blk.split('\n'):
                if re.search(r'می‌خواند|نمی‌خواند|نسنجیده|✗|✓|⚠️|؟ نسنج|ازسرگیری|وابسته|کهنه|واحد',l) and 'حسابی را که صفحه' not in l: out.append('   '+l[:int(os.environ.get('W','300'))])
    if out: print(f'p{n} «{u[j+13:j+70].strip()}»'); print('\n'.join(out))
