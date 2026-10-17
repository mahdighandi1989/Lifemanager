import json,re,sys
sys.argv=[sys.argv[0],sys.argv[1]]
exec(open(__file__.replace('v2.py','v1.py')).read().split("print('\\n'.join")[0])
out=[]
for l in lines(sys.argv[1]):
  m=re.match(r'  (CTX |TURN|\?\?\? |LIST) (.*)',l)
  if m and m.group(1) in ('CTX ','??? '):
    t=re.sub(r'^- (\(?)زمینه \(نه پرسشِ دوم\)[:：]?\s*','- ',m.group(2)); out.append('  C '+t[:45])
  else: out.append(l)
print('\n'.join(out))
