import json,sys
P=json.load(open(sys.argv[1]+'.plan.json'))
for i,x in enumerate(P):
    print(i+1, x.get('tag') or ('c%d'%x['src'] if 'src' in x else 'EXIT'))
