#!/usr/bin/env python3
# mkmail27.py sid spec.json — writes <sid>/mail.html + mail.subject.txt from a small spec:
# {"title":"…","ok":false,"result":"…","story":"…","moments":[["her","ai","page"],…],"good":[…],"bad":[["she saw","why bad","should"],…],"next":"…"}
import json,sys,html
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27D'
s=sys.argv[1]; sp=json.load(open(sys.argv[2],encoding='utf-8'))
E=html.escape
subj=f"🧭 پولیا · دورِ ۲۷ · {s} · {sp['title']} · {'✅' if sp.get('ok') else '⚠️'}"
h=['<div dir="rtl" style="font-family:Tahoma,sans-serif;line-height:1.8">',f"<p><b>{'✅' if sp.get('ok') else '⚠️'} {E(sp['result'])}</b></p>",f"<p>{E(sp['story'])}</p>","<h3>لحظه‌های کلیدی</h3><ul>"]
for m in sp['moments']:
    parts=[]
    if m[0]: parts.append(f"نوشت: «{E(m[0])}»")
    if len(m)>1 and m[1]: parts.append(f"دستیار: «{E(m[1])}»")
    if len(m)>2 and m[2]: parts.append(f"صفحه: {E(m[2])}")
    h.append('<li>'+' — '.join(parts)+'</li>')
h.append('</ul><h3>آنچه خوب کار کرد</h3><ul>'+''.join(f'<li>{E(x)}</li>' for x in sp['good'])+'</ul>')
h.append('<h3>آنچه درست نبود (از چشمِ خودِ او)</h3><ul>'+''.join(f'<li>{E(a)} — چرا بد است: {E(b)} — باید می‌دید: {E(c)}</li>' for a,b,c in sp['bad'])+'</ul>' if sp['bad'] else '<h3>آنچه درست نبود</h3><p>چیزی ندیدم.</p>')
h.append(f"<h3>بعد چه می‌شود</h3><p>{E(sp.get('next','ایرادها به اصلاح‌گرها می‌رود و دورِ بعد دوباره همین سناریو اجرا می‌شود.'))}</p>")
h.append('<p>تصویرنامهٔ گام‌به‌گام: <a href="https://claude.ai/artifact/89Rq3mP3Vs2CYfJqZPZ75L">https://claude.ai/artifact/89Rq3mP3Vs2CYfJqZPZ75L</a></p>')
h.append(f'<p style="color:#888;font-size:12px">برای ناظر: round27D/{s}/findings.md</p></div>')
open(f'{B}/{s}/mail.html','w',encoding='utf-8').write('\n'.join(h)); open(f'{B}/{s}/mail.subject.txt','w',encoding='utf-8').write(subj); print(subj)
