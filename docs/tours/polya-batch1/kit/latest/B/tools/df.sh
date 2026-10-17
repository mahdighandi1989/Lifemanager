#!/bin/bash
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya
cd $B/round15B; N='s/20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]/DATE/g; s/pb_[a-z]_[a-z0-9]+/PBID/g; s/پرسشِ این نوبت یک پرسشِ بازنگری است \(همان بالا\)/یک پرسشِ بازنگری بپرس (همان پرسشِ این نوبت)/; s/«خودم حلش کردم» یعنی خودِ او — بپرس یادگیرنده کجاست و کدام پرسش را از او پرسید.//; s/ //g'
diff <(W=3000 python3 tools/v2.py ../round14B/$1/ai/p$2.json | sed -E "$N" | grep -v "اینگفت‌وگوبههمینمسئلهبستهاست") <(W=3000 python3 tools/v2.py $1/ai/p$2.json | sed -E "$N" | grep -v "اینگفت‌وگوبههمینمسئلهبستهاست") && echo "SAME-HOOK p$2"
