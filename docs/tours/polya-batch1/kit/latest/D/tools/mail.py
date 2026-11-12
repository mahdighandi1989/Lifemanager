#!/usr/bin/env python3
# mail.py sid — reads <sid>/mail.json {title,mark,res,story,moments[],good[],bad[]} → mail.html + mail.subject.txt
import json,sys
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26D/'
L='https://claude.ai/artifact/89Rq3mP3Vs2CYfJqZPZ75L'
s=sys.argv[1]; m=json.load(open(R+s+'/mail.json'))
ul=lambda xs:'<ul>'+''.join('<li>'+x+'</li>' for x in xs)+'</ul>'
b=f'''<div dir="rtl" style="font-family:Tahoma,sans-serif;line-height:1.8">
<p><b>{m["res"]}</b></p><p>{m["story"]}</p><h3>لحظه‌های کلیدی</h3>{ul(m["moments"])}
<h3>آنچه خوب کار کرد</h3>{ul(m["good"])}<h3>آنچه درست نبود (از چشمِ خودش)</h3>{ul(m["bad"]) if m["bad"] else "<p>در این سناریو چیزِ نادرستی دیده نشد.</p>"}
<p>تصویرنامهٔ گام‌به‌گام: <a href="{L}">{L}</a></p></div>'''
open(R+s+'/mail.html','w').write(b)
open(R+s+'/mail.subject.txt','w').write(f'🧭 پولیا · دورِ ۲۶ · {s} · {m["title"]} · {m["mark"]}')
print(open(R+s+'/mail.subject.txt').read()); print(b)
