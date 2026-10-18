# ls_ctl.py dir -> compact listing of ctl files
import json,glob,sys
d=sys.argv[1]
fs=sorted(glob.glob(d+'/c*.json'),key=lambda x:int(x.split('/c')[-1][:-5]))
for f in fs:
    n=f.split('/c')[-1][:-5]; t=open(f).read()
    try: j=json.loads(t)
    except Exception: print(n,'BAD'); continue
    k=list(j.keys())
    if 'say' in j: s='SAY '+str(j['say'])[:150]
    elif 'exit' in j: s='EXIT'
    elif 'shot' in j: s='SHOT '+j['shot'].get('name','')
    elif 'eval0' in j: s='EVAL0 '+j['eval0'][-120:].replace('\n',' ')
    elif 'eval' in j: s='EVAL '+j['eval'][:150].replace('\n',' ')
    else: s=str(j)[:150]
    print(n,s)
