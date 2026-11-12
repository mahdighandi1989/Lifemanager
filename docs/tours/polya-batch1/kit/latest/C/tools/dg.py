# dg.py sid N [full|page|blk:<header-substring>] -> minimal digest of prompt pN
import sys,json,re,os
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26C'
sid,n=sys.argv[1],sys.argv[2]; mode=sys.argv[3] if len(sys.argv)>3 else ''
W=int(os.environ.get('W','300'))
j=json.load(open(f'{R}/{sid}/ai/p{n}.json')); u=j['user']
print(f'### AI {sid} p{n} {j.get("task")}')
SHOW=('پیگیریِ برنامهٔ','کارِ پیشین','اصلاح','حساب','کمبود','ابزار','دو مسئله','مسئلهٔ دیگر','نتیجهٔ صفحه','منتظر','پیش‌بینی','تاریخ','موعدِ','برگهٔ','پاسخِ روتین','ثبت‌های تازه','مسئله‌های این','بازگشت','جمعه')
QUIET=('# نقشهٔ سامانه','# برگه‌های باز','# فرمول','# فهرست‌های جاری','# 🔭 مسئلهٔ حل‌نشدهٔ خودم (قاعدهٔ','# پرونده‌های تمرین','# حافظهٔ','# گزارشِ وضع','# 🧭 نقشهٔ مسیرِ','# سشن','# گفت‌وگو تا','# غربالِ','# برنامه‌های بازِ خودش','# کارنامهٔ ذهن','# سنجشِ استاندارد','# مرحلهٔ خطا','# ضمیرِ','# پیام‌های اخیر','# موعدهای کاربر','# دانسته‌های قلمرو')
others=[]
for pt in re.split(r'(?m)^(?=# )',u):
    h=pt.split('\n',1)[0]
    if not h.startswith('# '): continue
    body=[l for l in pt.split('\n')[1:] if l.strip()]
    if h.startswith('# نوبتِ تازه'): print('TURN:',pt[len(h):].strip()[:int(os.environ.get('TW','900'))]); continue
    if mode=='full': print(pt[:9000]); continue
    if mode.startswith('blk:'):
        if mode[4:] in h: print(pt[:7000])
        continue
    if h.startswith('# امروز'): print('[امروز]',' '.join(body)[:26]); continue
    if h.startswith('# مخاطب'): print('[مخاطب]',(body[0] if body else '')[:90]); continue
    if h.startswith('# برگه‌های باز'):
        if 'هیچ برگهٔ' not in pt: print('[برگه‌ها]',' '.join(re.findall(r'#\d+',pt)),' '.join(re.findall(r'\[(open|answered|approved)',pt)))
        continue
    if h.startswith('# پیش‌نیاز (کمبود'):
        ex=[l for l in body if not l.startswith('- زمینه (نه پرسشِ دوم): اگر حرفِ همین پیامش نشان')]
        for l in ex: print('  PRQ:',l.replace('- زمینه (نه پرسشِ دوم): ','')[:150])
        continue
    if h.startswith('# صفحهٔ فعلی'):
        print('[صفحه]',(body[0] if body else '')[:90])
        if mode=='page': print(pt[:5000])
        continue
    if h.startswith('# وضعِ کنونی'): print('[وضع]',(body[0] if body else '')[26:240]); continue
    if h.startswith('# مسئلهٔ زنده'):
        m=re.search(r'مرحله: ([^·]*)',h); print('[زنده] مرحله:',m.group(1) if m else h[:80])
        for l in body:
            if 'فقط **یک** پرسش' in l:
                m=re.search(r'«(.*)»\. اگر با وضعِ',l); print('  Q1:',(m.group(1) if m else l)[:520])
            elif l.startswith(('- پیش از «حل شد»','- بخش‌هایی از شرط')) or any(k in l for k in ('کارِ پیشین','منتظرِ برگه','کهنه')): print('   ',l[:W])
        continue
    if h.startswith('# مربیِ حل'):
        m=re.search(r'مرحلهٔ محتمل: ([^·—]*)',h); print('[مربی] مرحلهٔ محتمل:',m.group(1) if m else '')
        for l in body:
            if '**پرسشِ این نوبت همین است:**' in l: print('  QB:',l[l.find('**پرسشِ این نوبت همین است:**')+29:][:520])
            elif 'پیشنهادِ این نوبت:' in l and not any('**پرسشِ این نوبت همین است:**' in x for x in body) and not re.search(r'# مسئلهٔ زنده',u):
                m=re.search(r'پیشنهادِ این نوبت:[^.]*',l); print('  QL:',m.group(0)[18:260] if m else '')
            elif any(k in l for k in ('کارِ پیشین','prior')): print('   ',l[:W+200])
        continue
    if h.startswith(QUIET): continue
    if h.startswith('# اصلاحِ پیامِ پیشین (شاید)'): print('[شایدِ اصلاح]'); continue
    if any(k in h for k in SHOW) or mode=='all':
        print('>>',h[:160])
        for l in body:
            if h.startswith('# کارِ پیشینِ تو (حکمِ'):
                l2=l.replace('- زمینه (نه پرسشِ دوم): ','')
                if l2.startswith('کارِ پیشینِ تو:'): print('   ',l2[:200])
                elif l2.startswith('گامِ'):
                    i=l2.find(' · ',8); tail=l2[i:] if (i>0 and re.search('متنِ تازه|منتظر|دوباره سنج|رد کرد|اصلاح|وابسته|تأییدِ',l2[i:])) else ''
                    if tail or os.environ.get('LED'): print('   ',l2[:34]+' … '+tail[-260:])
                continue
            print('   ',l[:W+260])
    else: others.append(h[2:40])
if others: print('[بلوک‌های دیگر]',' ; '.join(others))
