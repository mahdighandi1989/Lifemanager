import json,sys,os,re
D=sys.argv[1]; n=1
while os.path.exists(f'{D}/ctl/c{n}.json'):
    c=open(f'{D}/ctl/c{n}.json').read()
    if re.search(r'lpBBest|liveChatQs|liveChatQItems',c):
        o=json.load(open(f'{D}/out/s{n}.json')) if os.path.exists(f'{D}/out/s{n}.json') else {}
        v=o.get('eval') or o.get('eval0') or o.get('error') or ''
        print(f'--- c{n}')
        try:
            d=json.loads(v)
            for t,items in d:
                print('  ##',t)
                for i in items: print('    -',i.get('t') if isinstance(i,dict) else i)
        except Exception:
            for l in str(v).split('\n'):
                if 'lpBBest' in c and ('chat:' in l or re.match(r'^\d+=',l) or '=💬' in l or '=📄' in l): print('   ',l[:600])
                elif 'lpBBest' not in c: print('   ',l[:600])
                elif l.startswith('💬') or l.startswith('📄'): print('   ',l[:600])
    n+=1
