#!/bin/bash
# s.sh SID (reads ctl JSON from stdin)
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20A
T=$(mktemp -p $R); cat > $T; python3 $R/tools/d.py $1 send @$T; rm -f $T
