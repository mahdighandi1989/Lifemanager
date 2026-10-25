#!/bin/bash
# nh.sh SID : show NEWHEADS / NL / BLK lines of the last stop
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A
L=$(grep -n "NEWRULE p\|##### STOP p" $R/$1/auto.log | tail -2 | head -1 | cut -d: -f1)
sed -n "${L},\$p" $R/$1/auto.log | grep "NEWHEADS\|^   NL\|^   BLK\|NEWRULE\|OLD ANSWER" | cut -c1-${W:-700} | sort -u
