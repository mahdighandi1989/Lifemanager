#!/bin/bash
# rp.sh SID SRCCTL OLDPID NEWPID  : replay a round5 ctl with pid substitution
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya
T=$(mktemp -p $R/round22A); sed "s/$3/$4/g; s#round21A#round22A#g" $2 > $T; python3 $R/round22A/tools/d.py $1 send @$T; rm -f $T
