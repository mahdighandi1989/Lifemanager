import sys,ast,re
T=sys.stdin.read()
TQ=('**یک** پرسش','پرسشِ این نوبت همین','پیشنهادِ این نوبت','کارِ پیشین','حسابِ صفحه','ازسرگیری')
nh=[]
for l in T.split('\n'):
    if l.startswith('NEWHEADS: '):
        try: nh=ast.literal_eval(l[10:])
        except Exception: sys.exit(1)
        break
if not all(h.startswith(('# مسئلهٔ زندهٔ','# مربیِ حل','# مسئلهٔ حل‌شدهٔ','# ضمیرِ گفت‌وگو','# حسابِ صفحه روی همین پیام')) for h in nh): sys.exit(1)
d=[l for l in T.split('\n') if l.startswith('  D -') or l.startswith('  D +')]
d=[l for l in d if not l.startswith(('  D ---','  D +++'))]
orep=''
for l in T.split('\n'):
    if l.startswith('OLD REPLY: '): orep=l[11:]
def nz(s): return re.sub(r'[\s‌،؟?:—\-«»()]','',s)
bad=False
for l in d:
    if not any(k in l for k in TQ): continue
    if ('**یک** پرسش' in l or 'پیشنهادِ این نوبت' in l) and not any(k in l for k in TQ[2:] if k!='پیشنهادِ این نوبت') :
        if l.startswith('  D +'): continue
        m=re.search(r'«([^»]{12,})',l.split('):',1)[-1]) if '**یک** پرسش' in l else re.search(r'پیشنهادِ این نوبت: «([^»]{12,})',l)
        if m:
            q=nz(m.group(1)).replace('شما','تو'); o=nz(orep).replace('شما','تو')
            if not any(s and s in o for s in (q[:22],q[12:34],q[-20:])): continue
    bad=True
if bad: sys.exit(1)
if 'NO R10 match' in T or 'NEWRULE' in T and any(not h.startswith(('# مسئلهٔ زندهٔ','# مربیِ حل','# مسئلهٔ حل‌شدهٔ','# ضمیرِ گفت‌وگو','# حسابِ صفحه روی همین پیام')) for h in nh): sys.exit(1)
sys.exit(0)
