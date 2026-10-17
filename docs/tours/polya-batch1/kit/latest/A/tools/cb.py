import json,sys,glob
D=sys.argv[1]
f=sorted(glob.glob(D+'/ai/p*.json'),key=lambda x:int(x.split('/p')[-1][:-5]))[-1]
u=json.load(open(f))['user']
print(f, [l[:60] for l in u.split('\n') if l.startswith('# ')])
for h in ['# پس از شکست','# مسئلهٔ زندهٔ','# مسئلهٔ حل‌شدهٔ','# مربیِ حل','# مسئلهٔ واقعیِ']:
    i=u.find(h)
    if i<0: continue
    j=u.find('\n# ',i+3)
    blk=u[i:j]
    for l in blk.split('\n'):
        if any(k in l for k in ('گامِ کوچک ارزش','حلِ مسئله مهارتی','پرسش‌ها را مکانیکی','قاعدهٔ سبک','پایانِ نردبان','حلی که در همین گفت‌وگو')): continue
        print(l[:int(sys.argv[2]) if len(sys.argv)>2 else 700])
