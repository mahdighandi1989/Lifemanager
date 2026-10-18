#!/usr/bin/env python3
"""Storyboard of one tour group: every step's screenshot with what happened in it, for the owner to watch and comment.
usage: storyboard.py <round-group-dir> <out-dir> <title>   (e.g. tour1_polya/round15A /tmp/.../sb15A "دورِ ۱۵ · گروهِ A")"""
import hashlib, html, json, os, re, sys
from PIL import Image

src, out, title = sys.argv[1], sys.argv[2], sys.argv[3]
T = os.path.dirname(os.path.abspath(src.rstrip('/')))
SC = {s['id']: s for s in json.load(open(os.path.join(T, 'scenarios.json')))['scenarios']} if os.path.exists(os.path.join(T, 'scenarios.json')) else {}
os.makedirs(os.path.join(out, 'img'), exist_ok=True)
E = lambda s: html.escape(str(s or ''))


def action(ctl):
    if not ctl: return ''
    if ctl.get('say'): return ''
    ev = ' '.join(str(ctl.get(k) or '') for k in ('eval', 'eval0', 'js', 'click'))
    fills = re.findall(r'F\("(\w+)",\s*"((?:[^"\\]|\\.)*)"\)', ev)
    sels = re.findall(r'S\("(\w+)",\s*"((?:[^"\\]|\\.)*)"\)', ev)
    clicks = re.findall(r'(?:click|C)\(\s*["\']([^"\']+)["\']', ev)
    bits = ['«%s» ← %s' % (f, v.encode().decode('unicode_escape', 'ignore') if '\\u' in v else v) for f, v in fills]
    bits += ['انتخابِ «%s» = %s' % (f, v) for f, v in sels]
    bits += ['کلیک روی %s' % c for c in clicks]
    if not bits and False:
        bits = ['«%s»' % q for q in re.findall(r'["\']([^"\']*[\u0600-\u06FF][^"\']*)["\']', ev)][:6]
    return ' · '.join(bits)[:600] or 'کار روی صفحه (فرم/دکمه)'


