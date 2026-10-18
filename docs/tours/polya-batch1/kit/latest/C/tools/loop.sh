#!/bin/bash
# loop.sh secs sids... -> wait, then show digests of pendings
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23C
T=$1; shift
tools/wp.sh $T "$@"
for s in "$@"; do st=$(tools/wp.sh 0 $s | head -1); case "$st" in *PEND*) tools/v2.sh $s | head -${H:-30};; esac; done
