import json,glob,re,sys,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CTX='زمینه (نه پرسشِ دوم)'
for s in sorted(os.path.basename(d) for d in glob.glob(R+'/s[0-9]*')):
  for f in sorted(glob.glob(f'{R}/{s}/ai/p*.json'),key=lambda x:int(re.search(r'p(\d+)\.json',x).group(1))):
    p=json.load(open(f))
    if p.get('task')!='lla_assistant': continue
    u=p['user']; i=u.find('# صفحهٔ فعلی'); u2=u[:i] if i>0 else u
    j=u2.find('# امروز'); 
    blk=''; hits=[]
    for l in u2.split('\n'):
        if l.startswith('# '): blk=l[:40]; continue
        if not l.startswith('- '): continue
        if CTX in l[:60]: continue
        turn=('پرسشِ این نوبت همین است' in l) or ('فقط **یک** پرسش' in l) or ('پیشنهادِ این نوبت' in l) or l.startswith('- پرسشِ این نوبت:')
        if turn: continue
        b=re.search(r'(?<![آ-ی])بپرس(?![آ-ی])',l); q=l.rstrip().endswith('؟')
        if b or q: hits.append((blk,l[:230]))
    if hits:
        print('==',s,os.path.basename(f))
        for b,l in hits: print('   ',b,'|',l)
