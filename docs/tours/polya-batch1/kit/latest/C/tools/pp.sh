#!/bin/bash
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C
tools/st.sh "$@" | while read s rest; do case "$rest" in *PENDING*) echo "================ $s $rest"; W=${W:-450} tools/v.sh $s;; esac; done
