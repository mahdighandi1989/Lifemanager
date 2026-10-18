#!/bin/bash
# v.sh sid -> concise view of pending prompt: outs since last AI, diff (filtered), q.py
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23C
grep -E "^(###|TURN|---|   [-+]|!!!|  (error|eval|log)|   MSG)" $1/last.txt | grep -v -E "گزارشِ وضع \(همهٔ|^   [-+]$|^   \+# فرمول|اگر فرمول می‌نویسی|در actions یک \{\"do\":\"coach_state\"" | cut -c1-${W:-450} | tail -${N:-40}
n=$(ls $1/ai/p*.json | sed 's/.*\/p//;s/.json//' | sort -n | tail -1)
python3 tools/q.py $1 $n | cut -c1-700
python3 tools/scan2.py $1 $n | tail -n +2
