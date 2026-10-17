#!/bin/bash
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20B
end=$((SECONDS+${T:-280}))
any(){ for s in "$@"; do grep -q "^rc=" g_$s.txt 2>/dev/null && return 0; done; return 1; }
until [ $SECONDS -ge $end ] || any "$@"; do sleep 3; done
for s in "$@"; do echo "######## $s"; cat g_$s.txt 2>/dev/null | cut -c1-${CW:-900}; done
