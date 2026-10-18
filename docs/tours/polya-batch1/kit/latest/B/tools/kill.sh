#!/bin/bash
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22B
for p in $(pgrep -f "[h]arness5.js $B/$1\$"); do kill -9 $p; done
for p in $(pgrep -f "[d]rv.py $1( |\$)"); do kill $p; done
