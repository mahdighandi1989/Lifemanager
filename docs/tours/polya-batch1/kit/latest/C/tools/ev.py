# ev.py sid [W] [from] [to] -> per ctl: label + eval results + new msgs since previous say
import json,sys,os,re
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27C'
sid=sys.argv[1]; W=int(sys.argv[2]) if len(sys.argv)>2 else 400
a=int(sys.argv[3]) if len(sys.argv)>3 else 1; b=int(sys.argv[4]) if len(sys.argv)>4 else 9999
D=f'{R}/{sid}'; n=a
while n<=b and os.path.exists(f'{D}/out/s{n}.json'):
    c=json.load(open(f'{D}/ctl/c{n}.json')); o=json.load(open(f'{D}/out/s{n}.json'))
    if 'say' in c: lab='SAY '+c['say'][:W]
    elif 'exit' in c: lab='EXIT'
    elif 'shot' in c: lab='SHOT '+c['shot'].get('name','')
    else: lab=('EVAL0 ' if 'eval0' in c else 'EVAL ')+str(c.get('eval0') or c.get('eval') or c.get('click') or c.get('fill'))[:80].replace('\n',' ')
    print(f'c{n} {lab}')
    for k in ('error','eval0','eval','shotjs','shotErr','stateError'):
        if o.get(k): print(f'   {k}:',json.dumps(o[k],ensure_ascii=False)[:W*3])
    if 'say' in c:
        st=o.get('state') or {}
        ms=st.get('msgs',[])
        # print messages after the user's message
        idx=max([i for i,m in enumerate(ms) if m.startswith('user:')] or [-1])
        for m in ms[idx+1:]: print('   >',m[:W*2].replace('\n',' / '))
    if o.get('log'): print('   LOG',str(o['log'])[:300])
    n+=1
