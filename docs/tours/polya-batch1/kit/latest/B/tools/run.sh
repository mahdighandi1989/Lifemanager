#!/bin/bash
# run.sh sid [src] : start (or resume if harness alive) and wait for the driver to stop; print why
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B; cd $B; s=$1
if kill -0 $(cat $s/pid.txt 2>/dev/null) 2>/dev/null; then bash tools/go.sh $s; else bash tools/st.sh $s ${2:-$s} >/dev/null; fi
for i in $(seq 1 ${WAIT:-280}); do sleep 2; kill -0 $(cat $s/dpid.txt) 2>/dev/null || break; done
echo "$s: $(tail -1 $s/drv.log | cut -c1-400) | ctl $(ls $s/ctl | wc -l)/$(python3 -c "import json;print(len(json.load(open('$s/seq.json'))))") ai $(ls $s/ai | grep -c '^p')"
