import json,sys
d=json.load(open('/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/scenarios.json'))
s=[x for x in d['scenarios'] if x['id']==sys.argv[1]][0]
for k in ['persona','problem_type','opening','script','system_must_do','system_must_not','success_criteria','failure_signatures']:
    print('##',k); print(json.dumps(s[k],ensure_ascii=False,indent=0))
