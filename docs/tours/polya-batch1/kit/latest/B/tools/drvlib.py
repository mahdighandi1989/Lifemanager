import json, os, re, hashlib
IDRE = re.compile(r'\b(?:pb_[a-z]_[a-z0-9]{6,}|prc_[a-z0-9]{6,}|prl_[a-z0-9]{6,}|achat_[a-z0-9]{6,}|dl_[a-z0-9]{6,})\b')
RW = '[سامانه — وارسیِ صفحه پیش از نشان دادنِ پاسخ'
FA = str.maketrans('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩', '01234567890123456789')
def ids(u):
    out = []
    for m in IDRE.findall(u):
        if m not in out: out.append(m)
    return out
def turnkey(u):
    i = u.rfind('# نوبتِ تازه'); t = u[i + 13:] if i >= 0 else u[-600:]
    rw = ''; j = t.find(RW)
    if j >= 0: rw = t[j:]; t = t[:j]
    def nz(x):
        x = IDRE.sub('ID', x); x = x.translate(FA); x = re.sub(r'20\d\d-\d\d-\d\d(T[\d:.]+Z)?', 'D', x)
        x = re.sub(r'\d+', 'N', x); return re.sub(r'\s+', ' ', x).strip()[:400]
    return nz(t), (nz(rw) if rw else '')
def pending(D):
    a = f'{D}/ai'; ps = sorted(int(f[1:-5]) for f in os.listdir(a) if re.match(r'p\d+\.json$', f))
    return next((n for n in ps if not os.path.exists(f'{a}/r{n}.txt')), None)
def keyhash(D, n):
    k, rw = turnkey(json.load(open(f'{D}/ai/p{n}.json'))['user']); full = k + ('|RW|' + rw if rw else ''); occ = 0
    for m in range(1, n):
        f = f'{D}/ai/p{m}.json'
        if os.path.exists(f):
            k2, rw2 = turnkey(json.load(open(f))['user'])
            if k2 + ('|RW|' + rw2 if rw2 else '') == full: occ += 1
    return hashlib.md5(full.encode()).hexdigest()[:10] + f'_{occ}'
