import json,re,sys
for f in sys.argv[1:]:
  u=json.load(open(f))['user']
  for blk in re.split(r'(?m)^(?=# )',u):
    hd=blk.split('\n',1)[0]
    m=re.search(r'ضرب‌المثلِ همین مرحله \(پولیا، «حکمتِ ضرب‌المثل‌ها»\): «([^»]+)»',blk)
    if not m: continue
    q=m.group(1); rest=blk.replace(m.group(0),'')
    key=q[:14]
    hit=key in rest
    print(f.split('round19B/')[-1], ('DUP ' if hit else 'ok  '), q[:60])
