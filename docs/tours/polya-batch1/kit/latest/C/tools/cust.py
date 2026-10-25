# cust.py sid  < ctl-json   -> writes custom ctl, then drive with lim 0 (wait for its out / AI)
import sys,os,json,subprocess
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid=sys.argv[1]; D=f'{T}/round25C/{sid}'
data=sys.stdin.read(); json.loads(data)
stf=D+'/drv.json'; S=json.load(open(stf)) if os.path.exists(stf) else {'ptr':1,'wait':0}
n=len(os.listdir(D+'/ctl'))+1; open(D+'/ctl/c%d.json'%n,'w').write(data); S['wait']=n; json.dump(S,open(stf,'w'))
os.execvp('python3',['python3',T+'/round25C/tools/drive.py',sid,'0'])
