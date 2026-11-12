# ins.py sid after_index (stdin items as add.py) -> insert ctls after src index, shifting later ones
import sys,json,glob,os,subprocess,shutil
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26C'
sid=sys.argv[1]; k=int(sys.argv[2]); D=f'{R}/src/{sid}/ctl'
n=len(glob.glob(D+'/c*.json'))
tmp=D+'_tail'; os.makedirs(tmp,exist_ok=True)
for i in range(k+1,n+1): shutil.move(f'{D}/c{i}.json',f'{tmp}/c{i}.json')
subprocess.run(['python3',R+'/tools/add.py',sid],input=sys.stdin.read().encode(),check=True)
m=len(glob.glob(D+'/c*.json'))
for j,i in enumerate(range(k+1,n+1)): shutil.move(f'{tmp}/c{i}.json',f'{D}/c{m+1+j}.json')
os.rmdir(tmp); print('inserted',m-k,'total',len(glob.glob(D+'/c*.json')))
