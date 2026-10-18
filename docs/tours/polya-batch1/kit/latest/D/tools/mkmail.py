import json,html,sys
L='https://claude.ai/artifact/89Rq3mP3Vs2CYfJqZPZ75L'
M=json.load(open('mails/src.json'))
for sid,m in M.items():
    def ul(xs): return '<ul>'+''.join('<li>'+x+'</li>' for x in xs)+'</ul>'
    b=f'''<div dir="rtl" style="font-family:Tahoma,sans-serif;line-height:1.8">
<p><b>{m["res"]}</b></p><p>{m["story"]}</p><h3>لحظه‌های کلیدی</h3>{ul(m["moments"])}
<h3>آنچه خوب کار کرد</h3>{ul(m["good"])}<h3>آنچه درست نبود (از چشمِ خودش)</h3>{ul(m["bad"]) if m["bad"] else "<p>در این سناریو چیزِ تازه‌ای دیده نشد.</p>"}
<p>تصویرنامهٔ گام‌به‌گام: <a href="{L}">{L}</a></p></div>'''
    open(f'mails/{sid}.html','w').write(b)
    open(f'mails/{sid}.subj','w').write(f'🧭 پولیا · دورِ ۲۳ · {sid} · {m["title"]} · {m["mark"]}')
print('ok',len(M))
