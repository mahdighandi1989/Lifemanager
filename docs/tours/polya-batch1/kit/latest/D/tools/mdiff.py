#!/usr/bin/env python3
# mdiff.py sid — mind/today lines that differ from the empty profile
import json,sys,difflib
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20D'
e=json.load(open(B+'/empty/views.json')); p=json.load(open(f'{B}/{sys.argv[1]}/post.json'))
for v in ['mind','today']:
    print('=====',v)
    for l in difflib.unified_diff(e[v].split('\n'),p[v].split('\n'),lineterm='',n=0):
        if l.startswith(('+','-')) and not l.startswith(('+++','---')): print(l[:300])
