import gzip, json, os, glob, collections
R='/home/user/Lifemanager/docs/tours/dataset'
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B/_src25'
blocks={}
for f in glob.glob(R+'/blocks/*.jsonl.gz'):
    for l in gzip.open(f,'rt'):
        d=json.loads(l); blocks[d['id']]=d['text']
sysm={}
for f in glob.glob(R+'/system/*.txt.gz'):
    sysm[os.path.basename(f)[:-7]]=gzip.open(f,'rt').read()
cnt=collections.Counter(); miss=collections.Counter(); fl=collections.Counter()
for l in gzip.open(R+'/exchanges/round25.jsonl.gz','rt'):
    d=json.loads(l)
    if d['run']!='round26B': continue
    sd=d['id'].split('/')[1]; n=d['turn']
    req=d['request']; rep=d['reply']
    if not req or not req.get('complete') or not rep: miss[sd]+=1; continue
    os.makedirs(f'{B}/{sd}/ai',exist_ok=True)
    u=''.join(p if isinstance(p,str) else blocks[p['b']] for p in req['user'])
    json.dump({'task':req['task'],'system':sysm.get(req['system'],''),'user':u},open(f'{B}/{sd}/ai/p{n}.json','w'),ensure_ascii=False)
    open(f'{B}/{sd}/ai/r{n}.txt','w').write(rep['text']); cnt[sd]+=1
    for x in d['flags']: fl[x]+=1
print(sorted(cnt.items()),sum(cnt.values())); print('miss',miss); print(fl)
