import json,sys,difflib,re
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,n,m=sys.argv[1:4]
a=json.load(open(f'{R}/round24A/{s}/ai/p{m}.json'))['user'].split('\n'); b=json.load(open(f'{R}/round25A/{s}/ai/p{n}.json'))['user'].split('\n')
key=sys.argv[4] if len(sys.argv)>4 else 'پرسش‌های «'
A=[l for l in a if key in l]; B=[l for l in b if key in l]
for x,y in zip(A,B):
  if x==y: continue
  sm=difflib.SequenceMatcher(None,x,y,autojunk=False)
  for op,i1,i2,j1,j2 in sm.get_opcodes():
    if op!='equal': print(op,'\n OLD:',x[max(0,i1-80):i2+40],'\n NEW:',y[max(0,j1-80):j2+40])
