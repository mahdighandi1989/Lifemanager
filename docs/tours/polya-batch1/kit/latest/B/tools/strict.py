import json,re,sys
SKIP=re.compile(r'^# (?:سشن|گفت‌وگو تا این لحظه|نوبتِ تازه|صفحهٔ فعلی|نقشهٔ سامانه|برگه‌های بازِ|پیام‌های اخیرِ صفحه|متنِ فایل‌ها)')
def isTurn(l): return bool(re.search(r'\*\*پرسشِ این نوبت همین است:?\*\*',l) or re.match(r'^- پرسش‌های «',l) or re.match(r'^- در این نوبت فقط \*\*یک\*\* پرسش',l) or re.match(r'^- پرسش‌های همین مرحله \(',l) or re.match(r'^- داورِ این مسئله هنوز انتخاب نشده: پیش از هر پرسشِ دیگر بپرس',l) or re.match(r'^- همهٔ پرسش‌های این مرحله در صفحه یا گفت‌وگو پاسخ گرفته‌اند',l))
def isCtx(l): return bool(re.match(r'^- زمینه \(نه پرسشِ دوم\)',l) or re.match(r'^- \(زمینه، نه پرسشِ دوم',l))
ASK=re.compile(r'(?:^|[^آ-ی])بپرس(?![آ-ی])'); ENDQ=re.compile(r'[؟?][»"\')\].\s*]*$')
STRAY=[r'از خودم می‌پرسم: دقیقاً چه می‌خواهم',r'«روشن می‌بینی[^»]*[؟?][^»]*»',r'همان پرسش را با \*\*تغییرِ کوچک\*\* تکرار']
for f in sys.argv[1:]:
  d=json.load(open(f))
  if d.get('task') not in ('lla_assistant','lla_coach'): continue
  head=d['user'].split('# نوبتِ تازه')[0]; bad=[]
  for bl in re.split(r'\n(?=# )',head):
    h=bl.split('\n')[0]
    if not h.startswith('# ') or SKIP.match(h): continue
    bctx=bool(re.search(r'\n- \(زمینه، نه پرسشِ دوم',bl))
    for l in bl.split('\n'):
      if isTurn(l) or (h.startswith('# تور ') and l.startswith('⚠ در این سشن نشانهٔ پریشانیِ جدی بود')): continue
      nq=re.sub(r'«[^»]*»','«»',l)
      if ASK.search(nq): bad.append('ASK  ['+h[:30]+'] '+l[:200])
      elif ENDQ.search(l.strip()) and not isCtx(l) and not bctx: bad.append('ENDQ ['+h[:30]+'] '+l[:200])
      elif not isCtx(l) and any(re.search(r,l) for r in STRAY): bad.append('STRAY['+h[:30]+'] '+l[:200])
  if bad: print('##',f); [print('  ',b) for b in bad]
