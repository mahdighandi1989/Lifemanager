#!/bin/bash
# auto.sh -> loop: system-turn pendings whose only diff is the system line -> remap+continue; stop & print when a real pending is found
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C
t0=$(date +%s)
while [ $(( $(date +%s)-t0 )) -lt ${1:-900} ]; do
  for s in ${SIDS:-s21 s22 s23 s24 s25 s26 s27 s28 s29}; do
    [ -d $s/ai ] || continue
    r=$(ps aux | grep "[d]rive.py $s " | wc -l); [ $r -gt 0 ] && continue
    n=$(ls $s/ai/p*.json 2>/dev/null | sed 's/.*\/p//;s/.json//' | sort -n | tail -1)
    [ -n "$n" ] && [ ! -f $s/ai/r$n.txt ] || continue
    blk=$(awk '/^### AI p/{buf=""} {buf=buf"\n"$0} END{print buf}' $s/last.txt)
    nd=$(echo "$blk" | grep -E "^   [-+]" | grep -v -E '^   [-+]- زمینه \(نه پرسشِ دوم\): (در actions یک|ضمیرِ گفت)' | grep -v -E '^   [-+]\[سامانه' | grep -v -E '^   [-+]- زمینه \(نه پرسشِ دوم\): چهار مرحلهٔ حل' | grep -v -E '^   [-+]- ضرب‌المثلِ همین مرحله' | grep -v -E '^   [-+]# مسئلهٔ حل‌شدهٔ مرتبط' | grep -v -E '^   -(# درخواستِ عقب‌افتاده|- زمینه \(نه پرسشِ دوم\): در پیامِ پیشینش)' | grep -v -E '^   [-+]$' | wc -l)
    if ! echo "$blk" | grep -q "STOP-REVIEW" && [ $nd = 0 ] && [ -f ../round24C/$s/ai/r$n.txt ]; then
      echo "$blk" | grep -E "^   [-+]" >> $s/auto.log; python3 tools/remap.py $s $n >> $s/auto.log; echo "$s p$n remapped" >> $s/auto.log
      (T=900 W=300 tools/d.sh $s > $s/last.txt 2>&1 &); sleep 2; continue
    fi
    echo "PENDING $s p$n"; exit
  done
  sleep 4
done
echo timeout
