import re,sys
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27B'
t=open(f'{B}/{sys.argv[1]}/post.txt',encoding='utf-8').read()
for p in re.split(r'(?m)^#### ',t)[1:]:
    head=p.split('\n')[0]
    if not head.startswith('DOSSIER'): continue
    lines=p.split('\n'); title=[l for l in lines[1:8] if l.strip() and not l.startswith(('📍','↩'))][:1]
    print('==',head,title)
    for i,l in enumerate(lines):
        if re.match(r'^[۰-۹]+:[۰-۹]+ · ',l) or re.match(r'^[۰-۹]+ [آ-ی]+ ۱۴۰[۵-۶]$',l.strip()):
            j=i+1; txt=''
            while j<len(lines) and len(txt)<80 and not re.match(r'^[۰-۹]+:[۰-۹]+ · ',lines[j]):
                if lines[j].strip(): txt+=lines[j].strip()+' '
                j+=1
            print('  ',l.strip()[:50],'|',txt[:int(sys.argv[2]) if len(sys.argv)>2 else 80] if ':' in l else '')
