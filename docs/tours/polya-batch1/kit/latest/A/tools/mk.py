import sys,json,os,re
D=sys.argv[1]
MK={'knot':r'گره‌گشا','seed':r'🌱|کوچک‌ترین گام','sim':r'شبیه‌ساز','pred':r'پیش‌بینی','today':r'«امروز»|امروز می‌پرسد','factory':r'کارخانه|🏭','review':r'کارتِ مرور','iso':r'هم‌ساختار','guess':r'جعبهٔ حدس|حدس‌های رقیب','inc':r'کنار بگذار تا فردا|فردا','related':r'مسئلهٔ مرتبط','aux':r'مسئلهٔ کمکی','back':r'به عقب'}
n=1
while os.path.exists(f'{D}/out/s{n}.json'):
    o=json.load(open(f'{D}/out/s{n}.json')); st=o.get('state') or {}
    t=(st.get('main') or '')+' '+str(o.get('eval') or '')+' '+str(o.get('eval0') or '')
    hits=[k for k,v in MK.items() if re.search(v,t)]
    c=json.load(open(f'{D}/ctl/c{n}.json'))
    lab=('SAY '+c['say'][:60]) if c.get('say') else ('EV '+str(c.get('eval') or c.get('eval0') or c.get('click') or '')[:60])
    print(f'c{n} view={st.get("view")}/{st.get("sub")} [{",".join(hits)}] {lab}'.replace('\n',' '))
    n+=1
