# usage: cx.py DIR [--eval0 JS] [--say TEXT] [--eval JS] [--file PATH:TYPE] ; JS may be @file
import sys,json,subprocess,os
D=sys.argv[1]; a=sys.argv[2:]; c={}; files=[]
i=0
while i<len(a):
    k=a[i][2:]; v=a[i+1]; i+=2
    if v.startswith('@'): v=open(v[1:]).read()
    if k=='file':
        p,t=v.rsplit(':',1); files.append({'path':p,'type':t})
    else: c[k]=v
if files: c['files']=files
st=os.path.join(os.path.dirname(__file__),'st.py')
r=subprocess.run(['python3',st,D,'send','-'],input=json.dumps(c,ensure_ascii=False),capture_output=True,text=True,timeout=900)
out=r.stdout
print(out[:400]); sys.stdout.flush()
# print eval results from latest out
import glob,re
outs=sorted(glob.glob(os.path.join(D,'out','s*.json')),key=lambda f:int(re.search(r's(\d+)\.json',f).group(1)))
if 'AI REQUEST' in out: print('>>> AI request pending (see above)')
else:
    o=json.load(open(outs[-1]))
    for k in ('error','eval0','eval','log'):
        if o.get(k): print('==',k.upper(),'==\n',o[k] if isinstance(o[k],str) else json.dumps(o[k],ensure_ascii=False)[:3000])
    s=o.get('state') or {}
    print('VIEW',s.get('view'),s.get('arg'),s.get('sub'),'rem',s.get('rem'))
    for m in (s.get('msgs') or [])[-3:]: print('  MSG',m[:1200])
