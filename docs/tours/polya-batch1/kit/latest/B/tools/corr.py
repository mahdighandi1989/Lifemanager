import json,sys,os,re
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23B'
s=sys.argv[1]; D=f'{B}/{s}'
ks=sorted(int(x[1:-5]) for x in os.listdir(f'{D}/ctl') if re.match(r'c\d+\.json$',x))
seen=set()
for k in ks:
    c=json.load(open(f'{D}/ctl/c{k}.json'))
    t=c.get('say') or c.get('fill') or ''
    if isinstance(t,list): t=' '.join(map(str,t))
    if c.get('click') and 'edsave' in str(c.get('click')): t='[✏️ save]'
    if not t: 
        if c.get('eval') and ('این‌جا هم' in c['eval'] or 'copyAsk' in c['eval']):
            f=f'{D}/out/s{k}.json'
            if os.path.exists(f): print(f'  c{k} EVAL:', str(json.load(open(f)).get('eval'))[:700].replace('\n',' '))
        continue
    if not re.search(r'اصلاح|نه |اشتباه|غلط|✏️|درست(ش)? |ببخشید',t): continue
    f=f'{D}/out/s{k}.json'
    if not os.path.exists(f): continue
    o=json.load(open(f)); m=o.get('state',{}).get('msgs',[])
    print(f'== c{k}: {t[:200]}')
    for x in m[-3:]:
        if x.startswith('sys') or x.startswith('ai'): print('   ',x[:900])
