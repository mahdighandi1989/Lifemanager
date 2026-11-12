import json,sys,os,re
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A'
s=sys.argv[1]; D=f'{R}/{s}/ai'; a=int(sys.argv[2]) if len(sys.argv)>2 else 1; b=int(sys.argv[3]) if len(sys.argv)>3 else 999
HE=("# کارِ پیشین","# حسابِ صفحه","# دو مسئله","# اصلاحی که صفحه","# نتیجهٔ صفحه","# تاریخِ خودش","# بستنِ مسئله")
ns=sorted(int(m.group(1)) for f in os.listdir(D) for m in [re.match(r'p(\d+)\.json',f)] if m)
for n in ns:
    if n<a or n>b: continue
    p=json.load(open(f'{D}/p{n}.json')); u=p['user']; i=u.find('# نوبتِ تازه'); t=u[i+13:i+13+140].replace('\n',' ') if i>=0 else '(no turn)'
    heads=[h[:38] for h in re.findall(r'(?m)^# .*',u) if h.startswith(HE)]
    st=re.search(r'(?m)^# وضعِ کنونی[^\n]*\n([^\n]*)',u); lv=re.search(r'مرحله: ([^\n·|]*)',u)
    tq=[m.group(0)[:230] for m in re.finditer(r'(?m)^.*(\*\*یک\*\* پرسش|پرسشِ این نوبت همین|\*\*پرسشِ این نوبت).*$',u)]
    tq=[re.sub(r'^.*?(«)',r'\1',x) for x in tq]
    print(f'p{n} [{p.get("task")[4:]}] U: {t}\n   heads={heads} stage={lv.group(1).strip() if lv else "-"}\n   TQ: {" || ".join(tq)[:330]}')
    if len(sys.argv)>4:
        r=open(f'{D}/r{n}.txt').read() if os.path.exists(f'{D}/r{n}.txt') else ''
        try: j=json.loads(r); print('   A:',j.get('reply','')[:300])
        except Exception: print('   A(raw):',r[:200])
