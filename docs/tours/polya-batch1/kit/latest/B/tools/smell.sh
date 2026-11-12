#!/bin/bash
# smell.sh sid : raw-label / leak scan over post.txt and the visible chat (sys lines)
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B; cd $B; s=$1
grep -n "undefined\|NaN\|\[object\|null\b\|لو نده\|pb_l_[a-z0-9]\{6\}\|achat_[a-z0-9]\{6\}\|it[0-9]_[a-z0-9]\{4\}\|20[0-9][0-9]-[01][0-9]-[0-3][0-9]\|chkM\|coach_state" $s/post.txt | cut -c1-220 | head -${2:-12}
python3 tools/rv.py $s | grep "sys:" | grep "undefined\|NaN\|pb_l_\|achat_\|20[0-9][0-9]-[01][0-9]\|null" | cut -c1-240 | head -5
