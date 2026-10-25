#!/bin/bash
# killme.sh [sid] -> kill only round25C harness/drive processes [for one sid]
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C
S="$1"
for p in $(pgrep -f "harness6c|drive.py|d.sh"); do
  a=$(tr '\0' ' ' < /proc/$p/cmdline 2>/dev/null); c=$(readlink /proc/$p/cwd 2>/dev/null)
  case "$a" in node\ *harness6c.js*|python3\ tools/drive.py*|timeout\ *drive.py*|/bin/bash\ tools/d.sh*) ;; *) continue;; esac
  if [[ "$a" == *"$R/$S"* ]] || { [[ "$c" == "$R" ]] && [[ -z "$S" || " $a " == *" $S "* ]]; }; then kill $p 2>/dev/null && echo "killed $p ${a:0:90}"; fi
done
