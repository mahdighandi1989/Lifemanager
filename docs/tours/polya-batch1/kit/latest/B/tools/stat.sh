#!/bin/bash
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B; cd $B
for s in "$@"; do r=$(kill -0 $(cat $s/dpid.txt 2>/dev/null) 2>/dev/null && echo RUN || echo idle); h=$(kill -0 $(cat $s/pid.txt 2>/dev/null) 2>/dev/null && echo H || echo -); echo "$s $r $h :: $(tail -1 $s/drv.log 2>/dev/null | cut -c1-220)"; done
