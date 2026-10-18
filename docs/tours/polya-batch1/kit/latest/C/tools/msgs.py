# msgs.py sid [N] -> last N chat messages from the latest out json that has msgs
import json,glob,sys
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24C'
sid=sys.argv[1]; N=int(sys.argv[2]) if len(sys.argv)>2 else 6
fs=sorted(glob.glob(f'{T}/{sid}/out/s*.json'),key=lambda x:int(x.split('/s')[-1][:-5]))
for f in reversed(fs):
    try: st=json.load(open(f)).get('state',{})
    except: continue
    if st.get('msgs'):
        print(f.split('/')[-1]); [print(' ',m[:700]) for m in st['msgs'][-N:]]; break
