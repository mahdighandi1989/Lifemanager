#!/bin/bash
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25D
for s in "$@"; do bash $R/tools/runall.sh $s; echo "LANE_DONE $s $(tail -1 $R/$s.run)" >> $R/lanes.log; done
