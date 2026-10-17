#!/bin/bash
# dall.sh sid — per prompt, diff vs round12 excluding known R12 rewrites (امروز/سکوت/معلم خیالی/date)
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round15D
for f in $(ls $R/$1/ai/p*.json | sort -V); do n=$(basename $f .json | tr -d p)
 echo "##### $1 p$n"; W=${W:-300} bash $R/tools/dd.sh $1 $n | grep -av "^---\|^[0-9,]*[acd][0-9,]*$\|هر تاریخی که کاربر\|سکوت، «نمی‌دونم»\|معلمِ خیالی\|^[<>] *$\|حافظهٔ سشن\|pb_l_\|^[<>] دستیار:\|^[<>] کاربر:" | head -${H:-30}
done
