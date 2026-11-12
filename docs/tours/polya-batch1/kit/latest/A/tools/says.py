import json,glob,re,sys
fs=sorted(glob.glob(f'/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A/_old/{sys.argv[1]}/ctl/c*.json'),key=lambda f:int(re.search(r'c(\d+)\.json',f).group(1)))
W=int(sys.argv[2]) if len(sys.argv)>2 else 200
for f in fs:
    j=json.load(open(f)); n=re.search(r'c(\d+)\.json',f).group(1)
    if 'say' in j and j['say'] is not None: print('c'+n,'SAY:',j['say'][:W].replace('\n',' / '))
    elif 'clock' in j: print('c'+n,'CLOCK',j['clock'])
    elif 'fill' in j: print('c'+n,'FILL',str(j['fill'])[:100])
    elif 'reload' in j: print('c'+n,'RELOAD')
