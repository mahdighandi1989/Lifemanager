#!/bin/bash
# dd.sh sid N — diff round16D pN vs round16D pN (coach/live blocks; volatile lines removed)
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya
f(){ python3 $B/round21D/tools/hk2.py $1 $2 2>/dev/null | grep -av "^# ساعت\|^# امروز" ; }
diff <(f $B/round21D/$1 $2) <(f $B/round21D/$1 $2) | cut -c1-${W:-400}
