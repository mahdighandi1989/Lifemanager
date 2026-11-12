#!/bin/bash
# raw.sh sid N [maxsteps] (stdin = raw reply text, any JSON) -> write rN (+man), drive on
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26C
cd $R; mkdir -p man/$1; cat > man/$1/r$2.txt
python3 -c "
import json
json.loads(open('man/$1/r$2.txt').read())
open('man/$1/t$2.txt','w').write(json.load(open('$1/ai/p$2.json'))['user'].split('# نوبتِ تازه')[-1].strip())" || { echo BADJSON; exit 1; }
cp man/$1/r$2.txt $1/ai/r$2.txt
timeout ${T:-560} python3 tools/run.py $1 $3 2>&1 | cut -c1-${C:-700}
