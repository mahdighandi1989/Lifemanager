import json,glob,re,os,collections
DATA=('# نقشهٔ سامانه','# سشن','# برگه‌های بازِ','# صفحهٔ فعلی','# گفت‌وگو تا این لحظه','# نوبتِ تازه','# پیام‌های اخیرِ صفحه')
CTX='زمینه (نه پرسشِ دوم)'
TURN=('پرسشِ این نوبت همین است','در این نوبت فقط **یک** پرسش','پیشنهادِ این نوبت','- پرسشِ این نوبت:','- پرسش‌های همین مرحله','- پرسش‌های «','همهٔ پرسش‌ها')
seen=collections.Counter(); ex={}
for f in sorted(glob.glob('*/ai/p*.json')):
    p=json.load(open(f))
    if p.get('task') not in ('lla_assistant','lla_coach'): continue
    blk=''
    for l in p['user'].split('\n'):
        if l.startswith('# '): blk=l[:40]; 
        if blk.startswith(DATA): continue
        if CTX in l[:80] or any(t in l for t in TURN): continue
        b=re.search(r'(?<![آ-ی])بپرس(?![آ-ی])',l); q=l.rstrip().endswith(('؟','?'))
        if b or q:
            k=(blk,l[:120]); seen[k]+=1; ex.setdefault(k,f)
for (b,l),n in seen.most_common(): print(n,ex[(b,l)],'|',b,'|',l)
