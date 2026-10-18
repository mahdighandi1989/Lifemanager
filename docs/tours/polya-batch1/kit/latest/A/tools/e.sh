#!/bin/bash
# e.sh SID 'JS' : eval on page, print EVAL/ERROR lines
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A
bash $R/tools/ev.sh $1 "$2" eval ${3:-6000} | grep -v "^wrote\|^  MSG\|^VIEW"
