#!/bin/bash
# v.sh sid -> compact view of the pending turn
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C
awk '/^### AI p/{buf=""} {buf=buf"\n"$0} END{print buf}' $1/last.txt | grep -E "^(### AI|TURN|!!!|R6 ANSWER|MAP|   [-+]|    - \*\*پرسشِ این نوبت)" | grep -v -E "مفهومِ مشخصی|نقشهٔ مسیرم|^   [-+]$|سلیقه و درنگ|ضرب‌المثلِ همین|شیوهٔ همان یک پرسشِ|زمینه \(نه پرسشِ دوم\): (شکل|به تعریف|سکوت|ادعای محل)" | cut -c1-${W:-600}
