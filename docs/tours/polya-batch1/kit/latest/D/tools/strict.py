#!/usr/bin/env python3
# strict.py DIR sid... — port of test_tour1_r11_coach.js strictScan (K1), live block INCLUDED (LIVEOK=1 to skip it like the test)
import json,glob,re,sys,os
B=sys.argv[1]
SK=r'^# (?:سشن|گفت‌وگو تا این لحظه|نوبتِ تازه|صفحهٔ فعلی|امروز|نقشهٔ سامانه|برگه‌های بازِ|پیام‌های اخیرِ صفحه|متنِ فایل‌ها|کارنامهٔ ذهن'+('|مسئلهٔ زندهٔ این سشن' if os.environ.get('LIVEOK') else '')+')'
turn=lambda l: re.search(r'\*\*پرسشِ این نوبت همین است:?\*\*',l) or re.match(r'^- پرسش‌های «',l) or re.match(r'^- در این نوبت فقط \*\*یک\*\* پرسش',l)
ctx=lambda l: re.match(r'^- زمینه \(نه پرسشِ دوم\)',l) or re.match(r'^- \(زمینه، نه پرسشِ دوم',l)
ASK=re.compile(r'(?:^|[^آ-ی])بپرس(?![آ-ی])'); ENDQ=re.compile(r'[؟?][»"\')\].\s*]*$')
def scan(u):
    head=u.split('# نوبتِ تازه')[0]; bad=[]
    for bl in re.split(r'\n(?=# )',head):
        h=bl.split('\n')[0]
        if not h.startswith('# ') or re.match(SK,h): continue
        bc='\n- (زمینه، نه پرسشِ دوم' in bl
        for l in bl.split('\n'):
            if turn(l): continue
            nq=re.sub(r'«[^»]*»','«»',l)
            if ASK.search(nq): bad.append('ASK  ['+h[:40]+'] '+l[:220])
            elif ENDQ.search(l.strip()) and not ctx(l) and not bc: bad.append('ENDQ ['+h[:40]+'] '+l[:220])
    return bad
for s in sys.argv[2:]:
  for f in sorted(glob.glob(f'{B}/{s}/ai/p*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0])):
    p=json.load(open(f))
    if not p['sys'].startswith('تو «دستیار»'): continue
    b=scan(p['user'])
    if b:
        print(f'== {s} {os.path.basename(f)}')
        for x in b: print('   ',x)
