# mail.py sid (stdin JSON: {"title","ok":bool,"result","story","moments":[[she,assistant,page]],"good":[],"bad":[[saw,why,should]],"next"}) -> <sid>/mail.html + mail.subject.txt
import sys,json,html
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26C'
sid=sys.argv[1]; p=json.loads(sys.stdin.read()); e=html.escape
LINK='https://claude.ai/artifact/5YqS7HGgerCJwWmjomWJ4f'
h=['<div dir="rtl" style="font-family:Tahoma,Vazirmatn,sans-serif;font-size:14px;line-height:1.9;text-align:right">']
h.append('<p><b>%s %s</b></p>'%('✅' if p['ok'] else '⚠️',e(p['result'])))
h.append('<p><b>ماجرا:</b> %s</p>'%e(p['story']))
h.append('<p><b>لحظه‌های کلیدی</b></p><ol>')
for m in p['moments']:
    h.append('<li>او نوشت: «%s»<br>دستیار: «%s»<br>صفحه: %s</li>'%(e(m[0]),e(m[1]),e(m[2])))
h.append('</ol><p><b>آنچه خوب کار کرد</b></p><ul>'+''.join('<li>%s</li>'%e(x) for x in p['good'])+'</ul>')
if p.get('bad'):
    h.append('<p><b>آنچه درست نبود</b></p><ul>'+''.join('<li><b>چه دید:</b> %s<br><b>چرا بد است:</b> %s<br><b>چه باید می‌دید:</b> %s</li>'%(e(b[0]),e(b[1]),e(b[2])) for b in p['bad'])+'</ul>')
else: h.append('<p><b>آنچه درست نبود:</b> در این سناریو نقصی ندیدم.</p>')
h.append('<p><b>بعدش:</b> %s</p>'%e(p.get('next','')))
h.append('<p>تصویرنامهٔ گام‌به‌گام: <a href="%s">%s</a></p></div>'%(LINK,LINK))
open(f'{R}/{sid}/mail.html','w').write('\n'.join(h))
subj='🧭 پولیا · دورِ ۲۶ · %s · %s · %s'%(sid,p['title'],'✅' if p['ok'] else '⚠️')
open(f'{R}/{sid}/mail.subject.txt','w').write(subj); print(subj); print(len('\n'.join(h)))
