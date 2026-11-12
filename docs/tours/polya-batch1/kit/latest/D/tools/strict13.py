#!/usr/bin/env python3
# strict13.py DIR sid... — exact port of test_tour1_r12_coach.js strictScan (whole prompt incl. «# امروز», live, کارنامه)
import json,glob,re,sys,os
B=sys.argv[1]
SK=re.compile(r'^# (?:سشن|گفت‌وگو تا این لحظه|نوبتِ تازه|صفحهٔ فعلی|نقشهٔ سامانه|برگه‌های بازِ|پیام‌های اخیرِ صفحه|متنِ فایل‌ها)')
def turn(l): return re.search(r'\*\*پرسشِ این نوبت همین است:?\*\*',l) or re.match(r'^- پرسش‌های «',l) or re.match(r'^- در این نوبت فقط \*\*یک\*\* پرسش',l) or re.match(r'^- پرسش‌های همین مرحله \(',l) or re.match(r'^- داورِ این مسئله هنوز انتخاب نشده: پیش از هر پرسشِ دیگر بپرس',l) or re.match(r'^- همهٔ پرسش‌های این مرحله در صفحه یا گفت‌وگو پاسخ گرفته‌اند',l)
ctx=lambda l: re.match(r'^- زمینه \(نه پرسشِ دوم\)',l) or re.match(r'^- \(زمینه، نه پرسشِ دوم',l)
ALLOWH=re.compile(r'^# تور '); ALLOWL=re.compile(r'^⚠ در این سشن نشانهٔ پریشانیِ جدی بود')
ASK=re.compile(r'(?:^|[^آ-ی])بپرس(?![آ-ی])'); ENDQ=re.compile(r'[؟?][»"\')\].\s*]*$')
STRAY=[re.compile(r'از خودم می‌پرسم: دقیقاً چه می‌خواهم'),re.compile(r'«روشن می‌بینی[^»]*[؟?][^»]*»'),re.compile(r'همان پرسش را با \*\*تغییرِ کوچک\*\* تکرار')]
def scan(u):
    head=u.split('# نوبتِ تازه')[0]; bad=[]
    for bl in re.split(r'\n(?=# )',head):
        h=bl.split('\n')[0]
        if not h.startswith('# ') or SK.match(h): continue
        bc='\n- (زمینه، نه پرسشِ دوم' in bl
        for l in bl.split('\n'):
            if turn(l) or (ALLOWH.match(h) and ALLOWL.match(l)): continue
            nq=re.sub(r'«[^»]*»','«»',l)
            if ASK.search(nq): bad.append('ASK  ['+h[:40]+'] '+l[:220])
            elif ENDQ.search(l.strip()) and not ctx(l) and not bc: bad.append('ENDQ ['+h[:40]+'] '+l[:220])
            elif not ctx(l) and any(r.search(l) for r in STRAY): bad.append('STRAY['+h[:40]+'] '+l[:220])
    return bad
for s in sys.argv[2:]:
  for f in sorted(glob.glob(f'{B}/{s}/ai/p*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0])):
    p=json.load(open(f))
    if not p['sys'].startswith('تو «دستیار»'): continue
    b=scan(p['user'])
    if b:
        print(f'== {s} {os.path.basename(f)}')
        for x in b: print('   ',x)
