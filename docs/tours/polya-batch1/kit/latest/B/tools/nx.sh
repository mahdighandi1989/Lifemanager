#!/bin/bash
# nx.sh sid : replay R7 ctl from next index to end, stop at pending and show hook
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round16B
cd $B; s=$1; off=$(cat $s/off.txt 2>/dev/null || echo 0); k=$(( $(ls $s/ctl | wc -l) + 1 - off )); n=$(ls ../round15B/$s/ctl | wc -l)
HL=${HL:-400} tools/rr.sh $s $k $n 2>&1 | grep -E "^#####|PENDING|ERROR|EVAL|STOP|OVERLAY" | cut -c1-${CW:-300}
p=$(python3 - <<PY
import os
d='$s/ai'
ps=sorted(int(f[1:-5]) for f in os.listdir(d) if f.startswith('p') and f.endswith('.json'))
print(next((n for n in ps if not os.path.exists(f'{d}/r{n}.txt')),''))
PY
)
if [ -n "$p" ]; then echo "##### HOOK p$p"; W=${W:-900} tools/sh.sh $s $p; fi
