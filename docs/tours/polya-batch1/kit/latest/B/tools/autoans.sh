#!/bin/bash
# autoans.sh dir srcdir : answer pN from srcdir/rN.txt as they appear until out/s<last>.json or timeout
D=$1; S=$2; for i in $(seq 1 600); do
  for f in $D/ai/p*.json; do [ -e "$f" ] || continue; n=$(basename $f .json); n=${n#p}; [ -f $D/ai/r$n.txt ] && continue; if [ -f $S/r$n.txt ]; then sleep 1; cp $S/r$n.txt $D/ai/r$n.txt; echo "ans $n"; else echo "NOANS $n"; exit 3; fi; done
  [ -f $D/out/s$(ls $D/ctl | wc -l).json ] && { echo DONE; exit 0; }
  sleep 2; done
