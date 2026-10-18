import re,os,sys,json
D=sys.argv[1]; t=0
for f in sorted(os.listdir(D+'/ctl'), key=lambda x:int(re.sub(r'\D','',x) or 0)):
    s=open(f'{D}/ctl/{f}').read()
    for m in re.finditer(r'if\((\d+)\)__adv\((\d+)\)|__adv\((\d+)\)',s):
        if m.group(3): t+=int(m.group(3))
        elif m.group(1)!='0': t+=int(m.group(2))
print(t)
