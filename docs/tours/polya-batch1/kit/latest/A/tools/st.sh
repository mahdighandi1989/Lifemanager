#!/bin/bash
# st.sh SID... : status of each loop
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A
for s in "$@"; do echo "=== $s pos=$(cat $R/$s/pos 2>/dev/null) ai=$(ls $R/$s/ai | grep -c '^p') ans=$(ls $R/$s/ai | grep -c '^r')"; tail -${N:-3} $R/$s/loop.out 2>/dev/null | cut -c1-${W:-200}; done
