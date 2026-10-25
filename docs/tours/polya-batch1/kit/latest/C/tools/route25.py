import json,glob,re,os,sys
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C'
S='s21 s22 s23 s24 s25 s26 s27 s28 s29 pC1 pC2 pC3 aC1 aC2 aC3 aC4 tC1 oC1 pwC1 pwC2'.split()
tot=0;bad=[];per={}
for s in S:
    n=0;b=0
    for f in sorted(glob.glob(f'{R}/{s}/ai/p*.json'),key=lambda x:int(x.split('/p')[-1][:-5])):
        k=int(f.split('/p')[-1][:-5]); j=json.load(open(f)); u=j['user']; t=j.get('task')
        m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S); turn=m.group(1).strip() if m else ''
        if t=='learning_architecture': kind='consult'; ok=True
        elif turn.startswith('[سامانه') : kind='sys'; ok=(t=='lla_assistant')
        elif turn.startswith('[اصلاحِ پیامِ قبلی]'): kind='edit'; ok=(t=='lla_assistant')
        else:
            pc='[سامانه — وارسیِ صفحه' in turn
            kind='user'+('(rewrite)' if pc else '')
            cmd=bool(re.match(r'^(آره|بله)?[،, ]*(بازش کن|ثبتش کن|باز کن)[.!]?$',turn.split('\n')[0].strip()))
            ok=(t=='lla_assistant') if cmd else (t=='lla_coach')
            if cmd: kind='command'
        n+=1; tot+=1
        if not ok: b+=1; bad.append((s,k,kind,t,turn[:90].replace('\n',' ')))
    per[s]=(n,n-b)
for s in S: print(s,per[s][1],'/',per[s][0])
print('TOTAL ok',sum(v[1] for v in per.values()),'/',tot)
for x in bad: print('MISS',x)
