#!/usr/bin/env python3
# fin.py sid — judging digest: page (sys) lines of the chat, dossier skeleton, route model summary, mind «از کجا», today
import sys,json,glob,re,os
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26D/'
s=sys.argv[1]; D=R+s; num=lambda f:int(re.findall(r'\d+',os.path.basename(f))[0])
L=int(os.environ.get('L','260'))
seen=[]
for f in sorted(glob.glob(D+'/out/s*.json'),key=num):
    try: r=json.load(open(f))
    except: continue
    for m in r.get('state',{}).get('msgs',[]):
        if m.startswith('sys:') and m not in seen: seen.append(m); print(f'[s{num(f)}]',m[:L])
print('==== DOSSIERS')
for f in sorted(glob.glob(D+'/out/part_dossier_*.txt')):
    t=open(f).read(); i=t.find('فقط‌خواندنی'); t=t[i:]
    print('---',os.path.basename(f),len(t))
    ls=[l for l in t.split('\n') if l.strip()]
    for k,l in enumerate(ls):
        if re.match(r'^[۰-۹]{1,2}:[۰-۹]{2} · ',l) or re.search(r'سرانجام|وضع:|کارِ پیشین|حکم|منتظر|اصلاح شد|کارنامهٔ ذهن:|رویدادِ کارنامه|✓|✗|⏸|🛎',l):
            nx=ls[k+1][:140] if k+1<len(ls) and re.match(r'^[۰-۹]{1,2}:[۰-۹]{2} · ',l) else ''
            print('  ',l[:L],('|| '+nx) if nx else '')
print('==== ROUTE')
for f in sorted(glob.glob(D+'/out/part_route_*.txt')):
    t=open(f).read(); a,_,m=t.partition('=== MODEL ===')
    i=a.find('نقشهٔ مسیر'); print('---',os.path.basename(f)); print(re.sub(r'\n+','\n',a[i:])[-int(os.environ.get('RT','1500')):])
print('==== MIND from')
f=D+'/out/part_mind_from.txt'
if os.path.exists(f):
    t=open(f).read(); i=t.find('چهار مرحلهٔ حل'); print(re.sub(r'\n+','\n',t[i:i+int(os.environ.get('MD','2200'))]) if i>=0 else 'NO «چهار مرحله»: '+t[-800:])
