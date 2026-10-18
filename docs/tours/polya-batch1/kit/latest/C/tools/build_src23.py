# build_src23.py -> round23C/src/<sid>/ctl from round22C/<sid>/ctl: drop trailing exit; insert the birth-date card fill after the first say
import json,os,glob,sys
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
BD={'s21':'2014-03-11','s22':'1976-02-14','s23':'1968-06-02','s24':'2002-04-20','s25':'1965-01-15','s26':'2000-07-07','s27':'2003-02-01','s28':'1996-05-05','s29':'1982-08-09','pC1':'2011-04-03','pC2':'1979-09-01','pC3':'1974-05-20'}
for sid in sys.argv[1:]:
    src=sorted(glob.glob(f'{T}/round22C/{sid}/ctl/c*.json'),key=lambda x:int(x.split('/c')[-1][:-5]))
    L=[open(f).read() for f in src]
    while L and '"exit"' in L[-1]: L.pop()
    out=[]; done=False
    for t in L:
        out.append(t)
        if not done and '"say"' in t:
            out.append(json.dumps({"eval":"(()=>{const c=[...document.querySelectorAll('.age-ask')].pop();if(!c)return 'NO CARD';const i=c.querySelector('.age-in');i.focus();i.value='%s';i.dispatchEvent(new Event('input',{bubbles:true}));[...c.querySelectorAll('button')].find(b=>b.textContent.trim()==='ثبت').click();return 'age='+APP.AGE.age()+' band='+((APP.AGE.band(APP.AGE.age())||{}).id)})()"%BD[sid]}))
            done=True
    D=f'{T}/round23C/src/{sid}/ctl'; os.makedirs(D,exist_ok=True)
    for f in glob.glob(D+'/*'): os.remove(f)
    for i,t in enumerate(out): open(f'{D}/c{i+1}.json','w').write(t)
    print(sid,len(L),'->',len(out))
