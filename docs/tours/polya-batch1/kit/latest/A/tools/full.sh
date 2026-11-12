#!/bin/bash
# full.sh SID : fresh start + auto replay + loop; summary in SID/drive.out
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A
mkdir -p $R/$1; [ -f $R/../round26A/_old/$1/clock0 ] && cp $R/../round26A/_old/$1/clock0 $R/$1/
[ -f $R/../round26A/_old/$1/inject.js ] && ! cmp -s $R/../round26A/_old/$1/inject.js $R/tools/inject.js && echo "NOTE: custom inject.js in round26A/_old/$1" >> $R/$1/drive.out
bash $R/tools/go.sh $1
bash $R/tools/bg.sh $1 > /dev/null
echo FULLDONE >> $R/$1/drive.out
