import json,sys,os,re
R=sys.argv[1]; s=sys.argv[2]; a=int(sys.argv[3]) if len(sys.argv)>3 else 1; b=int(sys.argv[4]) if len(sys.argv)>4 else 9999
D=f'{R}/{s}/ctl'
ns=sorted(int(m.group(1)) for f in os.listdir(D) for m in [re.match(r'c(\d+)\.json',f)] if m)
for n in ns:
    if n<a or n>b: continue
    t=open(f'{D}/c{n}.json').read()
    print(f'c{n}: {t[:int(os.environ.get("W","220"))]}'.replace('\n',' '))
