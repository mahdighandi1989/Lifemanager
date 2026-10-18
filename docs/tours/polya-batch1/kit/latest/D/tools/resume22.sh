#!/bin/bash
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22D
s=$1; P=${2:-$R/$s.plan.json}
python3 $R/tools/drive22.py $s $P
