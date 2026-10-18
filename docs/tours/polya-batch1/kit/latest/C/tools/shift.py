# shift.py dir... -> unpin (if .pinned) and shift every 2026-MM-DD in ctl files by +1 day (marker .shifted)
import sys,glob,os,re,datetime
def sh(m):
    d=datetime.date.fromisoformat(m.group(0))+datetime.timedelta(days=1); return d.isoformat()
for D in sys.argv[1:]:
    if os.path.exists(D+'/.shifted'): print(D,'already'); continue
    fs=sorted(glob.glob(D+'/c*.json'),key=lambda x:int(x.split('/c')[-1][:-5]))
    if os.path.exists(D+'/.pinned'):
        os.remove(D+'/c1.json'); os.remove(D+'/c2.json'); os.remove(D+'/.pinned')
        for f in fs[2:]:
            n=int(f.split('/c')[-1][:-5]); os.rename(f,f'{D}/c{n-2}.json')
        fs=sorted(glob.glob(D+'/c*.json'),key=lambda x:int(x.split('/c')[-1][:-5]))
    k=0
    for f in fs:
        t=open(f).read(); t2=re.sub(r'2026-1[0-2]-[0-3]\d',sh,t)
        if t2!=t: open(f,'w').write(t2); k+=1
    open(D+'/.shifted','w').write('1'); print(D,len(fs),'files, shifted',k)
