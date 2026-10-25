#!/bin/bash
# dd.sh SID : diff lines (short) + newheads of last stop
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A
L=$(grep -n "##### STOP p" $R/$1/auto.log | tail -1 | cut -d: -f1)
sed -n "${L},\$p" $R/$1/auto.log | grep "^  D [-+][^-+]\|^NEWHEADS\|^   NL\|OLD ANSWER\|BLOCKS EQUAL" | cut -c1-${W:-400}
