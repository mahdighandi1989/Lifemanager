import json,sys,os,re
D=sys.argv[1]; n=1
K=('# پیگیریِ برنامهٔ خودش','قول','promise','بازنگری: دو','chat_lookback','lbRest','سلیقه','# 🔭','ضمیرِ')
while os.path.exists(f'{D}/ai/p{n}.json'):
    u=json.load(open(f'{D}/ai/p{n}.json'))['user']
    hs=[l[:110] for l in u.split('\n') if (l.startswith('# ') and any(k in l for k in K)) or (any(k in l for k in ('promise','قولِ','chat_lookback {','پیگیری‌اش','بازنگری: دو')) and not l.startswith(('کاربر:','دستیار:','- حلی که')))]
    print(f'p{n}:', ' || '.join(hs))
    n+=1
