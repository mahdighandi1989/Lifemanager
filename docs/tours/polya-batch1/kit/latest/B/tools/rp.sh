#!/bin/bash
# usage: rp.sh <sid> <k> : replay round14B/<sid>/ctl/c<k>.json as next ctl; MAPFILE <sid>/map.txt lines "old new" substituted
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya
cd $B/round15B; src=${SRC:-$B/round14B/$1/ctl}/c$2.json; [ -f $B/round15B/$1/ovr/c$2.json ] && src=$B/round15B/$1/ovr/c$2.json; cp $src $1/_c.json
if [ -f $1/map.txt ]; then while read a b; do sed -i "s/$a/$b/g" $1/_c.json; done < $1/map.txt; fi
python3 tools/step.py $1 $1/_c.json > tmp_$1.txt; echo "exit=$?"; cat tmp_$1.txt
