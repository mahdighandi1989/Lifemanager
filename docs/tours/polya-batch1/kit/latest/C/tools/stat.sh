#!/bin/bash
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24C
for s in ${@:-s21 s22 s23 s24 s25 s26 s27 s28 s29}; do r=$(ps aux | grep "[d]rive.py $s " | wc -l); L=$(ls -t $s/drive_*.log 2>/dev/null | head -1); echo "== $s run=$r $(cat $s/drv.json) | $(grep -E '^(### AI|!!!|END|TIMEOUT)' $L 2>/dev/null | tail -2 | tr '\n' ' ' | cut -c1-150)"; done
