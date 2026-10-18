# scan7: prompts whose non-context turn directives name DIFFERENT questions
import json,glob,re,sys
MK=('**پرسشِ این نوبت همین است:**','در این نوبت فقط **یک** پرسش','پیشنهادِ این نوبت:')
def norm(s): return re.sub(r'[\s‌ِ]','',s.replace('می‌کنید','می‌کنی').replace('ید؟','ی؟'))
out=[]
for f in sorted(glob.glob((sys.argv[1] if len(sys.argv)>1 else '*')+'/ai/p*.json')):
    p=json.load(open(f))
    if p.get('task') not in ('lla_assistant','lla_coach'): continue
    lines=[]
    for l in p['user'].split('\n'):
        if l.startswith('- زمینه') or l.startswith('زمینه'): continue
        for m in MK:
            if m in l: lines.append(l[l.find(m):]); break
    if len(lines)<2: continue
    qs=[re.findall(r'«([^»]{6,})»',x) for x in lines]
    # each line's own question = last «…» ending with ؟ else first
    own=[]
    for q in qs:
        c=[x for x in q if x.strip().endswith('؟')]
        own.append(norm(c[-1] if c else (q[0] if q else '')))
    allq=[norm(x) for q in qs for x in q]
    bad=[o for o in own if o and not all(o in norm(L) for L in lines)]
    if len(set(own))>1 and bad: out.append((f,[q[-1][:60] if q else '' for q in qs]))
for f,qs in out: print(f,'|',' || '.join(qs))
print('flagged',len(out))
