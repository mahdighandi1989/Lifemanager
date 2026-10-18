#!/bin/bash
# show.sh sid -> last pending AI digest from last.txt + scan of that prompt
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21C
awk '/^### AI p/{buf=""} {buf=buf"\n"$0} END{print buf}' $1/last.txt | cut -c1-${W:-450} | grep -v "AUTO"