def scen(d):
    sid = os.path.basename(d.rstrip('/'))
    outd, ctld = os.path.join(d, 'out'), os.path.join(d, 'ctl')
    if not os.path.isdir(outd): return ''
    steps = sorted({int(m.group(1)) for f in os.listdir(outd) for m in [re.match(r's(\d+)\.png$', f)] if m})
    base = sid.split('_')[0][:3]
    meta = SC.get(base, {})
    fnd = os.path.join(d, 'findings.md')
    plain = ''
    if os.path.exists(fnd):
        t = open(fnd).read()
        m = re.search(r'##\s*خلاصه[^\n]*\n(.*?)(?:\n##|\Z)', t, re.S)
        res = re.search(r'RESULT:\s*([^\n]+)', t)
        plain = (m.group(1).strip() if m else '') or ''
        verdict = res.group(1) if res else ''
    else:
        verdict = ''
    v = verdict
    ok = bool(v) and 'PASS' in v and not re.search(r'FAIL|PARTIAL', v) and (
        bool(re.search(r'zero.?defect|no defect|بی.?ایراد|صفر.?ایراد', v, re.I)) or not re.search(r'\bS[123]\b|defect|ایراد', v, re.I))
    STAT.append((sid, meta.get('domain_fa', ''), ok, bool(v)))
    prev, seen, cards = [], set(), []
    for c in steps:
        st = {}
        try: st = json.load(open(os.path.join(outd, 's%d.json' % c))).get('state') or {}
        except Exception: pass
        msgs = st.get('msgs') or []
        new = msgs[len(prev):] if msgs[:len(prev)] == prev else msgs[-2:]
        prev = msgs
        ctl = None
        try: ctl = json.load(open(os.path.join(ctld, 'c%d.json' % c)))
        except Exception: pass
        png = os.path.join(outd, 's%d.png' % c)
        h = hashlib.md5(open(png, 'rb').read()).hexdigest()
        act = action(ctl)
        mut = bool(ctl) and (bool(ctl.get('say')) or bool(re.search(r'\b(?:F|S|C|click|fill|APP\.go|selectOption|\.click\(|\.value\s*=)\b', json.dumps(ctl, ensure_ascii=False))))
        if not new and not mut: continue   # the runner's own inspection probes are not steps of the story
        if h in seen and not new: continue
        seen.add(h)
        name = '%s_%d.jpg' % (sid, c)
        im = Image.open(png).convert('RGB'); w = 960
        im.resize((w, int(im.height * w / im.width))).save(os.path.join(out, 'img', name), quality=58, optimize=True)
        lines = []
        if act: lines.append('<p class="act">🖱 %s</p>' % E(act))
        for m in new:
            who, _, txt = str(m).partition(': ')
            cls = {'user': 'u', 'ai': 'a', 'sys': 's'}.get(who, 's')
            lab = {'u': 'کاربر', 'a': 'دستیار', 's': 'صفحه'}[cls]
            lines.append('<p class="m %s"><b>%s:</b> %s</p>' % (cls, lab, E(txt)))
        if not lines: lines.append('<p class="s">(بدونِ پیامِ تازه — نمای صفحه)</p>')
        pg = os.path.join(outd, 's%d_page.png' % c); extra = ''
        if os.path.exists(pg):
            n2 = '%s_%d_page.jpg' % (sid, c); im2 = Image.open(pg).convert('RGB')
            im2.resize((w, int(im2.height * w / im2.width))).save(os.path.join(out, 'img', n2), quality=58, optimize=True)
            extra = '<img loading="lazy" src="img/%s" alt="گام %d — صفحه">' % (n2, c)
        cards.append('<figure id="%s-%d"><figcaption><span class="n">گام %d</span>%s</figcaption><div class="shots"><img loading="lazy" src="img/%s" alt="گام %d">%s</div></figure>'
                     % (sid, c, c, ''.join(lines), name, c, extra))
    VN = {'mind': '🧠 کارنامهٔ ذهن (سنجشِ توانایی‌ها، روند، خطِ زمانی)', 'maps': '🗺 نقشه‌ها', 'today': 'امروز'}
    eff = []
    for v, lab in VN.items():
        pair = []
        for tag, tl in (('pre', 'پیش از سناریو'), ('post', 'پس از سناریو')):
            f = os.path.join(outd, 'view_%s_%s.png' % (tag, v))
            if os.path.exists(f):
                n3 = '%s_view_%s_%s.jpg' % (sid, tag, v); im3 = Image.open(f).convert('RGB'); w3 = 760
                im3.resize((w3, int(im3.height * w3 / im3.width))).save(os.path.join(out, 'img', n3), quality=55, optimize=True)
                pair.append('<figure class="v"><figcaption>%s</figcaption><img loading="lazy" src="img/%s" alt="%s — %s"></figure>' % (tl, n3, lab, tl))
        if pair:
            eff.append('<div class="eff"><h3>%s</h3><div class="pp">%s</div></div>' % (lab, ''.join(pair)))
    effh = ('<section class="effs"><h3 class="et">اثرِ این سناریو بر کارنامه، نقشه‌ها و «امروزِ» آدمِ سناریو (دادهٔ ساختگیِ آزمون، نه دادهٔ تو)</h3>%s</section>' % ''.join(eff)) if eff else ''
    parts = []
    for f in sorted(os.listdir(outd)) if os.path.isdir(outd) else []:
        if f.startswith('part_') and f.endswith('.png'):
            n4 = '%s_%s.jpg' % (sid, f[:-4]); im4 = Image.open(os.path.join(outd, f)).convert('RGB'); w4 = 760
            im4.resize((w4, int(im4.height * w4 / im4.width))).save(os.path.join(out, 'img', n4), quality=55, optimize=True)
            nm = f[5:-4].rsplit('_', 1)[0]
            parts.append('<figure class="v"><figcaption>%s</figcaption><img loading="lazy" src="img/%s" alt="بخشِ %s"></figure>' % (E(nm), n4, E(nm)))
    if parts:
        effh += '<section class="effs"><h3 class="et">🧩 بخش‌هایی که این سناریو از آن‌ها گذشت — هر بخش در حینِ کار</h3><div class="pp">%s</div></section>' % ''.join(parts)
    head = '%s — %s' % (sid, meta.get('domain_fa', ''))
    who = meta.get('persona', '')
    badge = '<span class="b ok">بی‌ایراد</span>' if ok else ('<span class="b warn">ایراد دارد</span>' if verdict else '')
    return ('<details class="sc" id="%s"><summary><h2>%s %s</h2><p class="who">%s</p></summary>%s<div class="steps">%s</div>%s</details>'
            % (sid, E(head), badge, E(who), ('<div class="plain">%s</div>' % E(plain).replace('\n', '<br>')) if plain else '', ''.join(cards), effh))


