import json,sys,re,glob,os
s=sys.argv[1]; A='../round21D/'+s; B=s
N=len(glob.glob(A+'/ctl/c*.json'))
norm=lambda t:re.sub(r'(pb_l_|achat_|lp_|case_|prc_|dl_|ex_|fc_)[a-z0-9]+','ID',re.sub(r'\d{4}-\d{2}-\d{2}T[\d:.]+Z','T',str(t)))
for k in range(1,N+1):
    try: a=json.load(open(f'{A}/out/s{k}.json')); b=json.load(open(f'{B}/out/s{k}.json'))
    except Exception as e: continue
    ea,eb=norm(a.get('eval')),norm(b.get('eval'))
    ma=norm(a.get('state',{}).get('msgs',[])[-2:]) ; mb=norm(b.get('state',{}).get('msgs',[])[-2:])
    if ea!=eb: print(f'## c{k} EVAL DIFF\n  R20: {ea[:500]}\n  R21: {eb[:500]}')
    if ma!=mb: print(f'## c{k} MSG DIFF\n  R20: {ma[:600]}\n  R21: {mb[:600]}')
