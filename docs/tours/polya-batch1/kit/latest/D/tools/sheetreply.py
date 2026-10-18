# sheetreply.py DIR status 'text' — the owner's routine answers the newest assistant gap sheet (as «نظارت و سرکشی» would): note by 'routine' + status
import sys,json,glob,os,datetime
D,st,tx=sys.argv[1],sys.argv[2],sys.argv[3]
fs=sorted(glob.glob(D+'/sheets/sh*.json'),key=os.path.getmtime)
f=[x for x in fs if 'کمبودِ سامانه' in open(x).read()][-1]
s=json.load(open(f)); n=s['number']
s['notes'].append({'id':'r'+str(len(s['notes'])),'by':'routine','at':datetime.datetime.utcnow().isoformat()+'Z','text':tx.replace('#N','#'+str(n))})
s['status']=st; json.dump(s,open(f,'w'),ensure_ascii=False,indent=1); print('sheet',n,st,len(s['notes']),'notes')
