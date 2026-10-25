# rt.py sid -> routing/turn table: pN | task | kind guess | turn (short) | Q line | reply (short) | acts
import json,re,glob,sys
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C'
sid=sys.argv[1]; full='full' in sys.argv
for f in sorted(glob.glob(f'{T}/{sid}/ai/p*.json'),key=lambda x:int(x.split('/p')[-1][:-5])):
    n=int(f.split('/p')[-1][:-5]); j=json.load(open(f)); u=j['user']
    m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S); turn=(m.group(1).strip() if m else u[-200:]).replace('\n',' ')
    heads=[h for h in re.findall(r'(?m)^# ([^\n]{0,40})',u)]
    coach=any(h.startswith(('مسئلهٔ زندهٔ این سشن','معلمِ حلِ مسئله','پاسخ به پرسشِ بازنگری','اصلاحی که صفحه','اصلاحِ پیامِ','مسئلهٔ واقعیِ حل‌نشده','پس از شکست','مسئلهٔ حل‌شدهٔ مرتبط')) for h in heads)
    q=[l for l in u.split('\n') if 'پرسشِ این نوبت همین است' in l]
    try:
        r=json.load(open(f'{T}/{sid}/ai/r{n}.txt')); rep=r.get('reply',''); acts=[a.get('do') for a in r.get('actions',[])]
    except Exception as e: rep='(none)'; acts=[]
    print(f"p{n} | {j.get('task')} | coachblk={'Y' if coach else 'n'} | {turn[:(400 if full else 110)]}")
    if full:
        for l in q: print('   Q:',l[:300])
        sp=[h for h in heads if h.startswith(('اصلاح','گزارشِ نوبت','پرونده‌های تمرین','وضعِ کنونی'))]
        print('   H:',sp)
        print('   R:',rep[:400]); print('   A:',acts)
