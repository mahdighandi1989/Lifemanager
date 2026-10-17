#!/bin/bash
# go2.sh sid : run auto; print compact diff
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round16B
cd $B; timeout 1700 tools/auto.sh $1 > auto_$1.log 2>&1; echo "rc=$?"
grep -n "AUTO\|END\|NEEDMAP\|STOPAT\|ERROR\|still waiting" auto_$1.log | tail -n 8 | cut -c1-200
sed -n '/##### DIFF/,$p' auto_$1.log | grep -v "گزارشِ وضع\|سطحِ استقلال\|حلی که در همین\|پایانِ نردبانِ سرنخ" | cut -c1-${CW:-700}
