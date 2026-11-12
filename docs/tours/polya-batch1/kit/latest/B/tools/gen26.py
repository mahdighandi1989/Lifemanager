#!/usr/bin/env python3
"""gen26.py sid : build findings.md, routing.md, mail.html, mail.subject.txt from <sid>/f.json (authored by the runner) + auto tables"""
import json,os,sys,subprocess,html,re
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B'
SETUP=("Page main 1f93c333 (round-25 fixes; `build.py --check` in sync). Harness round26B/tools/harness26bm.js (harness5 + page URL from env for the "
"territory scratch pages; own browser profile per scenario dir, PIDs in round26B/pids.txt). Driver tools/drv26bm.py replays round25B/<sid>/ctl; replies: "
"round-25 replies rebuilt from docs/tours/dataset (s11–s20, bp1–bp3) are reused when HER turn text matches; every other reply (all of aB*, tB*, oB1, pwB*, "
"and every new round-26 turn) was written this round as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date "
"shift (inject.js __adv). Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. "
"Strict prompt scan (tools/strict.py): see below. Defect ids: round26B/defects.md (B26·Dn), round25B/defects.md (B25·Dn).")
def sh(c): return subprocess.run(c,shell=True,capture_output=True,text=True,cwd=B).stdout.strip()
s=sys.argv[1]; D=f'{B}/{s}'; F=json.load(open(f'{D}/f.json'))
routing=sh(f'python3 tools/route.py {s}'); open(f'{D}/routing.md','w').write(routing+'\n')
bad=routing.count('| ✗ |'); tot=routing.count('| ✓ |')+bad
scan=sh(f'python3 tools/strict.py {s}/ai/p*.json') or 'clean'
g=lambda k,d='—': F.get(k) or d
out=f"""# {s} — {F['title']} — ROUND 26 (runner B)

## خلاصه برای مالک
{F['summary']}

## Run setup (common, runner B round 26)
{SETUP}

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
{F['criteria']}

## نقشهٔ نیاز
{F['needs']}

## پیش‌نیاز
{g('prereq','No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.')}

## آزمودنِ اصلاح
{g('corr','No new correction trial here (round-25 trials, where present, replayed — see criteria).')}

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
{g('arith','No arithmetic of hers for the page to check in this run.')}

## سن
{g('age')}

## Round-25 defects in this scenario (FIXED | STILL | CHANGED)
{g('r25','- (none)')}

## Routing ({tot-bad}/{tot} correct)
{routing}

Strict prompt scan: {scan if scan!='clean' else 'clean (no second unmarked question directive in any prompt)'}

## ارتقای لازم
{g('upgrades','- (none beyond the defect fixes)')}

## ایده‌ها
{g('ideas','- (none new)')}
{F.get('extra','')}
## Defects (catalogue round26B/defects.md)
{g('defects','- (none)')}

RESULT: {F['result']}
"""
open(f'{D}/findings.md','w').write(out)
M=F['mail']; ok=F['result'].startswith('PASS'); e=html.escape
li=lambda L:''.join(f'<li>{e(x)}</li>' for x in L)
mom=''.join(f'<li><b>او نوشت:</b> «{e(a)}»<br><b>دستیار:</b> «{e(b)}»<br><b>صفحه:</b> {e(c)}</li>' for a,b,c in M['moments'])
h=f"""<div dir="rtl" style="font-family:Tahoma,Vazirmatn,sans-serif;line-height:1.9;font-size:15px">
<p><b>{e(M['line'])}</b></p>
<p><b>ماجرا:</b> {e(M['story'])}</p>
<p><b>لحظه‌های کلیدی</b></p><ol>{mom}</ol>
<p><b>آنچه خوب کار کرد</b></p><ul>{li(M['good'])}</ul>
<p><b>آنچه درست نبود</b> (از نگاهِ خودِ او: چه دید، چرا بد است، چه باید می‌دید)</p><ul>{li(M['bad']) if M['bad'] else '<li>در این اجرا ایرادی دیده نشد.</li>'}</ul>
<p><b>نسبت به دورِ ۲۵:</b> {e(M['delta'])}</p>
<p><b>بعدش چه می‌شود:</b> {e(M.get('next','ایرادها به فهرستِ اصلاحِ دورِ ۲۶ می‌رود و همین سناریو دوباره اجرا می‌شود.'))}</p>
<p>تصویرنامهٔ گام‌به‌گام: <a href="https://claude.ai/artifact/5vnriuMia1ma8oLZMZfVja">https://claude.ai/artifact/5vnriuMia1ma8oLZMZfVja</a></p>
<p style="color:#777;font-size:12px">برای ناظر: گروهِ B · {s} · round26B/{s}/findings.md</p></div>"""
open(f'{D}/mail.html','w').write(h)
open(f'{D}/mail.subject.txt','w').write(f"🧭 پولیا · دورِ ۲۶ · {s} · {M['subj']} · {'✅' if ok else '⚠️'}")
print(s,'findings',len(out),'routing',f'{tot-bad}/{tot}','scan',scan[:200])
