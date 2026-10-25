# ins.py sid k json -> insert ctl at position k in src (shift later); refuses if k <= current ptr
import json,sys,os,glob
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C'
sid,k=sys.argv[1],int(sys.argv[2]); c=json.loads(sys.argv[3])
ptr=json.load(open(f'{R}/{sid}/drv.json'))['ptr'] if os.path.exists(f'{R}/{sid}/drv.json') else 1
if k<=ptr: print('REFUSE k<=ptr',k,ptr); sys.exit(1)
D=f'{R}/src/{sid}/ctl'; n=len(glob.glob(D+'/c*.json'))
for i in range(n,k-1,-1): os.rename(f'{D}/c{i}.json',f'{D}/c{i+1}.json')
json.dump(c,open(f'{D}/c{k}.json','w'),ensure_ascii=False); print('inserted',sid,k,'ptr',ptr,'n',n+1)
