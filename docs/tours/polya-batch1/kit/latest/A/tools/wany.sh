#!/bin/bash
# wany.sh T SID... : wait up to T s until any SID's loop is done; print which are done
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A
T=$1; shift
for i in $(seq 1 $((T/5))); do D=""; for s in "$@"; do tail -1 $R/$s/drive.out 2>/dev/null | grep -q "LOOPDONE\|FULLDONE" && D="$D $s"; done; [ -n "$D" ] && { echo "DONE:$D"; exit 0; }; sleep 5; done; echo "none"
