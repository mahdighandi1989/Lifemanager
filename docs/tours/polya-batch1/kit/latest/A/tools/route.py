import json,os,re,sys
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21A'
sid=sys.argv[1]; D=R+'/'+sid+'/ai'
ns=sorted(int(m.group(1)) for f in os.listdir(D) for m in [re.match(r'p(\d+)\.json$',f)] if m)
for n in ns:
    p=json.load(open(f'{D}/p{n}.json')); u=p['user']; i=u.find('# نوبتِ تازه')
    t=u[i+len('# نوبتِ تازه'):].strip().split('\n')[0] if i>=0 else '(no turn) '+u[-200:].replace('\n',' ')
    heads=[h for h in ('# مسئلهٔ زندهٔ این سشن','# معلمِ حلِ مسئله','# پاسخ به پرسشِ بازنگری','# اصلاحی که صفحه','# مسئلهٔ واقعیِ حل‌نشده','# مربیِ حل','# پس از شکست') if re.search('(?m)^'+re.escape(h),u)]
    rew='REWRITE' if re.search(r'دوباره بنویس|بازنویسی',u[-1500:]) else ''
    print(f'p{n}\t{p.get("task")}\t{rew}\t{t[:110]}\t[{"; ".join(x[2:14] for x in heads)}]')
