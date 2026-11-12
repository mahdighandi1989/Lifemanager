import json,sys,re
D=sys.argv[1]
for k in sys.argv[2:]:
    r=json.load(open(f'{D}/out/s{k}.json')); e=r.get('eval')
    try: o=json.loads(e)
    except Exception as ex:
        print('=== s',k,'RAW',str(e)[:1500]); continue
    print('=== s',k,o.get('today'))
    for lp in o.get('lp',[]): print(' LP',lp['title'],'|',lp['phase'],'| st:',lp['st'][:120],'| stSrc',lp.get('stSrc'),'\n  clos',lp['clos'][:200],'\n  b',lp['b'][:300],'\n  fix',lp['fix'],'\n  steps',json.dumps(lp['steps'],ensure_ascii=False)[:400],'\n  u',lp['u'][:300])
    print(' plans',json.dumps(o.get('plans'),ensure_ascii=False)[:500]); print(' copyAsk',json.dumps(o.get('copyAsk'),ensure_ascii=False)[:400])
    print(' cards',o.get('cards')); print(' dl',o.get('dl')); print(' rem',o.get('rem')[-3:] if o.get('rem') else None); print(' due',o.get('due'))
    print(' sys',[m['t'] for m in o.get('msgs',[]) if m['r']=='sys'][-3:])
    rt=(o.get('coach') or {}).get('retracts') or []
    print(' lastret',json.dumps(rt[-1:],ensure_ascii=False)[:600])
    m=o.get('mind'); print(' mind',m if isinstance(m,list) else str(m)[:600])
    print(' prc',json.dumps(o.get('prc'),ensure_ascii=False)[:700])
