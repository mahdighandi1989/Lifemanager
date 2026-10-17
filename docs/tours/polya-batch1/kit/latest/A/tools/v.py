import json,sys,re,os
D=sys.argv[1]; n=int(sys.argv[2]); full='full' in sys.argv
p=json.load(open(os.path.join(D,'ai','p%d.json'%n)))
print('TASK',p.get('task'),'files',p.get('fileIds'),'syslen',len(p['sys']))
if p.get('task')!='lla_assistant': print('SYS:',p['sys'][:6000 if not full else 99999])
u=p['user']; i=u.find('\n# امروز')
if i<0: i=0
u=u[i:]
out=[]
for line in u.split('\n'):
    if line.startswith('متنِ صفحه') and not full: line=line[:900]+' …[cut]'
    if line.startswith('دکمه‌ها:') and not full: line=line[:2500]+' …[cut]'
    out.append(line)
print('\n'.join(out))
