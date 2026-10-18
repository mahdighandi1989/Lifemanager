# recdiff.py sid — compare every eval output (old round23D vs new round24D), aligned by ctl content; normalize ids/times
import json,sys,glob,re,difflib
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/'
s=sys.argv[1]; O=B+'round23D/'+s; N=B+'round24D/'+s
def norm(x):
    x=str(x)
    x=re.sub(r'(pb_l_|achat_|case_|lp_|prc_|pq|dl_|fc_|t20)[a-z0-9]{4,}','ID',x)
    x=re.sub(r'\d{4}-\d{2}-\d{2}T[\d:.]+Z','TS',x)
    x=re.sub(r'"(at|d0|outcomeAt|selfAt|diagAt)":"[^"]*"','',x)
    return x
def load(D):
    out=[]
    for k in range(1,len(glob.glob(D+'/ctl/c*.json'))+1):
        try: c=open(f'{D}/ctl/c{k}.json').read()
        except: continue
        try: r=json.load(open(f'{D}/out/s{k}.json'))
        except: r={}
        out.append((k,c,r))
    return out
A=load(O); Bn=load(N)
used=set(); j=0
for k,c,r in A:
    if 'birth=' in c: continue
    # find same ctl in new
    m=None
    for jj in range(j,len(Bn)):
        if Bn[jj][1]==c: m=jj; break
    if m is None: print(f'c{k}: no match'); continue
    j=m+1; kn,_,rn=Bn[m]
    eo,en=norm(r.get('eval','')),norm(rn.get('eval',''))
    if eo!=en and r.get('eval') is not None:
        # print short field-level diff for JSON
        try:
            a=json.loads(r['eval']); b=json.loads(rn['eval'])
            ks=sorted(set(a)|set(b)) if isinstance(a,dict) and isinstance(b,dict) else []
            dd=[x for x in ks if norm(json.dumps(a.get(x),ensure_ascii=False))!=norm(json.dumps(b.get(x),ensure_ascii=False))]
            print(f'c{k}->c{kn} DIFF fields {dd}')
            for x in dd[:6]:
                ao=norm(json.dumps(a.get(x),ensure_ascii=False)); bo=norm(json.dumps(b.get(x),ensure_ascii=False))
                for t,i1,i2,j1,j2 in difflib.SequenceMatcher(None,ao,bo,autojunk=False).get_opcodes()[:40]:
                    if t!='equal': print(f'     [{x}] {t}: OLD «{ao[max(0,i1-40):i2+40][:220]}» NEW «{bo[max(0,j1-40):j2+40][:220]}»'); break
        except Exception:
            ops=[o for o in difflib.SequenceMatcher(None,eo,en,autojunk=False).get_opcodes() if o[0]!='equal']
            print(f'c{k}->c{kn} DIFF text ({len(ops)} regions)')
            for t,i1,i2,j1,j2 in ops[:3]: print(f'     {t}: OLD «{eo[max(0,i1-50):i2+50][:250]}» NEW «{en[max(0,j1-50):j2+50][:250]}»')
