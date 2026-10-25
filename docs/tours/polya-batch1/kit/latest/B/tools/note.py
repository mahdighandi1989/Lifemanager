#!/usr/bin/env python3
"""note.py <sid> <sheet#> <daysOffset> <text> : append a routine reply note to sheets/sh<n>.json and mark it answered"""
import json,sys,datetime
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25B'
sid,n,d,text=sys.argv[1],sys.argv[2],float(sys.argv[3]),sys.argv[4]
f=f'{B}/{sid}/sheets/sh{n}.json'; s=json.load(open(f))
at=(datetime.datetime.utcnow()+datetime.timedelta(days=d)).strftime('%Y-%m-%dT%H:%M:%S.000Z')
s['notes'].append({'id':'r'+str(len(s['notes'])),'by':'routine','at':at,'text':text}); s['status']='answered'
json.dump(s,open(f,'w'),ensure_ascii=False,indent=1); print('note added',at,s['status'],len(s['notes']))
