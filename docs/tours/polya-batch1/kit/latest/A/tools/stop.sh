#!/bin/bash
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A
L=$(grep -n "LOOP-STOP" $R/$1/loop.out | tail -1 | cut -d: -f1); sed -n "${L},\$p" $R/$1/loop.out | grep -v "^   BLK\|^   NL\|^  D ---\|^  D +++\|^  D @@" | cut -c1-${W:-900}
