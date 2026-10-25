#!/bin/bash
# kill.sh sid -> kill my drive + harness for that sid (round25C only)
for p in $(ps aux | grep "[d]rive.py $1 " | grep -v kill.sh | awk '{print $2}'); do kill -9 $p 2>/dev/null; done
for p in $(ps aux | grep '[h]arness6c.js' | grep "round25C/$1\$" | awk '{print $2}'); do kill -9 $p 2>/dev/null; done
for p in $(ps aux | grep "[d]\.sh $1\$" | awk '{print $2}'); do kill -9 $p 2>/dev/null; done
