# turns.py sid [from] — per AI call: task, new-turn text, kept turn-question (short), reply
import json,sys,glob,re,os
D='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23D/'+sys.argv[1]
a=int(sys.argv[2]) if len(sys.argv)>2 else 1
n=len(glob.glob(D+'/ai/p*.json'))
for i in range(a,n+1):
    p=json.load(open(f'{D}/ai/p{i}.json')); u=p['user']
    new=u.split('# نوبتِ تازه')[-1].strip()[:160].replace('\n',' ')
    tq=[l for l in u.split('\n') if l.startswith('- **پرسشِ این نوبت همین است:**')]
    aud=[l for l in u.split('\n') if l.startswith('- کاربر ') and 'ساله است' in l]
    try: r=json.loads(open(f'{D}/ai/r{i}.txt').read()); rep=r.get('reply',''); acts=[x.get('do') for x in r.get('actions',[])]
    except Exception as e: rep=open(f'{D}/ai/r{i}.txt').read()[:300] if os.path.exists(f'{D}/ai/r{i}.txt') else '-'; acts=[]
    print(f'p{i} [{p.get("task")}] {"AGE:"+aud[0][8:30] if aud else "AGE:-"}\n  U: {new}\n  TQ: {(tq[0][36:300] if tq else "-")}\n  R: {rep[:300]}\n  A: {acts}')
