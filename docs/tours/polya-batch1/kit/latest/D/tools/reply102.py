#!/usr/bin/env python3
# reply102.py DIR N 'text' — routine answers sheet #N (a step-less system sheet)
import sys,json,datetime
D,N,tx=sys.argv[1],sys.argv[2],sys.argv[3]
f=f'{D}/sheets/sh{N}.json'; s=json.load(open(f))
s['notes'].append({'id':'r'+str(len(s['notes'])),'by':'routine','at':datetime.datetime.utcnow().isoformat()+'Z','text':tx})
s['status']='answered'; json.dump(s,open(f,'w'),ensure_ascii=False,indent=1); print('sheet',N,'answered')
