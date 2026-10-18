#!/bin/bash
# mkbirth.sh SID YYYY-MM-DD [K=2] : ovr/cK = [shot of the age card, fill, click ثبت, shot, original cK]
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24A
K=${3:-2}; mkdir -p $R/$1/ovr; cp $R/../round23A/$1/clock0 $R/$1/clock0
python3 - "$1" "$2" "$K" <<'PY'
import json,sys
s,d,k=sys.argv[1:4]
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
o=json.load(open(f'{R}/round23A/{s}/ctl/c{k}.json'))
TYPE="(()=>{const i=document.querySelector('.age-ask .age-in');if(!i)return 'NO CARD';i.focus();i.value='%s';i.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('.age-ask .btn.sm:not(.ghost)').click();return 'AGE '+APP.AGE.birth()+' age='+APP.AGE.age()+' band='+((APP.AGE.band(APP.AGE.age())||{}).id)+' card='+document.querySelectorAll('.age-ask').length})()"%d
L=[{"shot":{"name":"age_card_before","fold":False}},{"eval":TYPE},{"shot":{"name":"age_card_after","fold":False}},o]
json.dump(L,open(f'{R}/round24A/{s}/ovr/c{k}.json','w'),ensure_ascii=False)
print('ovr',s,k,d)
PY
