#!/usr/bin/env python3
# struct.py DIR sid... — mirror of test_tour1_r10_coach.js struct(): count unmarked question directives per assist prompt
import json,glob,re,sys,os
B=sys.argv[1]
GENERIC=[r'^- قاعدهٔ سبک',r'^- \*\*قابِ مربی',r'^- پرسش‌ها را مکانیکی نخوان',r'^- پرسشِ این نوبت: \*\*فقط\*\*',r'^- پرسش‌های «',r'^- \*\*گزارشِ وضع',r'^- سکوت، «نمی‌دونم»',
 r'^- حلِ مسئله مهارتی عملی است',r'^- سطحِ استقلالِ کاربر',r'^- پایانِ نردبانِ سرنخ',r'^- گامِ کوچک ارزش دارد',r'^- ادعای محلِ بحث',r'^- \*\*مسئلهٔ پیشین را خودش حل کرد',r'^- مسئلهٔ «[^»]*» بسته شده است',
 r'^- حلی که در همین گفت‌وگو تمام شد',r'^- ضرب‌المثلِ همین مرحله',r'^- چهار مرحلهٔ حل در دادهٔ خودِ این کاربر',r'^- بازنگری مهم‌ترین بخشِ کار',r'^- استدلالِ اکتشافی',r'^- \*\*پرسشِ بد چرا بد است',
 r'^- \*\*طرحی که از اقتدار',r'^- «چرا فرض کنم همه برقرارند؟»',r'^- از نماد/حروف بیزار است',r'^- در این نوبت فقط \*\*یک\*\* پرسش',r'^- (?:شکل|به تعریف‌ها برگرد) .*\*\*به‌جای\*\* پیشنهادِ این نوبت',
 r'همان پیشنهادِ این نوبت',r'^- همهٔ پرسش‌های این مرحله در صفحه یا گفت‌وگو پاسخ گرفته‌اند',r'^- پرسش‌های همین مرحله',r'^- (?:این مسئله پاسخِ عینی دارد|پاسخِ این مسئله را هیچ‌کس|اگر پاسخِ عینی دارد)']
QB=re.compile(r'«[^»]*»\s*\((?:پولیا|[ABCD]\d{3})[^)]*\)')
nq=lambda q:re.sub(r'[\s*«»]+',' ',q or '').strip()
qsIn=lambda t:[nq(x[1:-1]) for x in re.findall(r'«[^»]*[؟?][^»]*»',t)]
same=lambda a,c: bool(a) and bool(c) and (a==c or c in a or a in c)
L='آ-ی'
def conditional(t):
    m=re.search(r'بپرس(?![آ-ی])',t)
    if not m: return False
    seg=re.split(r'[.؛:]|—',t[:m.start()])[-1]
    return bool(re.search(r'(?:^|[\s(،])اگر(?![آ-ی])',seg))
def struct(u):
    blocks=[x for x in re.split(r'\n(?=# )',u) if re.match(r'^# (?:مربیِ حل|مسئلهٔ زندهٔ این سشن|پس از شکست، نقد یا میلِ رها کردن)',x)]
    sugQ='';turns=[];extras=[]
    for bl in blocks:
        if bl.startswith('# پس از شکست') and '\n- (زمینه، نه پرسشِ دوم' in bl: continue
        for l in bl.split('\n'):
            if not l.startswith('- ') or l.startswith('- زمینه (نه پرسشِ دوم)') or l.startswith('- (زمینه'): continue
            t=QB.sub(' ',l)
            if l.startswith('- پرسش‌های «'):
                m=re.search(r'پیشنهادِ این نوبت: «([^»]+)»',t)
                if m: sugQ=nq(m.group(1))
                continue
            if re.match(r'^- در این نوبت فقط \*\*یک\*\* پرسش',l):
                qs=qsIn(re.split(r'\. اگر با وضعِ همین لحظه',t)[0]); sugQ=qs[-1] if qs else '@one'; continue
            if l.startswith('- **پرسشِ این نوبت همین است:**') or 'پرسشِ این نوبت همین است' in t: turns.append((qsIn(t),l[:140])); continue
            if any(re.search(g,l) for g in GENERIC) or conditional(t): continue
            if re.search(r'(?:^|[\s(،:])(?:بپرس|بخواه)(?![آ-ی])',t) or re.search(r'«[^»]*[؟?][^»]*»',t): extras.append(l[:200])
    tq=[x for x in turns if not any(same(q,sugQ) for q in x[0])]
    return (1 if sugQ else 0)+len(tq)+len(extras),sugQ,tq,extras
for s in sys.argv[2:]:
  for f in sorted(glob.glob(f'{B}/{s}/ai/p*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0])):
    p=json.load(open(f))
    if not p['sys'].startswith('تو «دستیار»'): continue
    n,sq,tq,ex=struct(p['user'])
    if n>1 or os.environ.get('ALL'):
        print(f'== {s} {os.path.basename(f)} n={n} sug={sq[:80]}')
        for x in tq: print('   TURN2:',x[1])
        for x in ex: print('   EXTRA:',x)
