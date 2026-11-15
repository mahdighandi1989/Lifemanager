import json,glob,sys,re
for sid in sys.argv[1:]:
    out=[]
    for f in sorted(glob.glob(sid+'/ai/p*.json'),key=lambda x:int(re.findall(r'p(\d+)\.json',x)[0])):
        j=json.load(open(f)); t=j['user'].split('# نوبتِ تازه')[-1].strip()[:40].replace('\n',' ')
        n=re.findall(r'p(\d+)\.json',f)[0]
        out.append('p'+n+':'+str(j.get('task'))+':'+t)
    print(sid,len(out)); print('\n'.join(out))
