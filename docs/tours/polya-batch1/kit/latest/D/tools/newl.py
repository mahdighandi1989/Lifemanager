import json,sys,re,glob,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
def norm(l):
    l=re.sub(r'^- زمینه \(نه پرسشِ دوم\)(?: — شیوهٔ همان یک پرسشِ نوبت)?:? ?','- ',l)
    l=re.sub(r'[\d۰-۹]','',l)
    return l[:120]
for s in sys.argv[1:]:
  for f in sorted(glob.glob(f'{B}/round19D/{s}/ai/p*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0])):
    n=os.path.basename(f); o=f'{B}/round18D/{s}/ai/{n}'
    if not os.path.exists(o): print(s,n,'NO OLD'); continue
    a=json.load(open(o))['user'].split('# گفت‌وگو تا این لحظه')[0]; b=json.load(open(f))['user'].split('# گفت‌وگو تا این لحظه')[0]
    A=set(norm(x) for x in a.split('\n')); 
    new=[x for x in b.split('\n') if norm(x) not in A and x.strip() and not re.search(r'هر تاریخی که کاربر|سکوت، «نمی‌دونم»|معلمِ خیالی|از کتاب برای همین مرحله|^نام:|حافظهٔ سشن|^مراحل|pb_l_',x)]
    Bn=set(norm(x) for x in b.split('\n'))
    gone=[x for x in a.split('\n') if norm(x) not in Bn and x.strip() and not re.search(r'هر تاریخی که کاربر|سکوت، «نمی‌دونم»|معلمِ خیالی|از کتاب برای همین مرحله|^نام:|حافظهٔ سشن|^مراحل|pb_l_',x)]
    if new or gone:
        print(f'## {s} {n}')
        for x in new[:12]: print('  +',x[:260])
        for x in gone[:12]: print('  -',x[:260])
