# scan23.py sids -> prompts with >1 unmarked question directive (turn lines) or unmarked «بپرس» outside the kept turn line
import json,glob,re,sys
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24C'
tot=0;bad=[]
for sid in sys.argv[1:]:
    for f in sorted(glob.glob(f'{T}/{sid}/ai/p*.json'),key=lambda x:int(x.split('/p')[-1][:-5])):
        k=int(f.split('/p')[-1][:-5]); j=json.load(open(f)); u=j['user']
        if j.get('sys','').startswith('تو مشاورِ ارشد'): continue
        tot+=1
        turn=[l for l in u.split('\n') if ('**پرسشِ این نوبت همین است:**' in l or 'فقط **یک** پرسش' in l) and not l.startswith('- زمینه')]
        extra=[l for l in u.split('\n') if l.startswith('- ') and not l.startswith('- زمینه') and l not in turn and re.search(r'(?<![«])\bبپرس\b',re.sub(r'«[^»]*»','',l)) and not l.startswith(('- پرسش‌های','- پرسشِ این نوبت: **فقط**'))]
        if len(turn)>1 or extra: bad.append((sid,k,len(turn),[e[:140] for e in extra[:2]]))
print('prompts',tot,'flagged',len(bad))
for b in bad[:40]: print(b)
