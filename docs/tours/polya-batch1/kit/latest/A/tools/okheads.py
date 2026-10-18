import sys,ast,os,json
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A'
l=sys.stdin.read().strip()[len('NEWHEADS: '):]
h=ast.literal_eval(l)
OK=['# نتیجهٔ صفحه از نوبتِ پیش','# پرونده‌های تمرینِ باز','# مرحلهٔ خطا از حرفِ خودش','# برنامه‌های بازِ خودش (شناسه‌ها)','# برنامه‌های بازِ خودش','# فهرست‌های جاری','# پیام‌های اخیرِ صفحه','# اصلاحِ پیامِ پیشین (شاید)','# فرمول (زمینه']
if not os.environ.get('MINOR'): OK.append('# مخاطب')
pre_ok=False
if len(sys.argv)>2:
    u=json.load(open(f'{R}/{sys.argv[1]}/ai/p{sys.argv[2]}.json'))['user']
    i=u.find('# پیش‌نیاز (')
    if i>=0:
        blk=u[i:].split('\n\n')[0].strip().split('\n')
        pre_ok = len(blk)==2
    if os.environ.get('MINOR')=='' and '# مخاطب' in u: pass
OK2=tuple(OK)+(('# پیش‌نیاز (',) if pre_ok else ())
sys.exit(0 if all(x.startswith(OK2) for x in h) else 1)
