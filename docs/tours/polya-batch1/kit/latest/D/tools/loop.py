#!/usr/bin/env python3
# loop.py sid K — while pending AI and filtered diff empty: answer with r7 and continue. Prints stop reason.
import sys,subprocess,re,os,glob
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20D'
S=sys.argv[1]; K=int(sys.argv[2]) if len(sys.argv)>2 else len(glob.glob(f'{B}/{S}/ctl/c*.json'))
def pend():
    for f in sorted(glob.glob(f'{B}/{S}/ai/p*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0])):
        k=re.findall(r'\d+',os.path.basename(f))[0]
        if not os.path.exists(f'{B}/{S}/ai/r{k}.txt'): return int(k)
while True:
    N=pend()
    if not N: print('NO PENDING; K',K); break
    v=subprocess.run(['bash',f'{B}/tools/vw.sh',S,str(N)],capture_output=True,encoding='utf-8',errors='replace').stdout
    diff=v.split('----- TURN')[0].split('\n')[1:]
    diff=[l for l in diff if l.strip()]
    if diff or not os.path.exists(os.environ.get('SRCD',f'{B}/../round20D/{S}')+f'/ai/r{N}.txt'):
        print(f'STOP p{N} K={K}'); print(v); break
    o=subprocess.run(['bash',f'{B}/tools/nx.sh',S,str(N),str(K)],capture_output=True,encoding='utf-8',errors='replace',env=dict(os.environ,OL='200')).stdout
    ks=re.findall(r'STOPPED_AT_SRC (\d+)',o)
    print(f'auto p{N} (K={K}) ->',ks[-1] if ks else 'END', [l[:160] for l in o.split('\n') if 'ERROR' in l or 'MSG>' in l][:3])
    if not ks: print('END'); break
    K=int(ks[-1])
