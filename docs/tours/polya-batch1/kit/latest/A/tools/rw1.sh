#!/bin/bash
# rw1.sh SID N M 'NEWREPLY' [note] : pN is a forced rewrite of rM's (correct) reply: better/rN = rM ; answer pN with old rM (pid-mapped) + new reply; continue loop in bg
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24A
mkdir -p $R/$1/better; P=$(( $2 - 1 ))
(echo "# author: runner-simulated (the reply of p$P should have passed the page's post-check unchanged)"; cat $R/$1/ai/r$P.txt) > $R/$1/better/r$2.txt
X=$(python3 -c "import json,sys;print(json.dumps({'_reply':sys.argv[1]},ensure_ascii=False))" "$4")
M=$3; [ "$M" = "auto" ] && M=$(python3 -c "import json;print(json.load(open(\"$R/$1/r10map.json\"))[\"$P\"])"); bash $R/tools/go1.sh $1 $2 $M "$X"
