#!/bin/bash
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/gatewt/apps/learning-architecture
python /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/gatewt/apps/learning-architecture/build.py >/dev/null 2>&1 || echo BUILD_FAIL
fail=0
for t in tests/test*.js; do r=$(timeout 600 node $t 2>&1); c=$?; if [ $c -eq 0 ]; then echo "PASS $t"; else echo "FAIL $t ($c) :: $(echo "$r" | tail -1 | cut -c1-200)"; fail=1; fi; done
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/gatewt
python -m pytest tests/ -q > ../gate_pytest_full.log 2>&1; pc=$?; tail -2 ../gate_pytest_full.log; [ $pc -eq 0 ] || fail=1
(cd frontend && npm run build 2>&1 | tail -2)
python apps/learning-architecture/tests/host/run_host_e2e.py 2>&1 | tail -2
echo GATE_DONE fail=$fail
