import json,sys,glob,re,os,difflib
B,s=sys.argv[1],sys.argv[2]
def norm(x): x=str(x); x=re.sub(r'(?:case|pb_l|achat|lp)_[a-z0-9]+|20[0-9]{2}-[0-9]{2}-[0-9]{2}T[0-9:.]+Z|[0-9]{10,}','ID',x); return x
OS=os.environ.get('OLDS',s)
n=len(glob.glob(f'{B}/round21D/{s}/out/s*.json'))
for i in range(1,n+1):
    try: a=json.load(open(f'{B}/round21D/{OS}/out/s{i}.json')); b=json.load(open(f'{B}/round21D/{s}/out/s{i}.json'))
    except Exception as e: print(i,'missing',e); continue
    for k in ('eval0','eval','error'):
        if norm(a.get(k))!=norm(b.get(k)):
            sa,sb=norm(a.get(k)),norm(b.get(k))
            sm=difflib.SequenceMatcher(None,sa,sb)
            ds=[(t,sa[i1:i2][:200],sb[j1:j2][:200]) for t,i1,i2,j1,j2 in sm.get_opcodes() if t!='equal'][:4]
            print(f's{i} {k}:',ds)
    ma=[norm(m) for m in a.get('state',{}).get('msgs',[])]; mb=[norm(m) for m in b.get('state',{}).get('msgs',[])]
    if ma[-3:]!=mb[-3:] and not os.environ.get('NOMSG'):
        print(f's{i} msgs differ:', [m[:200] for m in mb[-3:] if m not in ma])
