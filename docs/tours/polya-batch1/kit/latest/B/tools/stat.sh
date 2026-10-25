#!/bin/bash
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25B; cd $B
for s in "$@"; do r=$(pgrep -f "[d]rv25b.py $s( |\$)" >/dev/null && echo RUN || echo idle); h=$(pgrep -f "[h]arness5.js $B/$s\$" >/dev/null && echo H || echo -); echo "$s $r $h :: $(tail -1 $s/drv.log 2>/dev/null | cut -c1-220)"; done
