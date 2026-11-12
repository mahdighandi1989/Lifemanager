#!/bin/bash
# fa.sh SID : findings body from stdin + auto sections (routing, mind, route, scan); writes findings.md, RESULT.txt
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A; S=$1; cd $R
cat > $S/findings.md
RT=$(python3 tools/route25.py $S | head -1); SC=$(python3 tools/scan7.py $S | tail -1)
{
echo; echo "## مسیرِ مدل (routing)"; echo "$RT (جدول در \`route_table.md\`)."
echo; echo "## پرونده، کارنامه، نقشهٔ مسیر (خودکار)"
echo "- کارنامه: $(sed 's/^EVAL: //' $S/phases26.txt 2>/dev/null | cut -c1-600)"
for f in $S/route26_*.txt; do [ -f "$f" ] && echo "- 🧭 $(basename $f): $(grep -m1 '^اکنون' $f | cut -c1-260)"; done
echo "- «امروز» در پایان: $(tail -n +2 $S/today26_end.txt 2>/dev/null | tr '\n' ';' | cut -c1-500)"
echo "- فایل‌ها: \`dossier26_*.txt\`، \`mind26_after.txt\`، شات‌ها در \`out/\` (پیش/پس: \`view_pre_*\`، \`view_post_*\`)."
echo; echo "## پویشِ دقیقِ پرامپت"; echo "- scan7 (دو دستورِ پرسشیِ ناهم‌سو در یک پرامپت): $SC."
} >> $S/findings.md
grep -m1 '^RESULT:' $S/findings.md > $S/RESULT.txt; wc -c $S/findings.md; cat $S/RESULT.txt