STAT = []
def _sk(x):  # sNN first, then the round's extra scenarios (prerequisite, age, territory, owner-like) in name order
    return (0 if re.match(r's\d\d$', x) else 1, x)
secs = [scen(os.path.join(src, x)) for x in sorted(os.listdir(src), key=_sk) if re.match(r'(s\d\d|[a-z]{1,2}[A-D]?\d{1,2})$', x) and os.path.isdir(os.path.join(src, x)) and os.path.exists(os.path.join(src, x, 'findings.md'))]
nok = sum(1 for x in STAT if x[2]); 
GRP = (re.search(r'گروهِ ([ABCD])', title) or [None, ''])[1]
NAVL = {'A': ('s01–s10', 'https://claude.ai/artifact/91WEMispzw9gyGiD4L1n4c'), 'B': ('s11–s20', 'https://claude.ai/artifact/5vnriuMia1ma8oLZMZfVja'), 'C': ('s21–s29', 'https://claude.ai/artifact/5YqS7HGgerCJwWmjomWJ4f'), 'D': ('s30–s38', 'https://claude.ai/artifact/89Rq3mP3Vs2CYfJqZPZ75L')}
navh = ('<nav class="grp">' + ''.join(('<b>گروهِ %s (%s)</b>' % (g, r)) if g == GRP else ('<a href="%s" target="_blank" rel="noopener">گروهِ %s (%s) ↗</a>' % (u, g, r)) for g, (r, u) in NAVL.items()) + '</nav>')
def mdtable(t):
    rows = [l for l in t.splitlines() if l.strip().startswith('|')]
    o, h = [], True
    for l in rows:
        cells = [c.strip() for c in l.strip().strip('|').split('|')]
        if all(re.match(r'^:?-+:?$', c) for c in cells if c): h = False; continue
        tag = 'th' if h else 'td'
        o.append('<tr>%s</tr>' % ''.join('<%s>%s</%s>' % (tag, E(c), tag) for c in cells))
    rest = '\n'.join(l for l in t.splitlines() if not l.strip().startswith('|')).strip()
    return ('<table class="parts">%s</table>' % ''.join(o) if o else '') + ('<div class="plain">%s</div>' % E(rest).replace('\n', '<br>') if rest else '')
PF = os.path.join(src, 'PARTS.md')
partsh = ('<details class="sc" id="parts"><summary><h2>🧩 بخش‌ها — داوریِ پنج‌جهتی (هدف، کارکرد، کیفیت، دو تشنگی، ضرورت)</h2></summary>%s</details>' % mdtable(open(PF).read())) if os.path.exists(PF) else ''
summary = navh + ('<div class="sum"><p><b>%d از %d سناریو بی‌ایراد</b> · بقیه ایراد دارند (جزئیات در هر سناریو).</p><ul>%s</ul></div>' % (nok, len(STAT),
    ''.join('<li><a href="#%s">%s</a> %s <span class="b %s">%s</span></li>' % (sid, sid, E(dom), 'ok' if ok else 'warn', 'بی‌ایراد' if ok else ('ایراد دارد' if has else 'بی‌داوری')) for sid, dom, ok, has in STAT)))
CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'storyboard.css')).read()
page = ('<title>%s</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;800&display=swap">\n<style>%s</style>\n'
        '<main dir="rtl"><header><h1>%s</h1><p>هر سناریو را باز کن: گام‌به‌گام همان صفحه‌ای را می‌بینی که آدمِ سناریو دید، با پیامی که نوشت و پاسخی که گرفت. '
        'هر جا نکته‌ای داشتی، همین‌جا روی صفحه نظر بگذار یا در گفت‌وگو بگو — پیش از دورِ بعد اعمال می‌شود.</p>%s</header>%s</main>') % (E(title), CSS, E(title), summary, partsh + ''.join(secs))
open(os.path.join(out, 'index.html'), 'w').write(page)
print(out, len(os.listdir(os.path.join(out, 'img'))), 'images')
