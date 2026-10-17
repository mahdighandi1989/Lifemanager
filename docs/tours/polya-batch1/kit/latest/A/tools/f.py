import sys,re
t=sys.stdin.read()
if '=== AI' not in t: print(t[:6000]); sys.exit()
pre=t[:t.find('=== AI')]; print(pre[-3000:])
a=t[t.find('=== AI'):]
print(a.split('\n')[0])
lines=a.split('\n'); blk=''
keep=('# مسئلهٔ','# مربیِ','# پس از','# نوبتِ تازه','# صفحهٔ فعلی')
skip=('پاسخِ این مسئله را هیچ','پرسش‌های همین مرحله','این گفت‌وگو به همین','گامِ کوچک ارزش','ضرب‌المثلِ همین','فیلدهای صفحه را پر نکن','حلی که در همین')
out=[];inb=False
for l in lines:
    if l.startswith('# '):
        inb=l.startswith(keep)
        if l.startswith('# صفحهٔ فعلی'): out.append(l)
    if l.startswith('نما:') or l.startswith('سرتیترها:'): out.append(l[:200])
    if inb and not any(k in l for k in skip): out.append(l[:900])
print('\n'.join(out))
