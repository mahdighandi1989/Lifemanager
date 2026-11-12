#!/bin/bash
# reset.sh sid -> kill ALL my harness processes for sid (pids recorded in pids.txt, cmdline checked) and wipe its run dir (keeps src, man)
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26C
for p in $(sort -u $R/pids.txt); do
  a=$( (tr "\0" " " < /proc/$p/cmdline) 2>/dev/null)
  case "$a" in *h26c.js*round26C/$1\ *|*h26c.js*round26C/$1) kill $p 2>/dev/null; sleep 1; kill -9 $p 2>/dev/null; echo "killed $p";; esac
done
sleep 1; rm -rf $R/$1; echo reset $1
