#!/bin/bash
# chain.sh sid... -> run each scenario's replay in turn; stop at the first that needs a manual reply
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27C
cd $R
for s in "$@"; do
  echo "=== $s $(date +%T)" >> chain.log
  timeout 3000 python3 tools/run.py $s > $s.run.log 2>&1
  if grep -q '^### AI' $s.run.log; then echo "PENDING $s" >> chain.log; exit 0; fi
  if ! grep -q 'END of ctls' $s.run.log; then echo "STOPPED $s" >> chain.log; exit 0; fi
  echo "ENDED $s $(date +%T)" >> chain.log
done
echo CHAIN_DONE >> chain.log
