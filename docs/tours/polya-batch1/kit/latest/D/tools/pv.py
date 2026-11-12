# pv.py sid N — novelty view of prompt N: lines not seen before (globally) + turn-critical lines + conversation tail + new turn
import json,sys,re,os
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26D/'
D=R+sys.argv[1]
p=json.load(open(f'{D}/ai/p{sys.argv[2]}.json')); u=p['user']
sf=R+'seen.json'; seen=set(json.load(open(sf))) if os.path.exists(sf) else set()
def norm(l): return re.sub(r'[\d۰-۹]+|(?:pb_l_|achat_|case_|lp_|prc_)[a-z0-9]+','#',l)[:160]
print(f'===== p{sys.argv[2]} TASK {p.get("task")} sys={len(p["sys"])} user={len(u)}')
if norm(p['sys'][:3000]) and ('SYS:'+str(hash(p['sys'])) ) not in seen:
    if not p['sys'].startswith('تو «دستیار»'): print('SYS(other):',p['sys'][:1500])
secs=re.split(r'\n(?=# )',u)
ALW=re.compile(r'پرسشِ این نوبت همین|پیشنهادِ این نوبت|در این نوبت فقط|◀')
SKIP=('# نقشهٔ سامانه',)
ML=int(os.environ.get('ML','1100'))
for sc in secs:
    ls=sc.split('\n'); h=ls[0]
    if h.startswith(SKIP):
        continue
    if h.startswith('# گفت‌وگو'):
        print('#### CONV'); print(sc[-int(os.environ.get('CV','350')):]); continue
    if h.startswith('# نوبتِ تازه'): continue
    if h.startswith('# صفحهٔ فعلی') and not os.environ.get('PG'):
        print('# صفحهٔ فعلی',(ls[1] if len(ls)>1 else '')[:90]); continue
    if h.startswith('# امروز'): print('# امروز',ls[1][:32] if len(ls)>1 else ''); continue
    if h.startswith('# سشن'): continue
    if h.startswith('# برگه') and 'هیچ برگهٔ بازی نیست' in sc: continue
    always=h.startswith(('# وضعِ کنونی','# مسئلهٔ زنده','# اصلاح','# کارِ پیشین','# حسابِ صفحه','# تور','# دو مسئله','# برگه','# پیام‌های اخیرِ صفحه','# موعدهای'))
    out=[]
    for l in ls[1:]:
        if not l.strip(): continue
        k=norm(l)
        if k in seen and ALW.search(l) and 'پیشنهادِ این نوبت' in l:
            marks=re.findall(r'([upeb]\d+)\) [^\[]{0,200}?\[([^\]]+)\]',l)
            out.append('Q-LIST marks: '+'; '.join(a+':'+b[:40] for a,b in marks)+' || '+l[l.index('پیشنهادِ این نوبت'):][:500]); continue
        if always and k in seen and re.search(r'ساعتِ یادآورها|اگر کاربر برای موعد ساعت',l): continue
        if always or k not in seen or ALW.search(l):
            if h.startswith('# صفحهٔ فعلی') and l.startswith(('دکمه‌ها','سرتیترها')): l=l[:300]
            out.append(l[:ML]+(' …[%d]'%len(l) if len(l)>ML else ''))
        seen.add(k)
    if out or norm(h) not in seen: print(h[:300]); [print('  '+x) for x in out]
    seen.add(norm(h))
json.dump(sorted(seen),open(sf,'w'),ensure_ascii=False)
print('#### NEW:',u.split('# نوبتِ تازه')[-1].strip()[:1500] if '# نوبتِ تازه' in u else '(no user turn)')
