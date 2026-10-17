import sys,json,os,re
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
rd,sid=sys.argv[1],sys.argv[2]; D=f'{T}/{rd}/{sid}'
n=1
while os.path.exists(f'{D}/ctl/c{n}.json'):
    c=open(f'{D}/ctl/c{n}.json').read()
    if re.search(r'liveChatQ|lpBBest',c):
        o=json.load(open(f'{D}/out/s{n}.json')) if os.path.exists(f'{D}/out/s{n}.json') else {}
        v=str(o.get('eval') or o.get('eval0') or '')
        print(f'--- c{n}: {c[:120]}');
        for line in v.split('\n'):
            if 'lpBBest' in line or line.startswith('💬') or 'chat:' in line or 'liveChat' in c: print('   ',line[:3000])
    n+=1
