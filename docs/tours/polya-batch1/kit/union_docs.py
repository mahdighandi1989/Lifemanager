import re,sys
for f in sys.argv[1:]:
    s=open(f,encoding='utf-8').read()
    def r(m):
        a,b=m.group(1),m.group(2)
        if 'xychart' in a or 'y-axis' in a or 'جمعِ جاری' in a or 'bar [' in a: return a
        return a+b
    s=re.sub(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n',r,s,flags=re.S)
    open(f,'w',encoding='utf-8').write(s)
