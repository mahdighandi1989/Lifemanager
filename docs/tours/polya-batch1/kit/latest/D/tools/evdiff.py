import json,sys,re,os,difflib
s=sys.argv[1]; A='../round19D/'+s; B=s
n=1
while os.path.exists(f'{B}/out/s{n}.json') and os.path.exists(f'{A}/out/s{n}.json'):
    try:
        a=json.load(open(f'{A}/out/s{n}.json')); b=json.load(open(f'{B}/out/s{n}.json'))
    except Exception: n+=1; continue
    ea=re.sub(r'(pb_l_|achat_|lp_|ex_|prc_|dl_)[a-z0-9]+','ID',str(a.get('eval'))); eb=re.sub(r'(pb_l_|achat_|lp_|ex_|prc_|dl_)[a-z0-9]+','ID',str(b.get('eval')))
    ea=re.sub(r'20\d\d-\d\d-\d\dT[\d:.]+Z','T',ea); eb=re.sub(r'20\d\d-\d\d-\d\dT[\d:.]+Z','T',eb)
    if ea!=eb:
        sm=difflib.SequenceMatcher(None,ea,eb)
        ch=[(op,ea[i1:i2][:150],eb[j1:j2][:150]) for op,i1,i2,j1,j2 in sm.get_opcodes() if op!='equal']
        print(f'-- s{n}:',ch[:4])
    n+=1
