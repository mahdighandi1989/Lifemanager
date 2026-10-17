cd /home/user/Lifemanager
git checkout --ours frontend/src/lib/llaBundle.js 2>/dev/null
for f in $(git status --short | grep -E '^(DD|AU|UA) ' | awk '{print $2}'); do git rm -q $f; done
python apps/learning-architecture/build.py >/dev/null 2>&1
git add -A apps/learning-architecture frontend/public/assets/lla frontend/src/lib/llaBundle.js docs
git status --short | grep -v '^??' | grep -v '^[AMDR] '
