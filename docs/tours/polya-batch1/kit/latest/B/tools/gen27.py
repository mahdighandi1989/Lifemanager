#!/usr/bin/env python3
"""gen27.py sid : build findings.md, routing.md, mail.html, mail.subject.txt from <sid>/f.json (authored by the runner) + auto tables"""
import json,os,sys,subprocess,html,re
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27B'
SETUP=("Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + "
"page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver "
"tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; "
"every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model "
"from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. "
"Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md "
"(B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).")
def sh(c): return subprocess.run(c,shell=True,capture_output=True,text=True,cwd=B).stdout.strip()
s=sys.argv[1]; D=f'{B}/{s}'; F=json.load(open(f'{D}/f.json'))
routing=sh(f'python3 tools/route.py {s}'); open(f'{D}/routing.md','w').write(routing+'\n')
bad=routing.count('| ✗ |'); tot=routing.count('| ✓ |')+bad
scan=sh(f'python3 tools/strict.py {s}/ai/p*.json') or 'clean'
g=lambda k,d='—': F.get(k) or d
out=f"""# {s} — {F['title']} — ROUND 27 (runner B)

## خلاصه برای مالک
{F['summary']}

## Run setup (common, runner B round 27)
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

## Arms (RUNNER27 T1–T12) in this scenario
{g('arms','- none of T1–T12 is hosted here')}

## 📜 line match (multi-problem only)
{g('scroll','- single problem — not applicable')}

## Prior work
{g('prior','- no prior-work opening here; no prior block fired where it should not')}

## Chat ⇄ page
{g('chatpage','—')}

## Owner bank (this scenario)
{g('bank','—')}

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
{g('r26','- (none)')}

## Routing ({tot-bad}/{tot} correct)
{routing}

Strict prompt scan: {scan if scan!='clean' else 'clean (no second unmarked question directive in any prompt)'}

## ارتقای لازم
{g('upgrades','- (none beyond the defect fixes)')}

## ایده‌ها
{g('ideas','- (none new)')}
{F.get('extra','')}
## Defects (catalogue round27B/defects.md)
{g('defects','- (none)')}

RESULT: {F['result']}
"""
open(f'{D}/findings.md','w',encoding='utf-8').write(out); open(f'{D}/findings.md',encoding='utf-8').read()
M=F['mail']; ok=F['result'].startswith('PASS'); e=html.escape
li=lambda L:''.join(f'<li>{e(x)}</li>' for x in L)
mom=''.join(f'<li><b>او نوشت:</b> «{e(a)}»<br><b>دستیار:</b> «{e(b)}»<br><b>صفحه:</b> {e(c)}</li>' for a,b,c in M['moments'])
h=f"""<div dir="rtl" style="font-family:Tahoma,Vazirmatn,sans-serif;line-height:1.9;font-size:15px">
<p><b>{e(M['line'])}</b></p>
<p><b>ماجرا:</b> {e(M['story'])}</p>
<p><b>لحظه‌های کلیدی</b></p><ol>{mom}</ol>
<p><b>آنچه خوب کار کرد</b></p><ul>{li(M['good'])}</ul>
<p><b>آنچه درست نبود</b> (از نگاهِ خودِ او: چه دید، چرا بد است، چه باید می‌دید)</p><ul>{li(M['bad']) if M['bad'] else '<li>در این اجرا ایرادی دیده نشد.</li>'}</ul>
<p><b>نسبت به دورِ ۲۶:</b> {e(M['delta'])}</p>
<p><b>بعدش چه می‌شود:</b> {e(M.get('next','ایرادها به فهرستِ اصلاحِ دورِ ۲۷ می‌رود و همین سناریو دوباره اجرا می‌شود.'))}</p>
<p>تصویرنامهٔ گام‌به‌گام: <a href="https://claude.ai/artifact/5vnriuMia1ma8oLZMZfVja">https://claude.ai/artifact/5vnriuMia1ma8oLZMZfVja</a></p>
<p style="color:#777;font-size:12px">برای ناظر: گروهِ B · {s} · round27B/{s}/findings.md</p></div>"""
open(f'{D}/mail.html','w').write(h)
open(f'{D}/mail.subject.txt','w').write(f"🧭 پولیا · دورِ ۲۷ · {s} · {M['subj']} · {'✅' if ok else '⚠️'}")
print(s,'findings',len(out),'routing',f'{tot-bad}/{tot}','scan',scan[:200])
