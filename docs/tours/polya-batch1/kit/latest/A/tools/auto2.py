#!/usr/bin/env python3
# auto2.py SID : replay round15A ctl from pos+1; for each R11 AI prompt find the R10 prompt with same task+«نوبتِ تازه»;
# auto-answer with R10 answer if key blocks equal after dropping context/proverb/figure/definition lines; else stop & diff.
import sys,os,json,re,subprocess,difflib
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
R11=T+'/round16A'; R10=T+'/round15A'; sid=sys.argv[1]; D=R11+'/'+sid
PID=re.compile(r'pb_l_[a-z0-9]{8,}')
KEYS=('# مسئلهٔ','# مربیِ حل','# پس از شکست','# دانسته‌های قلمرو','# معلم','# نوبتِ تازه-NO')
DROP=('زمینه (نه پرسشِ دوم)','- این مسئله پاسخِ عینی دارد','- از کتاب برای همین مرحله','سکوت، «نمی‌دونم»','حلِ مسئله مهارتی عملی','سطحِ استقلالِ کاربر','چهار مرحلهٔ حل در','این گفت‌وگو به همین مسئله بسته','# دانسته‌های قلمرو (','- یافته‌اند، نه دستور','- می‌خواهد کلِ راه را دور بریزد','- ادعای محلِ بحث','- کار به عقب شاخه می‌دهد','- بازنگری مهم‌ترین بخشِ کار','- قارچ‌ها خوشه‌ای','- فرع «نتیجه','- ضرب‌المثلِ همین مرحله','- شکل «حتی','- به تعریف‌ها برگرد','- مسئلهٔ عملی: داده‌ها بی‌شمار')
def turn(u):
    i=u.find('# نوبتِ تازه'); return u[i:] if i>=0 else ''
TER=[]; U0=[]
def blocks(p):
    u=p['user']; out=[]; inb=False; terr=False
    for l in u.split('\n'):
        if l.startswith('# '): inb=l.startswith(KEYS); terr=l.startswith('# دانسته‌های قلمرو')
        if terr:
            m=re.match(r'- \[[^\]]*\] (\S+)',l)
            if m: TER.append(m.group(1))
            continue
        if l.startswith('ساعتِ یادآورها') or l.startswith('- اگر کاربر برای موعد ساعت'): continue
        if inb:
            if any(k in l for k in DROP): continue
            l=PID.sub('PID',l); l=l.replace(' (برای وضعِ همین نوبت؛ کارتِ صفحه پرسشِ دیگری نشان می‌دهد — این را بپرس، نه آن را؛','(ONEQ;').replace('، هم‌گام با صفحه (همان که صفحه همین حالا می‌پرسد؛','(ONEQ;').replace(' (برای وضعِ همین نوبت؛','(ONEQ;'); l=re.sub(r'احتمالِ ضعیف‌ترین بودن [۰-۹]+٪','P%',l); l=re.sub(r'\([۰-۹]+ نمونه\)|[۰-۹]+ نمونه','N',l)
            l2=re.sub(r'u0\) «[^»]*» · ','',l)
            if l2!=l: U0.append(1)
            out.append(l2)
    return out
def nums(d,pat): return sorted(int(m.group(1)) for f in os.listdir(d) for m in [re.match(pat,f)] if m)
used=json.load(open(D+'/r10map.json')) if os.path.exists(D+'/r10map.json') else {}
def pending():
    for n in nums(D+'/ai',r'^p(\d+)\.json$'):
        if not os.path.exists(D+'/ai/r%d.txt'%n): return n
def find10(p):
    t=turn(p['user']); c=[]
    for m in nums(R10+'/'+sid+'/ai',r'^p(\d+)\.json$'):
        q=json.load(open(R10+'/'+sid+'/ai/p%d.json'%m))
        if q.get('task')==p.get('task') and turn(q['user'])==t and str(m) not in used.values(): c.append((m,q))
    return c
def handle():
    while True:
        n=pending()
        if not n: return True
        if str(n) in os.environ.get('STOPAT','').split(','): print('##### STOPAT p%d'%n); return False
        p=json.load(open(D+'/ai/p%d.json'%n)); c=find10(p)
        if not c: print('##### NO R10 match for p%d (task %s)\n%s'%(n,p.get('task'),turn(p['user'])[:400])); return False
        m,q=c[0]; TER.clear(); U0.clear(); b11=blocks(p); t11=list(TER); TER.clear(); b10=blocks(q); t10=list(TER)
        if t11!=t10: print('TERR p%d r12=%s r11=%s'%(n,t11,t10))
        r10t=open(R10+'/'+sid+'/ai/r%d.txt'%m).read()
        if b11==b10 and '"view":"lprob"' in r10t.replace(' ','') and 'نما: lprob' in p['user']:
            print('##### GO-REDUNDANT p%d (r10 r%d): %s'%(n,m,r10t[:600])); return False
        rem=[l for l in b10 if l not in b11]; add=[l for l in b11 if l not in b10]
        if not add and rem and all(l[2:60] in p['user'] for l in rem):
            print('ONLY-CTX p%d: %s'%(n,' | '.join(l[:70] for l in rem))); b11=b10
        if b11==b10 and U0: print('U0NORM p%d'%n); U0.clear()
        if b11==b10:
            used[str(n)]=str(m); json.dump(used,open(D+'/r10map.json','w'))
            r=subprocess.run(['bash',R11+'/tools/ra.sh',sid,str(n),str(m)],capture_output=True,text=True,timeout=1200)
            print('auto-answered p%d with r10 r%d'%(n,m), 'ERR '+r.stdout[-300:] if r.returncode else '')
            if r.returncode: return False
            continue
        print('##### DIFF p%d vs r10 p%d (task %s)'%(n,m,p.get('task')))
        for l in difflib.unified_diff(b10,b11,'r10','r11',n=0,lineterm=''): print(l[:1200])
        return False
pos=int(open(D+'/pos').read()) if os.path.exists(D+'/pos') else 0
if not handle(): sys.exit(1)
i=pos+1
while True:
    if str(i)==os.environ.get('STOPCTL'): print('STOPCTL',i); break
    if not os.path.exists(R10+'/'+sid+'/ctl/c%d.json'%i): print('END'); break
    r=subprocess.run(['python3',R11+'/tools/run.py',sid,str(i),str(i)],capture_output=True,text=True,timeout=1800)
    o=r.stdout
    if 'skip exit' in o or 'END at' in o: print('END'); break
    if 'cannot map' in o: print(o[-800:]); sys.exit(1)
    print('c%d: '%i + (re.search(r'EVAL: (.*)',o).group(1)[:300] if re.search(r'EVAL: (.*)',o) else o.split('\n')[0][:200]))
    open(D+'/pos','w').write(str(i))
    if not handle(): sys.exit(1)
    i+=1
