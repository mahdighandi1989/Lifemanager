#!/bin/bash
# blk.sh sid -> last AI block of last.txt (diff + r24 answer), compact
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C
awk '/^### AI p/{buf=""} {buf=buf"\n"$0} END{print buf}' $1/last.txt | grep -v -E "^    - زمینه \(نه پرسشِ دوم\)( — شیوه|: (سکوت|ادعای محل|شکل|به تعریف|ضمیرِ))" | cut -c1-${W:-700}
