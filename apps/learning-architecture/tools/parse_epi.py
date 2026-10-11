# Parse the booklet HTML into (1) per-chapter plain texts for study, (2) a JS data file with the embedded scoped booklet.
import re, json, os, sys
from bs4 import BeautifulSoup, NavigableString, Tag
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(B, 'epi/raw/booklet.html'), encoding='utf-8').read()
soup = BeautifulSoup(src, 'html.parser')
css = soup.find('style').string
bk = soup.find('div', class_='bk')
FA = '۰۱۲۳۴۵۶۷۸۹'
def todig(s): return int(''.join(str(FA.index(c)) if c in FA else c for c in s))

def flat(el):
    """Readable text of a node: diagrams flattened with separators."""
    if isinstance(el, NavigableString): return str(el)
    cls = el.get('class') or []
    if el.name == 'sup': return ''
    if 'hvz' in cls:
        out = []
        for d in el.descendants:
            if isinstance(d, Tag):
                c = d.get('class') or []
                if d.name == 'b' and d.parent and 'hvz-h' in (d.parent.get('class') or []): out.append('[نمودار: ' + ' '.join(x.get_text() for x in d.parent.find_all('span', class_='hvz-k')) + '] ' + d.get_text())
                elif 'hvz-colh' in c or 'hvz-g' in c: out.append('  ▸ ' + d.get_text(' ', strip=True))
                elif 'hvz-n' in c or 'hvz-step' in c: 
                    b = d.find('b'); sp = d.find('span')
                    out.append('    • ' + (b.get_text() if b else '') + (' — ' + sp.get_text() if sp else '') + ('' if 'hvz-n' in c else ''))
                elif 'hvz-note' in c: out.append('  ⟐ ' + d.get_text(' ', strip=True))
                elif 'hvz-edge' in c or 'hvz-rel' in c or 'hvz-ar' in c: out.append('    ↳ ' + d.get_text(' ', strip=True))
                elif 'hvz-vsb' in c: out.append('  — در برابرِ —')
        # dedupe consecutive
        res = []
        for x in out:
            if not res or res[-1] != x: res.append(x)
        return '\n'.join(res)
    return el.get_text(' ', strip=False)

body = bk.find('div', class_='bd')
chapters = []; cur = None; sec = None
SEC = {}
for el in body.children:
    if isinstance(el, NavigableString):
        continue
    if el.name == 'h2' and el.get('id', '').startswith('ch'):
        m = re.match(r'([۰-۹]+)\.\s*(.*)', el.get_text().strip())
        cur = {'id': el['id'], 'n': todig(m.group(1)), 'title': m.group(2), 'parts': []}
        chapters.append(cur); sec = None
        cur['parts'].append(('H2', el.get_text().strip()))
        continue
    if el.name == 'h2' and el.get('id') == 'refs':
        cur = {'id': 'refs', 'n': 99, 'title': 'کتاب‌نامه', 'parts': [('H2', 'کتاب‌نامه')]}
        chapters.append(cur); sec = None
        continue
    if cur is None: continue
    if el.name == 'h3' and el.get('id'):
        sec = el['id']; SEC[sec] = {'ch': cur['id'], 'chn': cur['n'], 'title': el.get_text().strip(), 'abs': '', 'lessons': []}
        cur['parts'].append(('H3', '[' + sec + '] ' + el.get_text().strip()))
        continue
    cls = el.get('class') or []
    t = flat(el).strip()
    if not t: continue
    if sec and 'tk' in cls and not SEC[sec]['abs']:
        SEC[sec]['abs'] = re.sub(r'^\s*چکیده:\s*', '', el.get_text().strip())
    if sec and 'add' in cls:
        for mm in re.findall(r'درسِ?\s*([۰-۹]+)', el.get_text()): SEC[sec]['lessons'].append(todig(mm))
    tag = 'FN' if (el.name in ('ol', 'div') and ('fn' in cls)) else ('ADD' if 'add' in cls else ('DIAG' if 'hvz' in cls else 'P'))
    cur['parts'].append((tag, t))

os.makedirs(os.path.join(B, 'epi/ch'), exist_ok=True)
for ch in chapters:
    name = 'refs' if ch['id'] == 'refs' else 'ch%02d' % ch['n']
    with open(os.path.join(B, 'epi/ch', name + '.txt'), 'w', encoding='utf-8') as f:
        for tag, t in ch['parts']:
            f.write(('\n## ' if tag == 'H3' else '\n# ' if tag == 'H2' else '\n<' + tag + '>\n') + t + '\n')

# ---- embed: rewrite ids/hrefs, scope css ----
html = str(bk)
html = re.sub(r'\sid="([^"]+)"', lambda m: ' id="eb-' + m.group(1) + '"', html)
html = re.sub(r'href="#([^"]+)"', lambda m: 'href="#eb-' + m.group(1) + '" data-eb="' + m.group(1) + '"', html)
assert '<script' not in html.lower()
def scope(css):
    out = []; i = 0
    # handle @media blocks recursively (simple)
    def rules(s):
        res = []; pos = 0
        while pos < len(s):
            ob = s.find('{', pos)
            if ob < 0: break
            sel = s[pos:ob].strip()
            if sel.startswith('@media') or sel.startswith('@supports'):
                depth = 1; j = ob + 1
                while depth: 
                    if s[j] == '{': depth += 1
                    elif s[j] == '}': depth -= 1
                    j += 1
                res.append(sel + '{' + rules(s[ob + 1:j - 1]) + '}'); pos = j; continue
            cb = s.find('}', ob)
            body = s[ob + 1:cb]
            if sel.startswith('@'):
                res.append(sel + '{' + body + '}')
            else:
                sels = []
                for x in sel.split(','):
                    x = x.strip()
                    if x in ('body', 'html'): sels.append('.epibook')
                    elif x.startswith('body '): sels.append('.epibook ' + x[5:])
                    else: sels.append('.epibook ' + x)
                res.append(','.join(sels) + '{' + body + '}')
            pos = cb + 1
        return ''.join(res)
    return rules(css)
scss = scope(css)
assert '</style' not in scss.lower()
CH = [{'id': c['id'], 'n': c['n'], 'title': c['title']} for c in chapters if c['id'] != 'refs']
js = '/* متن کامل جزوه «معرفت‌شناسی — مجتبی مصباح» به‌صورت دست‌نخورده (فقط شناسه‌ها پیشوند گرفته‌اند) */\nwindow.EPI_BOOK = ' + json.dumps({'css': scss, 'html': html, 'sec': SEC, 'ch': CH}, ensure_ascii=False) + ';\n'
open(os.path.join(B, 'app/epi_book.js'), 'w', encoding='utf-8').write(js)
print('chapters', len(CH), 'sections', len(SEC), 'html', len(html), 'css', len(scss))
print(json.dumps({k: (v['chn'], v['lessons']) for k, v in SEC.items()}, ensure_ascii=False))
