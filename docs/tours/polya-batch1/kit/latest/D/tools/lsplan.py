# lsplan.py sid — round21D ctl index -> tag + short content (round21 plan item i == ctl i)
import json,sys
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/'
s=sys.argv[1]; P=json.load(open(B+'round21D/'+s+'.plan.json'))
for i,x in enumerate(P,1):
    try: c=json.load(open(f'{B}round21D/{s}/ctl/c{i}.json'))
    except Exception: c={}
    tag=x.get('tag') or ('src%d'%x['src'] if 'src' in x else 'EXIT')
    sh=c.get('say') or c.get('eval') or ('EXIT' if c.get('exit') else '')
    print(i,tag,'|',str(sh).replace('\n',' ')[:int(sys.argv[2]) if len(sys.argv)>2 else 110])
