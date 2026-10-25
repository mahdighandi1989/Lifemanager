import json,re,shutil,os
src='/home/user/Lifemanager/apps/learning-architecture/dist/learning-architecture.html'
out='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C/tC1_build/learning-architecture.html'
t=open(src).read()
k='window.SYS_TERR = '; i=t.find(k)+len(k)
dec=json.JSONDecoder(); obj,end=dec.raw_decode(t,i)
sysd=[s for s in obj['systems'] if s['id']=='s_decision'][0]
g=sysd['groups'][0] if 'groups' in sysd else None
print(sysd.keys())
grp=sysd.get('groups') or sysd.get('areas')
g0=grp[0]; a0=g0['areas'][0]; print(list(a0.keys()))
new=json.loads(json.dumps(a0))
new['id']='dc_customer_validation'; new['fa']='اعتبارسنجیِ ایده با مشتری: رفتارِ گذشته، نه نظر'; new['en']='Customer validation of an idea: past behaviour, not opinion'
new['desc_fa']='چطور پیش از ساختن بفهمیم مشتری واقعاً مسئله دارد و پول می‌دهد: پرسیدن از رفتارِ گذشته به‌جای نظر دربارهٔ ایده؛ پیش‌فروش و تعهدِ کوچک به‌عنوانِ نشانه.'
for kk in []:
    if kk in ('about_fa','desc_fa','what_fa'): new[kk]='چطور پیش از ساختن بفهمیم مشتری واقعاً مسئله دارد و پول می‌دهد: پرسیدن از رفتارِ گذشته (آخرین بار کِی…؟ چقدر خرج کردی؟) به‌جای نظر دربارهٔ ایده؛ پیش‌فروش و تعهدِ کوچک به‌عنوانِ نشانه.'
new['key_questions_fa']=['آخرین باری که این مشکل را داشتی کِی بود و چه کردی؟','برای حلش تا حالا چقدر خرج کرده‌ای؟','حاضری الان پیش‌پرداختِ کوچکی بدهی؟']; new['claims']=[]; new['gap_fa']=''
g0['areas'].append(new)
m=json.loads(json.dumps(new)); m['id']='dc_market_sizing'; m['fa']='تخمینِ اندازهٔ بازار از بالا به پایین'; m['en']='Top-down market sizing'; m['desc_fa']='تخمینِ شمارِ مشتریانِ بالقوه و درآمدِ کل از آمارِ کلان (جمعیت × سهم × قیمت)، پیش از ساختن.'; m['key_questions_fa']=['کلِ بازار چند نفر است؟','چه سهمی واقع‌بینانه است؟','درآمدِ سالانه چقدر می‌شود؟']
g0['areas'].insert(0,m)
s=json.dumps(obj,ensure_ascii=False)
t2=t[:i]+s+t[end:]
open(out,'w').write(t2)
nd=os.path.dirname(src)+'/norms'
if not os.path.exists(os.path.dirname(out)+'/norms'): shutil.copytree(nd,os.path.dirname(out)+'/norms')
print('ok',len(t),len(t2))
