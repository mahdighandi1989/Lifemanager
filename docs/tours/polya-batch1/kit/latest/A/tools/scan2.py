import json,glob,re,sys,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CTX='زمینه (نه پرسشِ دوم)'
GEN=('سکوت، «نمی‌دونم»','این گفت‌وگو به همین مسئله بسته است','هر نوبت فقط یک پرسش','حلِ مسئله مهارتی عملی','سطحِ استقلالِ کاربر','چهار مرحلهٔ حل در دادهٔ','پرسش‌های همین مرحله (برای','پایانِ نردبانِ سرنخ','**گزارشِ وضع','قاعدهٔ سبک','ادعای محلِ بحث («حق داره','اگر حرفِ تازه‌اش مسئلهٔ تازه','پرسش‌ها را مکانیکی')
def qs(l):
    out=[]
    m=re.search(r'پیشنهادِ این نوبت: «(.+?)»\.',l)
    if m: out.append(('sug',m.group(1)))
    if '**پرسشِ این نوبت همین است:**' in l:
        m=re.search(r'بپرس «(.+?)»',l); out.append(('moment',m.group(1) if m else l[40:120]))
    m=re.search(r'فقط \*\*یک\*\* پرسش.*?: «(.+?)»\. اگر',l)
    if m: out.append(('live1',m.group(1)))
    m=re.search(r'پیش از یادآوری بپرس «(.+?)»',l)
    if m: out.append(('recall',m.group(1)))
    if 'همین را ادامه می‌دهی؟' in l: out.append(('openprob','همین را ادامه می‌دهی؟'))
    if not out and l.startswith('- ') and CTX not in l[:45] and not any(g in l for g in GEN) and re.search(r'بپرس(?!د)',l):
        pre=l[:l.find('بپرس')]
        if not re.search(r'(?:^|[\s(«])اگر(?:[\s]|$)|⇒',pre): out.append(('raw',l[:160]))
    return out
def norm(q): return re.sub(r'[^\w]','',q)[:40]
sids=sys.argv[1:] or sorted(os.path.basename(d) for d in glob.glob(R+'/s[0-9]*'))
tot=0
for s in sids:
  for f in sorted(glob.glob(f'{R}/{s}/ai/p*.json'),key=lambda x:int(re.search(r'p(\d+)\.json',x).group(1))):
    u=json.load(open(f))['user']; inb=False; H=[]
    i=u.find('# صفحهٔ فعلی'); u2=u[:i] if i>0 else u
    for l in u2.split('\n'):
        if l.startswith('# '): continue
        H+=qs(l)
    tot+=1
    d={}
    for k,q in H: d.setdefault(norm(q),[]).append(k)
    if len(d)>1:
        print('==',s,os.path.basename(f),'distinct',len(d),' | '.join(k+':'+q[:70] for k,q in H))
print('scanned',tot)
