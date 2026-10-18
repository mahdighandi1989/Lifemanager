# corr.py sid -> every correction result the page reported (turn, changed recs, ask fields, note)
import json,glob,re,sys
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24C'
sid=sys.argv[1]; seen=set()
for f in sorted(glob.glob(f'{T}/{sid}/ai/p*.json'),key=lambda x:int(x.split('/p')[-1][:-5])):
    k=int(f.split('/p')[-1][:-5]); u=json.load(open(f))['user']
    m=re.search(r'نتیجهٔ صفحه \(عیناً.*?یادداشتِ صفحه\): (\{.*?\})\n',u)
    if not m: continue
    try: r=json.loads(m.group(1))
    except Exception as e: r={'raw':m.group(1)[:300]}
    key=json.dumps(r,ensure_ascii=False)
    if key in seen: continue
    seen.add(key)
    h=re.search(r'پیامِ پیشینش را اصلاح کرد(?: \(([^)]*)\))?',u)
    print(f'p{k}: {h.group(1) if h and h.group(1) else ""}')
    for c in r.get('changed',[]): print('   CH',c.get('rec'),'|',str(c.get('old'))[-60:],'⇒',str(c.get('new'))[-60:],'|',str(c.get('why'))[:60])
    for a in r.get('ask',[]): print('   ASK',a.get('label'),'|',str(a.get('old'))[:60],'⇒',str(a.get('new'))[:60])
    if r.get('note'): print('   NOTE',r['note'][:150])
