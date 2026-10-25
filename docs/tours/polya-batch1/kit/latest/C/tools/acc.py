# acc.py sid -> exit 0 if the pending prompt can reuse the mapped r23 reply automatically (same turn-question lines, no correction/prereq-stack/story/wait specials, mapped)
import json,sys,re,glob,os
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid=sys.argv[1]; D=f'{T}/round25C/{sid}'
n=max(int(f.split('/p')[-1][:-5]) for f in glob.glob(D+'/ai/p*.json'))
if os.path.exists(f'{D}/ai/r{n}.txt'): sys.exit(5)
mp=json.load(open(D+'/drv.json')).get('map',{}).get(str(n)) if os.path.exists(D+'/drv.json') else None
if not mp or mp==-1: print('nomap'); sys.exit(1)
u=json.load(open(f'{D}/ai/p{n}.json'))['user']; o=json.load(open(f'{T}/round24C/{sid}/ai/p{mp}.json'))['user']
if not os.path.exists(f'{T}/round24C/{sid}/ai/r{mp}.txt'): print('nor23'); sys.exit(1)
norm=lambda l: re.sub(r'pb_l_[a-z0-9]+|achat_[a-z0-9]+|prc_[a-z0-9]+','X',l)
def tq(u):
    return [norm(l) for l in u.split('\n') if ('**پرسشِ این نوبت همین است:**' in l or 'فقط **یک** پرسش' in l or 'پیشنهادِ این نوبت' in l or 'پرسشِ این نوبت همان یکی است): پرسشِ دیگری' in l or l.startswith('- زمینه (نه پرسشِ دوم): پرسشِ پیشنهادیِ صفحه')) and not l.startswith('- پرسشِ این نوبت: **فقط**')]
if tq(u)!=tq(o): print('tq differs'); sys.exit(2)
bad=[h for h in ['# اصلاحی','⏸','# نتیجهٔ اصلاح','[اصلاحِ پیامِ قبلی]','وارسیِ صفحه پیش از نشان دادنِ پاسخ'] if h in u]
if bad: print('special',bad); sys.exit(3)
m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S); t=m.group(1) if m else ''
if re.search(r'اشتباه|اصلاح|نه،? (\S+ )?(بود|است)|ببخشید',t): print('maybe-correction'); sys.exit(4)
print('ok'); sys.exit(0)
